import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, SubscriptionStatus } from '@prisma/client';

@ApiTags('Platform Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PLATFORM_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tenants')
  @ApiOperation({ summary: 'List all tenants' })
  findAllTenants() {
    return this.adminService.findAllTenants();
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Get tenant details' })
  findTenantById(@Param('id') id: string) {
    return this.adminService.findTenantById(id);
  }

  @Patch('tenants/:id/subscription')
  @ApiOperation({ summary: 'Update tenant subscription status' })
  updateSubscription(
    @Param('id') id: string,
    @Body()
    dto: {
      status?: SubscriptionStatus;
      trialEndsAt?: Date;
      suspendedReason?: string;
    },
    @Request() req: any,
  ) {
    return this.adminService.updateSubscription(id, dto, req.user.userId);
  }
}
