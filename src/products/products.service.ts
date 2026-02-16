import { Injectable, NotFoundException } from '@nestjs/common';
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
