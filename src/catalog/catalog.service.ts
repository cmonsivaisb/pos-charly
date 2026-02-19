import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.catalogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getProducts(
    query?: string,
    categorySlug?: string,
    brand?: string,
    page = 1,
    limit = 24,
  ) {
    const where: Prisma.CatalogProductWhereInput = { isActive: true };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { catalogCode: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug };
    }

    if (brand) {
      where.brand = brand;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.catalogProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { category: true },
      }),
      this.prisma.catalogProduct.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.catalogProduct.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Catalog product not found');
    return product;
  }

  async getPacks() {
    return this.prisma.catalogPack.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            catalogProduct: true,
          },
        },
      },
    });
  }
}
