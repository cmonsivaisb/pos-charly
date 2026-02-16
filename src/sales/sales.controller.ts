import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenancy/tenant.guard';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateSaleDto) {
    return this.salesService.create(req.user.userId, req.user.tenantId, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.salesService.findAll(req.user.tenantId);
  }
}
