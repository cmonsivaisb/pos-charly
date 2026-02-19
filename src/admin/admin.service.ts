import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async findAllTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, products: true, sales: true },
        },
      },
    });
  }

  async getStats() {
    const [tenants, sales, products] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.sale.count(),
      this.prisma.product.count(),
    ]);

    return {
      tenants,
      sales,
      products,
    };
  }

  async updateTenantStatus(id: string, status: SubscriptionStatus, reason?: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.prisma.tenant.update({
      where: { id },
      data: {
        subscriptionStatus: status,
        suspendedReason: reason,
        suspendedAt: status === SubscriptionStatus.SUSPENDED ? new Date() : null,
      },
    });
  }
}
