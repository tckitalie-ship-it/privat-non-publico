import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AssociationId } from './association-id.decorator';
import { CurrentUser } from './current-user.decorator';

type JwtUser = {
  id: string;
  email: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Get('me')
  me(@CurrentUser() user: JwtUser, @AssociationId() associationId: string) {
    return {
      user,
      associationId,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-test')
  adminTest() {
    return { message: 'Only ADMIN can see this' };
  }
}
