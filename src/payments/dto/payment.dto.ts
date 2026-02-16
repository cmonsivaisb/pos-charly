import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  reference?: string;

  @ApiProperty()
  @IsString()
  method: string; // PAYPAL, MANUAL
}

export class ManualPaymentRequestDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsString()
  notes: string;
}
