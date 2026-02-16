import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenancy/tenant.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.productsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.productsService.findOne(req.user.tenantId, id);
  }
}
