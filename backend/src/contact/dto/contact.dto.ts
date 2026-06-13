import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class ContactFormDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(191)
  email!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+()\-\s0-9]*$/, {
    message: 'Phone number contains unsupported characters',
  })
  phone?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2_000)
  message!: string;
}
