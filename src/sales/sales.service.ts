import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/sale.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, tenantId: string, dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      let totalBase = new Decimal(0);
      let totalIva = new Decimal(0);
      let total = new Decimal(0);

      const saleItemsData = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.tenantId !== tenantId) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        if (product.trackStock && product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }

        const unitPrice = new Decimal(item.unitPrice);
        const quantity = new Decimal(item.quantity);
        const subtotal = unitPrice.mul(quantity);
        
        // El precio ya incluye IVA o se le suma según el producto, 
        // pero para simplificar el MVP usaremos la tasa del producto.
        const ivaRate = new Decimal(product.ivaRate);
        const itemIva = subtotal.mul(ivaRate).div(ivaRate.plus(1)); // Si el precio incluye IVA
        const itemBase = subtotal.minus(itemIva);

        totalBase = totalBase.plus(itemBase);
        totalIva = totalIva.plus(itemIva);
        total = total.plus(subtotal);

        saleItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: itemBase.toNumber(),
          ivaAmount: itemIva.toNumber(),
          total: subtotal.toNumber(),
        });

        // Update stock
        if (product.trackStock) {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const sale = await tx.sale.create({
        data: {
          tenantId,
          userId,
          customerId: dto.customerId,
          paymentMethod: dto.paymentMethod,
          totalBase: totalBase.toNumber(),
          totalIva: totalIva.toNumber(),
          total: total.toNumber(),
          items: {
            create: saleItemsData,
          },
        },
        include: { items: true },
      });

      return sale;
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId },
      include: { items: true, customer: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [salesToday, stockSum, totalCustomers, recentSales] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          tenantId,
          createdAt: { gte: today },
          status: 'COMPLETED',
        },
        _sum: { total: true },
      }),
      this.prisma.product.aggregate({
        where: { tenantId, isActive: true },
        _sum: { stock: true },
      }),
      this.prisma.customer.count({
        where: { tenantId },
      }),
      this.prisma.sale.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          folio: true,
          total: true,
          status: true,
        },
      }),
    ]);

    return {
      todaySales: salesToday._sum.total || 0,
      productCount: stockSum._sum.stock || 0,
      customerCount: totalCustomers,
      recentSales,
    };
  }
}
