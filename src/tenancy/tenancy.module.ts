import { Module, Global } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { TenantGuard } from './tenant.guard';
import { TenantInterceptor } from './tenant.interceptor';

@Global()
@Module({
  providers: [TenancyService, TenantGuard, TenantInterceptor],
  exports: [TenancyService, TenantGuard, TenantInterceptor],
})
export class TenancyModule {}
