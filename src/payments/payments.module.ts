import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MercadoPagoService } from './mercadopago.service';
import { ManualPaymentService } from './manual-payment.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService, ManualPaymentService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
