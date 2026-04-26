import { IsEmail, IsIn } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsIn(['member', 'admin'])
  role: string;
}