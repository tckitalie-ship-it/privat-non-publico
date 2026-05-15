import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return this.authService.me(req.user);
  }

  @Post('switch-association')
  @UseGuards(JwtAuthGuard)
  switchAssociation(
    @Req() req: any,
    @Body() body: { associationId: string },
  ) {
    return this.authService.switchAssociation(
      req.user,
      body.associationId,
    );
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user, dto);
  }
}