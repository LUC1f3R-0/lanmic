import { IsString, Length, Matches, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @MaxLength(191)
  challengeId!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  otp!: string;
}
