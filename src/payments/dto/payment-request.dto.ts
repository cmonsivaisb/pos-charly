import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EntityType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  SALE = 'SALE',
}

export class CreateMPPreferenceDto {
  @ApiProperty({ enum: EntityType })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  description: string;
}

export class CreateManualPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  paymentDate?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  reference?: string;
}

export class ApproveManualPaymentDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  comment?: string;
}

export class RejectManualPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  comment: string;
}
