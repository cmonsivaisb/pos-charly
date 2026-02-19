import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PriceInputMode } from '@prisma/client';
import { Decimal } from 'decimal.js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    const { inputValue, ...data } = dto;
    const { priceBase, priceTotal } = this.calculatePrices(
      inputValue,
      dto.priceInputMode,
      dto.ivaRate || 0.16,
    );

    return this.prisma.product.create({
      data: {
        ...data,
        priceBase,
        priceTotal,
        ivaRate: dto.ivaRate || 0.16,
        tenantId,
      },
    });
  }

  async updateImagePath(tenantId: string, id: string, imagePath: string) {
    const product = await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id: product.id },
      data: { imagePath },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    const product = await this.findOne(tenantId, id);
    const { inputValue, ...data } = dto;

    const { priceBase, priceTotal } = this.calculatePrices(
      inputValue,
      dto.priceInputMode,
      dto.ivaRate || 0.16,
    );

    return this.prisma.product.update({
      where: { id: product.id },
      data: {
        ...data,
        priceBase,
        priceTotal,
        ivaRate: dto.ivaRate || 0.16,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: { category: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(tenantId: string, id: string) {
    const product = await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id: product.id },
      data: { isActive: false },
    });
  }

  async importFromCatalog(tenantId: string, catalogProductId: string, overrides: any = {}) {
    // 1. Check if already imported
    const existing = await this.prisma.product.findFirst({
      where: { tenantId, catalogProductId },
    });
    if (existing) {
      throw new ConflictException('Product already imported from catalog');
    }

    // 2. Fetch catalog product
    const catalogProduct = await this.prisma.catalogProduct.findUnique({
      where: { id: catalogProductId },
      include: { category: true },
    });
    if (!catalogProduct) throw new NotFoundException('Catalog product not found');

    // 3. Prepare data
    // Use overrides or catalog defaults
    const priceInputMode = overrides.priceInputMode || catalogProduct.priceInputMode;
    const ivaRate = overrides.ivaRate ?? Number(catalogProduct.ivaRate);
    const inputValue = overrides.priceTotal ?? Number(catalogProduct.priceTotal); // Assuming user inputs Total usually

    const prices = this.calculatePrices(inputValue, priceInputMode, ivaRate);

    // Create product
    const newProduct = await this.prisma.product.create({
      data: {
        tenantId,
        catalogProductId: catalogProduct.id,
        name: overrides.name || catalogProduct.name,
        brand: catalogProduct.brand,
        // Generate SKU if not provided? Or leave null
        sku: overrides.sku || catalogProduct.catalogCode, 
        barcode: overrides.barcode || catalogProduct.barcode,
        description: `${catalogProduct.variant ? catalogProduct.variant + ' ' : ''}${catalogProduct.sizeValue}${catalogProduct.sizeUnit}`,
        packaging: catalogProduct.unit,
        tags: catalogProduct.tags,
        
        costPrice: overrides.costPrice || 0,
        priceInputMode,
        ivaRate,
        priceBase: prices.priceBase,
        priceTotal: prices.priceTotal,
        
        stock: overrides.initialStock || 0,
        trackStock: true,
      },
    });
    
    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'PRODUCT_IMPORTED_FROM_CATALOG',
        entity: 'Product',
        entityId: newProduct.id,
        payload: { catalogProductId, overrides },
      }
    });

    return newProduct;
  }

  async importPack(tenantId: string, packCode: string, mode: 'MERGE' | 'REPLACE' = 'MERGE') {
    const pack = await this.prisma.catalogPack.findUnique({
      where: { code: packCode },
      include: { items: { include: { catalogProduct: true } } },
    });
    if (!pack) throw new NotFoundException('Pack not found');

    const results = [];

    for (const item of pack.items) {
      const existing = await this.prisma.product.findFirst({
        where: { tenantId, catalogProductId: item.catalogProductId },
      });

      if (existing) {
        if (mode === 'REPLACE') {
           // Logic to reset product to catalog defaults? For now just skip or update stock?
           // Requirement says "Importar", usually implies creating if missing.
           // Replace logic might be too destructive for active products (sales history).
           // Let's stick to "Skip if exists" for MERGE, and maybe update basics for REPLACE?
           // For safety MVP: MERGE = create if missing. REPLACE = not implemented fully or same as MERGE.
           results.push({ status: 'skipped', name: item.catalogProduct.name });
        } else {
           results.push({ status: 'skipped', name: item.catalogProduct.name });
        }
      } else {
        // Import
        await this.importFromCatalog(tenantId, item.catalogProductId, { initialStock: item.quantity }); // Use pack qty as initial stock?
        results.push({ status: 'imported', name: item.catalogProduct.name });
      }
    }
    
    return { pack: pack.name, results };
  }

  private calculatePrices(
    input: number,
    mode: PriceInputMode,
    ivaRate: number,
  ) {
    const val = new Decimal(input);
    const rate = new Decimal(ivaRate);
    let priceBase: Decimal;
    let priceTotal: Decimal;

    if (mode === PriceInputMode.INCLUDES_TAX) {
      priceTotal = val;
      priceBase = priceTotal.div(rate.plus(1));
    } else {
      priceBase = val;
      priceTotal = priceBase.mul(rate.plus(1));
    }

    return {
      priceBase: priceBase.toDecimalPlaces(2).toNumber(),
      priceTotal: priceTotal.toDecimalPlaces(2).toNumber(),
    };
  }
}
