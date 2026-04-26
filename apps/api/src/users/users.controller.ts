import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateUserDto,
  ): Promise<UserDto> {
    return this.usersService.create(dto);
  }
}