import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateAssociationDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsString()
  @Length(2, 80)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}