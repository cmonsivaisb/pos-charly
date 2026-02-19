import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async activateSubscription(tenantId: string) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        activeSince: new Date(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
      },
    });
  }

  async getStatus(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionStatus: true,
        trialEndsAt: true,
        nextPaymentDate: true,
      },
    });
    return tenant;
  }
}
