import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tenancy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Get('settings')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getSettings(@GetUser() user: any) {
    return this.tenancyService.getTenant(user.tenantId);
  }

  @Patch('settings')
  @Roles(UserRole.ADMIN)
  updateSettings(@GetUser() user: any, @Body() data: any) {
    return this.tenancyService.updateTenant(user.tenantId, data);
  }
}
