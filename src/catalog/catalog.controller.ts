import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('products')
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getProducts(
    @Query('query') query?: string,
    @Query('category') categorySlug?: string,
    @Query('brand') brand?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.catalogService.getProducts(
      query,
      categorySlug,
      brand,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 24,
    );
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProduct(id);
  }

  @Get('packs')
  getPacks() {
    return this.catalogService.getPacks();
  }
}
