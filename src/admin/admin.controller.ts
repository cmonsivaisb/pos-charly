import { Controller, Get, Param, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PLATFORM_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tenants')
  @ApiOperation({ summary: 'Listar todos los tenants' })
  async findAllTenants() {
    return this.adminService.findAllTenants();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas globales' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Patch('tenants/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de suscripción de un tenant' })
  async updateTenantStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.updateTenantStatus(id, status, reason);
  }
}
