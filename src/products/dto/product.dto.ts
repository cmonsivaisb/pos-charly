import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsEnum,
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
}

export class UpdateProductDto extends CreateProductDto {}
