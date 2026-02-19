import { Controller, Post, Body, UseGuards, Param, Patch, UploadedFile, UseInterceptors, Get, Query } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { ManualPaymentService } from './manual-payment.service';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ManualPaymentStatus } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { CreateMPPreferenceDto, CreateManualPaymentDto, ApproveManualPaymentDto, RejectManualPaymentDto } from './dto/payment-request.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly mpService: MercadoPagoService,
    private readonly manualService: ManualPaymentService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener estado de suscripción del tenant' })
  async getStatus(@GetUser() user: any) {
    return this.paymentsService.getStatus(user.tenantId);
  }

  // --- MERCADO PAGO ---

  @Post('mercadopago/create-preference')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear preferencia de pago en Mercado Pago' })
  async createPreference(@Body() dto: CreateMPPreferenceDto, @GetUser() user: any) {
    return this.mpService.createPreference(dto, user.tenantId);
  }

  @Post('mercadopago/webhook')
  @ApiOperation({ summary: 'Webhook de Mercado Pago' })
  async webhook(@Body() payload: any) {
    return this.mpService.handleWebhook(payload);
  }

  // --- PAGO MANUAL ---

  @Post('manual/requests')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear solicitud de pago manual' })
  async createManualRequest(@Body() dto: CreateManualPaymentDto, @GetUser() user: any) {
    return this.manualService.createRequest(dto, user.tenantId);
  }

  @Post('manual/requests/:id/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir comprobante de pago manual' })
  async uploadEvidence(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
  ) {
    return this.manualService.uploadEvidence(id, file, user.tenantId);
  }

  @Get('manual/my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar mis solicitudes de pago manual' })
  async getMyRequests(@GetUser() user: any) {
    return this.manualService.getTenantRequests(user.tenantId);
  }

  // --- BACKOFFICE (ADMIN) ---

  @Get('admin/manual-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Listar todas las solicitudes (Admin)' })
  async getAllManualRequests(@Query('status') status?: ManualPaymentStatus) {
    return this.manualService.findAll(status);
  }

  @Patch('admin/manual-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Aprobar pago manual (Admin)' })
  async approveManual(@Param('id') id: string, @Body() dto: ApproveManualPaymentDto) {
    return this.manualService.approve(id, dto.comment);
  }

  @Patch('admin/manual-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Rechazar pago manual (Admin)' })
  async rejectManual(@Param('id') id: string, @Body() dto: RejectManualPaymentDto) {
    return this.manualService.reject(id, dto.comment);
  }
}
