import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenancy/tenant.guard';
import { SubscriptionGuard } from '../tenancy/subscription.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.tenantId, dto);
  }

  @Post('import-from-catalog/:catalogProductId')
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Import a product from global catalog' })
  importFromCatalog(
    @Request() req: any,
    @Param('catalogProductId') catalogProductId: string,
    @Body() overrides: any,
  ) {
    return this.productsService.importFromCatalog(req.user.tenantId, catalogProductId, overrides);
  }

  @Post('import-pack/:packCode')
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Import a pack from global catalog' })
  importPack(
    @Request() req: any,
    @Param('packCode') packCode: string,
    @Body() body: { mode: 'MERGE' | 'REPLACE' },
  ) {
    return this.productsService.importPack(req.user.tenantId, packCode, body.mode);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.productsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.productsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @UseGuards(SubscriptionGuard)
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @UseGuards(SubscriptionGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.productsService.remove(req.user.tenantId, id);
  }
}
