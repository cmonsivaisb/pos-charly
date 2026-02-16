import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async findAllTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateSubscription(
    tenantId: string,
    data: {
      status?: SubscriptionStatus;
      trialEndsAt?: Date;
      suspendedReason?: string;
    },
    adminId: string,
  ) {
    const oldTenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!oldTenant) throw new NotFoundException('Tenant not found');

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: data.status,
        trialEndsAt: data.trialEndsAt,
        suspendedReason: data.suspendedReason,
        suspendedAt: data.status === SubscriptionStatus.SUSPENDED ? new Date() : null,
      },
    });

    // Auditoría
    await this.prisma.auditLog.create({
      data: {
        action: 'SUBSCRIPTION_STATUS_CHANGED',
        entity: 'Tenant',
        entityId: tenantId,
        userId: adminId,
        tenantId: tenantId,
        payload: {
          from: oldTenant.subscriptionStatus,
          to: updatedTenant.subscriptionStatus,
          reason: data.suspendedReason,
        },
      },
    });

    return updatedTenant;
  }
}
