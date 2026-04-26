import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SwitchAssociationDto } from './dto/switch-association.dto';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @UseGuards(JwtAuthGuard)
@Post('switch-association')
async switchAssociation(
  @Req() req: AuthenticatedRequest,
  @Body() dto: SwitchAssociationDto,
) {
  return this.authService.switchAssociation(
    req.user.id,
    dto.associationId,
  );
}
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.id);
  }
}