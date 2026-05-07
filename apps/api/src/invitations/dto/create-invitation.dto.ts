import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(Role, { message: 'Role must be OWNER, ADMIN or MEMBER' })
  role: Role;
}