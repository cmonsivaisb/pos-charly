import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PriceInputMode } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  packaging?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  supplierName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  warehouseLocation?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ enum: PriceInputMode })
  @IsEnum(PriceInputMode)
  priceInputMode: PriceInputMode;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  inputValue: number; // El precio que el usuario captura

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  ivaRate?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  trackStock?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  stock?: number;
}

export class UpdateProductDto extends CreateProductDto {}
