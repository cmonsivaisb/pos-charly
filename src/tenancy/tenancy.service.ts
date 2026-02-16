import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenancyService {
  constructor(private prisma: PrismaService) {}

  async getTenant(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  }

  async updateTenant(tenantId: string, data: any) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }
}
