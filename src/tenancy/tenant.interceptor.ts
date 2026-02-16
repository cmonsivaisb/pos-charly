import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    if (tenantId) {
      // Aquí podríamos inyectar el tenantId en un servicio de contexto global 
      // si quisiéramos automatizar el filtrado de Prisma.
      // Por ahora, lo dejamos en el request para que los controladores lo usen.
    }

    return next.handle();
  }
}
