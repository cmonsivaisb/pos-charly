import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.businessName,
          email: dto.email,
          rfc: dto.rfc,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.adminName,
          role: UserRole.ADMIN,
          tenantId: tenant.id,
        },
      });

      return this.generateTokens(user.id, user.email, user.tenantId, user.role);
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.password, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email, user.tenantId, user.role);
  }

  private async generateTokens(userId: string, email: string, tenantId: string, role: string) {
    const payload = { sub: userId, email, tenantId, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '1d' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, tenantId, role },
    };
  }
}
