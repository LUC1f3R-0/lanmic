import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class EmailChangeRequestIdDto {
  @IsString()
  @MaxLength(191)
  requestId!: string;
}

export class VerifyEmailChangeOtpDto extends EmailChangeRequestIdDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  otp!: string;
}

export class RequestNewEmailOtpDto extends EmailChangeRequestIdDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  @MaxLength(191)
  newEmail!: string;
}

export class ConfirmEmailChangeDto extends EmailChangeRequestIdDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;
}
