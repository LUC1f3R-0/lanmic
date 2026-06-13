import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import {
  AuthResponseDto,
  ChangePasswordDto,
  CompleteRegistrationDto,
  ConfirmEmailChangeDto,
  ForgotPasswordDto,
  LoginDto,
  RequestNewEmailOtpDto,
  RequestRegistrationOtpDto,
  ResetPasswordDto,
  VerifyEmailChangeOtpDto,
  VerifyOtpDto,
} from './dto';

const AUTH_LIMIT = {
  burst: { limit: 5, ttl: 60_000 },
  short: { limit: 10, ttl: 15 * 60_000 },
  medium: { limit: 30, ttl: 60 * 60_000 },
};

const OTP_SEND_LIMIT = {
  burst: { limit: 2, ttl: 60_000 },
  short: { limit: 5, ttl: 60 * 60_000 },
  medium: { limit: 10, ttl: 24 * 60 * 60_000 },
};

const OTP_VERIFY_LIMIT = {
  burst: { limit: 5, ttl: 60_000 },
  short: { limit: 10, ttl: 15 * 60_000 },
  medium: { limit: 25, ttl: 60 * 60_000 },
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_LIMIT)
  @ApiOperation({ summary: 'Authenticate and create a cookie-based session' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(dto, response, this.requestMetadata(request));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_LIMIT)
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(
      request.cookies?.refresh_token as string | undefined,
      response,
      this.requestMetadata(request),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(
      request.cookies?.refresh_token as string | undefined,
      response,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(request.user);
  }

  @Post('register/email')
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_SEND_LIMIT)
  requestRegistrationOtp(@Body() dto: RequestRegistrationOtpDto) {
    return this.authService.requestRegistrationOtp(dto);
  }

  @Post('register/otp')
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_VERIFY_LIMIT)
  verifyRegistrationOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyRegistrationOtp(dto);
  }

  @Post('register/details')
  @HttpCode(HttpStatus.CREATED)
  @Throttle(AUTH_LIMIT)
  completeRegistration(@Body() dto: CompleteRegistrationDto) {
    return this.authService.completeRegistration(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_SEND_LIMIT)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_VERIFY_LIMIT)
  verifyResetOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_LIMIT)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.resetPassword(dto);
    this.cookieService.clearAuthCookies(response);
    return result;
  }

  @Post('send-verification-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_SEND_LIMIT)
  sendVerificationEmail(@Req() request: AuthenticatedRequest) {
    return this.authService.sendVerificationEmail(request.user);
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_VERIFY_LIMIT)
  verifyEmail(@Req() request: AuthenticatedRequest, @Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmail(request.user, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_LIMIT)
  async changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.changePassword(request.user, dto);
    this.cookieService.clearAuthCookies(response);
    return result;
  }

  @Post('change-email/verify-current')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_SEND_LIMIT)
  startEmailChange(@Req() request: AuthenticatedRequest) {
    return this.authService.startEmailChange(request.user);
  }

  @Post('change-email/verify-current-otp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_VERIFY_LIMIT)
  verifyCurrentEmailOtp(
    @Req() request: AuthenticatedRequest,
    @Body() dto: VerifyEmailChangeOtpDto,
  ) {
    return this.authService.verifyCurrentEmailOtp(request.user, dto);
  }

  @Post('change-email/verify-new')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_SEND_LIMIT)
  sendNewEmailOtp(
    @Req() request: AuthenticatedRequest,
    @Body() dto: RequestNewEmailOtpDto,
  ) {
    return this.authService.sendNewEmailOtp(request.user, dto);
  }

  @Post('change-email/verify-new-otp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(OTP_VERIFY_LIMIT)
  verifyNewEmailOtp(
    @Req() request: AuthenticatedRequest,
    @Body() dto: VerifyEmailChangeOtpDto,
  ) {
    return this.authService.verifyNewEmailOtp(request.user, dto);
  }

  @Post('change-email/confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_LIMIT)
  async confirmEmailChange(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ConfirmEmailChangeDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.confirmEmailChange(request.user, dto);
    this.cookieService.clearAuthCookies(response);
    return result;
  }

  private requestMetadata(request: Request) {
    return {
      ipAddress: request.ip,
      userAgent: request.header('user-agent')?.slice(0, 1000),
    };
  }
}
