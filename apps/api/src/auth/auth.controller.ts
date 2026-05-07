import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SwitchAssociationDto } from './dto/switch-association.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('switch-association')
  @UseGuards(JwtAuthGuard)
  switchAssociation(@Req() req, @Body() dto: SwitchAssociationDto) {
    return this.authService.switchAssociation(req.user.id, dto.associationId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      associationId: req.user.associationId ?? null,
      role: req.user.role ?? null,
    };
  }
}