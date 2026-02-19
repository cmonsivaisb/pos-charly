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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
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

  @Post(':id/image')
  @UseGuards(SubscriptionGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file, cb) => {
          const tenantId = req.user.tenantId;
          const uploadPath = join(process.cwd(), 'uploads', 'tenants', tenantId, 'products');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    // Relative path for frontend serving
    const relativePath = `uploads/tenants/${req.user.tenantId}/products/${file.filename}`;
    return this.productsService.updateImagePath(req.user.tenantId, id, relativePath);
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
