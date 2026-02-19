import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { CreateMPPreferenceDto } from './dto/payment-request.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider, PaymentStatus, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private client: MercadoPagoConfig;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    if (accessToken) {
      this.client = new MercadoPagoConfig({
        accessToken,
        options: { timeout: 5000 },
      });
    }
  }

  async createPreference(dto: CreateMPPreferenceDto, tenantId: string) {
    if (!this.client) {
      throw new InternalServerErrorException('El sistema de pagos con Mercado Pago no está configurado. Por favor, contacta al administrador.');
    }
    const preference = new Preference(this.client);
    const external_reference = `${dto.entityType}:${dto.entityId}`;

    const response = await preference.create({
      body: {
        items: [
          {
            id: dto.entityId,
            title: dto.description,
            unit_price: dto.amount,
            quantity: 1,
            currency_id: 'MXN',
          },
        ],
        external_reference,
        back_urls: {
          success: `${this.configService.get('FRONTEND_URL')}/dashboard/subscription?status=success`,
          failure: `${this.configService.get('FRONTEND_URL')}/dashboard/subscription?status=failure`,
          pending: `${this.configService.get('FRONTEND_URL')}/dashboard/subscription?status=pending`,
        },
        auto_return: 'approved',
        notification_url: this.configService.get('MP_WEBHOOK_URL'),
      },
    });

    // Registrar transacción pendiente
    await this.prisma.paymentTransaction.create({
      data: {
        provider: PaymentProvider.MERCADOPAGO,
        amount: dto.amount,
        status: PaymentStatus.PENDING,
        tenantId,
        metadata: response as any,
      },
    });

    return { init_point: response.init_point };
  }

  async handleWebhook(payload: any) {
    this.logger.log(`Received MP webhook: ${JSON.stringify(payload)}`);

    if (payload.type === 'payment') {
      const paymentId = payload.data.id;
      const payment = new Payment(this.client);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === 'approved') {
        const external_reference = paymentData.external_reference;
        if (!external_reference) return;

        const [entityType, entityId] = external_reference.split(':');

        // Idempotencia: Verificar si ya procesamos este pago
        const existingTx = await this.prisma.paymentTransaction.findUnique({
          where: {
            provider_providerPaymentId: {
              provider: PaymentProvider.MERCADOPAGO,
              providerPaymentId: paymentId.toString(),
            },
          },
        });

        if (existingTx && existingTx.status === PaymentStatus.APPROVED) {
          this.logger.log(`Payment ${paymentId} already processed.`);
          return;
        }

        // Transacción DB
        await this.prisma.$transaction(async (tx) => {
          // Buscar transacción pendiente o crearla
          await tx.paymentTransaction.upsert({
            where: {
              provider_providerPaymentId: {
                provider: PaymentProvider.MERCADOPAGO,
                providerPaymentId: paymentId.toString(),
              },
            },
            update: {
              status: PaymentStatus.APPROVED,
              metadata: paymentData as any,
            },
            create: {
              provider: PaymentProvider.MERCADOPAGO,
              providerPaymentId: paymentId.toString(),
              status: PaymentStatus.APPROVED,
              amount: paymentData.transaction_amount || 0,
              tenantId: await this.getTenantIdFromEntity(entityType, entityId),
              metadata: paymentData as any,
            },
          });

          if (entityType === 'SUBSCRIPTION') {
            await tx.tenant.update({
              where: { id: entityId },
              data: {
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                activeSince: new Date(),
                nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
          }
        });

        this.logger.log(`Payment ${paymentId} approved and entity ${entityId} updated.`);
      }
    }
  }

  private async getTenantIdFromEntity(type: string, id: string): Promise<string> {
    if (type === 'SUBSCRIPTION') return id;
    if (type === 'SALE') {
      const sale = await this.prisma.sale.findUnique({ where: { id } });
      return sale?.tenantId || '';
    }
    return '';
  }
}
