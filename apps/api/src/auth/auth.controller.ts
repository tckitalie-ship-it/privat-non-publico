import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: Record<string, unknown>) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: Record<string, unknown>) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.authService.me(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req: any,
    @Body() body: Record<string, unknown>,
  ) {
    return this.authService.changePassword(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-association')
  async switchAssociation(
    @Req() req: any,
    @Body() body: { associationId: string },
  ) {
    return this.authService.switchAssociation(
      req.user.id,
      body.associationId,
    );
  }
}