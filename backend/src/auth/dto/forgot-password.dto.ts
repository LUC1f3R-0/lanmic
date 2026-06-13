import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  @MaxLength(191)
  email!: string;
}

export class RequestRegistrationOtpDto extends ForgotPasswordDto {}
