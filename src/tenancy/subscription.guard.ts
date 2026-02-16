import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant; // Inyectado por TenantGuard

    if (!tenant) {
      throw new ForbiddenException('Tenant context required');
    }

    if (tenant.subscriptionStatus === SubscriptionStatus.SUSPENDED) {
      throw new ForbiddenException(
        `Tu cuenta ha sido suspendida. Motivo: ${tenant.suspendedReason || 'Desconocido'}. Por favor, contacta a soporte.`,
      );
    }

    return true;
  }
}
