import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PaymentProvider, PaymentStatus, ManualPaymentStatus, SubscriptionStatus } from '@prisma/client';

describe('Payments (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Login para obtener token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com', // Asumiendo que existe por seed
        password: 'password123',
      });
    
    accessToken = loginRes.body.accessToken;
    tenantId = loginRes.body.user.tenantId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Manual Payment Flow', () => {
    let requestId: string;

    it('should create a manual payment request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/manual/requests')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: '499.00',
          bankName: 'Test Bank',
          reference: 'REF123',
        })
        .expect(201);

      requestId = res.body.id;
      expect(res.body.status).toBe(ManualPaymentStatus.SUBMITTED);
    });

    it('should approve a manual payment request and activate subscription', async () => {
      // Necesitamos un token de PLATFORM_ADMIN para aprobar
      // Para efectos del test, usaremos el mismo si el usuario del seed tiene ese rol o crearemos uno.
      // Suponemos que el admin@test.com tiene permisos o usamos bypass.
      
      await request(app.getHttpServer())
        .patch(`/api/payments/admin/manual-requests/${requestId}/approve`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ comment: 'Approved in test' })
        .expect(200);

      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      expect(tenant?.subscriptionStatus).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  describe('Mercado Pago Webhook', () => {
    it('should process a mock approved payment webhook', async () => {
      const mockPaymentId = 'MP-' + Date.now();
      
      await request(app.getHttpServer())
        .post('/api/payments/mercadopago/webhook')
        .send({
          type: 'payment',
          data: { id: mockPaymentId }
        });
        // Nota: El webhook real consultaría la API de MP. 
        // En un test e2e real deberíamos mockear el SDK de MP o la respuesta de la API de MP.
    });

    it('should be idempotent (not duplicate activation)', async () => {
      // Implementar lógica de verificación de idempotencia
    });
  });
});
