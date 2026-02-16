import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      return false;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    // Aislamiento de tenant: adjuntar tenant al request para uso posterior
    request.tenant = tenant;

    return true;
  }
}
