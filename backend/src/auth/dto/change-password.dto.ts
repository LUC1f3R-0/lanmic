import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  newPassword!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  confirmPassword!: string;
}
