import { IsString } from 'class-validator';

export class SwitchAssociationDto {
  @IsString()
  associationId!: string;
}