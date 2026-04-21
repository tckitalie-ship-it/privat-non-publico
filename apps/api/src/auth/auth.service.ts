import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { email, password } = dto;

    // 1. Trova utente
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Controllo esistenza
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Verifica password (bcrypt)
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Payload JWT
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // 5. Token
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}