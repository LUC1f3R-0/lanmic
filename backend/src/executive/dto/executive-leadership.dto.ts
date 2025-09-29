import { IsString, IsOptional, IsBoolean, IsInt, IsUrl, Min, MaxLength } from 'class-validator';

export class CreateExecutiveLeadershipDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(200)
  position: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  displayOrder?: number;
}

export class UpdateExecutiveLeadershipDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  displayOrder?: number;
}
