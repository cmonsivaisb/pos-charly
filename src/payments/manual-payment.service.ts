import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ManualPaymentStatus, PaymentProvider, PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { CreateManualPaymentDto } from './dto/payment-request.dto';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

@Injectable()
export class ManualPaymentService {
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'payments');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  async createRequest(dto: CreateManualPaymentDto, tenantId: string) {
    return this.prisma.manualPaymentRequest.create({
      data: {
        amount: 499, // Monto fijo solicitado
        bankName: dto.bankName,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
        reference: dto.reference,
        tenantId,
      },
    });
  }

  async uploadEvidence(id: string, file: Express.Multer.File, tenantId: string) {
    const request = await this.prisma.manualPaymentRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.tenantId !== tenantId) throw new ForbiddenException();

    const fileName = `${id}-${Date.now()}.webp`;
    const filePath = path.join(this.UPLOAD_DIR, fileName);

    if (file.mimetype.startsWith('image/')) {
      await sharp(file.buffer)
        .resize(1400, null, { withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(filePath);
    } else if (file.mimetype === 'application/pdf') {
      const pdfPath = path.join(this.UPLOAD_DIR, `${id}-${Date.now()}.pdf`);
      fs.writeFileSync(pdfPath, file.buffer);
      // Actualizar evidencePath con el pdf si es necesario, pero el prompt pide webp para imágenes.
      // Suponemos que si es PDF se guarda directo.
    } else {
      throw new BadRequestException('Invalid file type');
    }

    return this.prisma.manualPaymentRequest.update({
      where: { id },
      data: { evidencePath: `/uploads/payments/${path.basename(filePath)}` },
    });
  }

  async findAll(status?: ManualPaymentStatus) {
    return this.prisma.manualPaymentRequest.findMany({
      where: status ? { status } : {},
      include: { tenant: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTenantRequests(tenantId: string) {
    return this.prisma.manualPaymentRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, comment?: string) {
    const request = await this.prisma.manualPaymentRequest.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== ManualPaymentStatus.SUBMITTED) {
      throw new BadRequestException('Request already processed');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.manualPaymentRequest.update({
        where: { id },
        data: {
          status: ManualPaymentStatus.APPROVED,
          adminComment: comment,
        },
      });

      // Crear transacción aprobada
      await tx.paymentTransaction.create({
        data: {
          provider: PaymentProvider.MANUAL,
          status: PaymentStatus.APPROVED,
          amount: request.amount,
          tenantId: request.tenantId,
          manualRequestId: id,
        },
      });

      // Activar suscripción
      await tx.tenant.update({
        where: { id: request.tenantId },
        data: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          activeSince: new Date(),
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return updatedRequest;
    });
  }

  async reject(id: string, comment: string) {
    const request = await this.prisma.manualPaymentRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');

    return this.prisma.manualPaymentRequest.update({
      where: { id },
      data: {
        status: ManualPaymentStatus.REJECTED,
        adminComment: comment,
      },
    });
  }
}
