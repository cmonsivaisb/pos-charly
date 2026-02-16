import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenancy/tenant.guard';

@ApiTags('Subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('subscription')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('status')
  getStatus(@Request() req: any) {
    return this.paymentsService.getStatus(req.user.tenantId);
  }

  @Post('activate-trial')
  activateTrial(@Request() req: any) {
    return this.paymentsService.activateSubscription(req.user.tenantId);
  }
}
