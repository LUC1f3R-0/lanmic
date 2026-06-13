import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export class CompleteRegistrationDto {
  @IsString()
  @MinLength(32)
  @MaxLength(512)
  registrationGrant!: string;

  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9._-]+$/, {
    message:
      'Username may contain lowercase letters, numbers, dots, underscores and hyphens',
  })
  username!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  confirmPassword!: string;
}
