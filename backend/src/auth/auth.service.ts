import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ChallengePurpose,
  Prisma,
  User,
  UserRole,
  VerificationChallenge,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { DatabaseService } from '../database.service';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CryptoService } from '../security/crypto.service';
import { CookieService } from './cookie.service';
import { EmailService } from './email.service';
import { TokenCleanupService } from './token-cleanup.service';
import {
  ChangePasswordDto,
  CompleteRegistrationDto,
  ConfirmEmailChangeDto,
  ForgotPasswordDto,
  LoginDto,
  RequestNewEmailOtpDto,
  RequestRegistrationOtpDto,
  VerifyEmailChangeOtpDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto';

interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private static readonly OTP_TTL_MS = 10 * 60 * 1000;
  private static readonly GRANT_TTL_MS = 15 * 60 * 1000;
  private static readonly EMAIL_CHANGE_TTL_MS = 30 * 60 * 1000;
  private static readonly PASSWORD_COST = 12;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly cookieService: CookieService,
    private readonly emailService: EmailService,
    private readonly tokenCleanupService: TokenCleanupService,
  ) {}

  async login(
    dto: LoginDto,
    response: Response,
    metadata: RequestMetadata,
  ): Promise<{
    message: string;
    user: ReturnType<AuthService['toUserResponse']>;
  }> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      await this.performDummyPasswordCheck(dto.password);
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.createSession(
      user,
      Boolean(dto.rememberMe),
      metadata,
    );
    this.cookieService.setAuthCookies(
      response,
      tokens.accessToken,
      tokens.refreshToken,
      Boolean(dto.rememberMe),
    );

    return {
      message: 'Login successful',
      user: this.toUserResponse(user),
    };
  }

  async refresh(
    refreshToken: string | undefined,
    response: Response,
    metadata: RequestMetadata,
  ): Promise<{
    message: string;
    user: ReturnType<AuthService['toUserResponse']>;
  }> {
    if (!refreshToken) {
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException('Invalid session');
    }

    const tokenHash = this.cryptoService.hashRefreshToken(refreshToken);
    const storedToken = await this.databaseService.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        session: {
          include: { user: true },
        },
      },
    });

    if (!storedToken) {
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException('Invalid session');
    }

    const now = new Date();
    const { session } = storedToken;
    const user = session.user;

    if (storedToken.consumedAt || storedToken.revokedAt) {
      await this.revokeSession(session.id);
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException('Session reuse detected');
    }

    if (
      storedToken.expiresAt <= now ||
      session.expiresAt <= now ||
      session.revokedAt ||
      !user.isActive
    ) {
      await this.revokeSession(session.id);
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException('Session expired');
    }

    const newRefreshToken = this.cryptoService.randomToken(64);
    const newRefreshHash = this.cryptoService.hashRefreshToken(newRefreshToken);

    await this.databaseService.$transaction(async (transaction) => {
      const consumeResult = await transaction.refreshToken.updateMany({
        where: {
          id: storedToken.id,
          consumedAt: null,
          revokedAt: null,
        },
        data: { consumedAt: now },
      });

      if (consumeResult.count !== 1) {
        await transaction.authSession.update({
          where: { id: session.id },
          data: { revokedAt: now },
        });
        throw new UnauthorizedException('Session reuse detected');
      }

      await transaction.refreshToken.create({
        data: {
          tokenHash: newRefreshHash,
          sessionId: session.id,
          expiresAt: session.expiresAt,
        },
      });

      await transaction.authSession.update({
        where: { id: session.id },
        data: {
          lastUsedAt: now,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
      });
    });

    const accessToken = await this.signAccessToken(user, session.id);
    this.cookieService.setAuthCookies(
      response,
      accessToken,
      newRefreshToken,
      session.rememberMe,
    );

    return {
      message: 'Session refreshed',
      user: this.toUserResponse(user),
    };
  }

  async logout(
    refreshToken: string | undefined,
    response: Response,
  ): Promise<{ message: string }> {
    try {
      if (refreshToken) {
        const tokenHash = this.cryptoService.hashRefreshToken(refreshToken);
        const token = await this.databaseService.refreshToken.findUnique({
          where: { tokenHash },
          select: { sessionId: true },
        });
        if (token) {
          await this.revokeSession(token.sessionId);
        }
      }
    } finally {
      this.cookieService.clearAuthCookies(response);
    }

    return { message: 'Logged out successfully' };
  }

  getProfile(user: AuthenticatedUser): { user: AuthenticatedUser } {
    return { user };
  }

  async requestRegistrationOtp(dto: RequestRegistrationOtpDto): Promise<{
    message: string;
    challengeId: string;
    expiresInMinutes: number;
  }> {
    if (
      !this.configService.getOrThrow<boolean>('app.allowPublicRegistration')
    ) {
      throw new ForbiddenException('Public registration is disabled');
    }

    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.databaseService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return this.fakeChallengeResponse(
        'If this email can be registered, a verification code has been sent.',
      );
    }

    const { challenge, otp } = await this.createChallenge(
      ChallengePurpose.REGISTER,
      email,
    );
    await this.emailService.sendOtpEmail(email, otp, 'registration');

    return {
      message:
        'If this email can be registered, a verification code has been sent.',
      challengeId: challenge.id,
      expiresInMinutes: 10,
    };
  }

  async verifyRegistrationOtp(
    dto: VerifyOtpDto,
  ): Promise<{ message: string; registrationGrant: string }> {
    const registrationGrant = await this.verifyChallengeAndIssueGrant(
      dto,
      ChallengePurpose.REGISTER,
    );

    return {
      message:
        'Email verified. Complete registration before the grant expires.',
      registrationGrant,
    };
  }

  async completeRegistration(dto: CompleteRegistrationDto): Promise<{
    message: string;
    user: ReturnType<AuthService['toUserResponse']>;
  }> {
    if (
      !this.configService.getOrThrow<boolean>('app.allowPublicRegistration')
    ) {
      throw new ForbiddenException('Public registration is disabled');
    }
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const grantHash = this.cryptoService.hashGrant(dto.registrationGrant);
    const challenge = await this.getUsableGrant(
      grantHash,
      ChallengePurpose.REGISTER,
    );
    const username = dto.username.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(
      dto.password,
      AuthService.PASSWORD_COST,
    );

    try {
      const user = await this.databaseService.$transaction(
        async (transaction) => {
          const createdUser = await transaction.user.create({
            data: {
              email: challenge.target,
              username,
              passwordHash,
              role: UserRole.USER,
              emailVerifiedAt: new Date(),
            },
          });

          const consumed = await transaction.verificationChallenge.updateMany({
            where: { id: challenge.id, consumedAt: null },
            data: { consumedAt: new Date() },
          });
          if (consumed.count !== 1) {
            throw new BadRequestException(
              'Registration grant has already been used',
            );
          }

          return createdUser;
        },
      );

      return {
        message: 'Registration completed successfully',
        user: this.toUserResponse(user),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or username is already in use');
      }
      throw error;
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{
    message: string;
    challengeId: string;
    expiresInMinutes: number;
  }> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    const genericMessage =
      'If an active account exists for that email, a reset code has been sent.';

    if (!user || !user.isActive) {
      return this.fakeChallengeResponse(genericMessage);
    }

    const { challenge, otp } = await this.createChallenge(
      ChallengePurpose.PASSWORD_RESET,
      email,
      user.id,
    );
    await this.emailService.sendOtpEmail(email, otp, 'password reset');

    return {
      message: genericMessage,
      challengeId: challenge.id,
      expiresInMinutes: 10,
    };
  }

  async verifyResetOtp(
    dto: VerifyOtpDto,
  ): Promise<{ message: string; resetGrant: string }> {
    const resetGrant = await this.verifyChallengeAndIssueGrant(
      dto,
      ChallengePurpose.PASSWORD_RESET,
    );

    return {
      message: 'Code verified. Reset the password before the grant expires.',
      resetGrant,
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<{ message: string; requiresReauth: true }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const grantHash = this.cryptoService.hashGrant(dto.resetGrant);
    const challenge = await this.getUsableGrant(
      grantHash,
      ChallengePurpose.PASSWORD_RESET,
    );
    if (!challenge.userId) {
      throw new BadRequestException('Invalid reset grant');
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      AuthService.PASSWORD_COST,
    );

    const user = await this.databaseService.$transaction(
      async (transaction) => {
        const updated = await transaction.user.update({
          where: { id: challenge.userId! },
          data: {
            passwordHash,
            tokenVersion: { increment: 1 },
          },
        });

        const consumed = await transaction.verificationChallenge.updateMany({
          where: { id: challenge.id, consumedAt: null },
          data: { consumedAt: new Date() },
        });
        if (consumed.count !== 1) {
          throw new BadRequestException('Reset grant has already been used');
        }

        await transaction.authSession.updateMany({
          where: { userId: updated.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });

        return updated;
      },
    );

    await this.sendSecurityNotification(() =>
      this.emailService.sendPasswordResetSuccessEmail(user.email),
    );
    return {
      message: 'Password reset successfully. Sign in again on all devices.',
      requiresReauth: true,
    };
  }

  async sendVerificationEmail(user: AuthenticatedUser): Promise<{
    message: string;
    challengeId?: string;
    expiresInMinutes?: number;
  }> {
    const storedUser = await this.databaseService.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    if (storedUser.emailVerifiedAt) {
      return { message: 'Email is already verified' };
    }

    const { challenge, otp } = await this.createChallenge(
      ChallengePurpose.VERIFY_EMAIL,
      storedUser.email,
      storedUser.id,
    );
    await this.emailService.sendOtpEmail(
      storedUser.email,
      otp,
      'email verification',
    );

    return {
      message: 'Verification code sent',
      challengeId: challenge.id,
      expiresInMinutes: 10,
    };
  }

  async verifyEmail(
    user: AuthenticatedUser,
    dto: VerifyOtpDto,
  ): Promise<{ message: string }> {
    const challenge = await this.getChallengeForVerification(
      dto.challengeId,
      ChallengePurpose.VERIFY_EMAIL,
    );

    if (challenge.userId !== user.id) {
      throw new BadRequestException('Invalid verification challenge');
    }

    await this.verifyChallengeCode(challenge, dto.otp);

    await this.databaseService.$transaction([
      this.databaseService.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      }),
      this.databaseService.verificationChallenge.update({
        where: { id: challenge.id },
        data: { verifiedAt: new Date(), consumedAt: new Date() },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async changePassword(
    user: AuthenticatedUser,
    dto: ChangePasswordDto,
  ): Promise<{ message: string; requiresReauth: true }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different');
    }

    const storedUser = await this.databaseService.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    const currentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      storedUser.passwordHash,
    );
    if (!currentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      AuthService.PASSWORD_COST,
    );

    await this.databaseService.$transaction([
      this.databaseService.user.update({
        where: { id: user.id },
        data: { passwordHash, tokenVersion: { increment: 1 } },
      }),
      this.databaseService.authSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.sendSecurityNotification(() =>
      this.emailService.sendPasswordResetSuccessEmail(storedUser.email),
    );
    return {
      message: 'Password changed successfully. Sign in again.',
      requiresReauth: true,
    };
  }

  async startEmailChange(
    user: AuthenticatedUser,
  ): Promise<{ message: string; requestId: string; expiresInMinutes: number }> {
    const otp = this.cryptoService.randomOtp();
    const now = new Date();
    const currentCodeExpiresAt = new Date(
      now.getTime() + AuthService.OTP_TTL_MS,
    );
    const expiresAt = new Date(now.getTime() + AuthService.EMAIL_CHANGE_TTL_MS);

    const storedUser = await this.databaseService.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    await this.databaseService.emailChangeRequest.deleteMany({
      where: { userId: user.id, completedAt: null },
    });

    const request = await this.databaseService.emailChangeRequest.create({
      data: {
        userId: user.id,
        currentCodeHash: this.cryptoService.hashOtp(otp),
        currentCodeExpiresAt,
        expiresAt,
      },
    });

    await this.emailService.sendOtpEmail(storedUser.email, otp, 'email change');
    return {
      message: 'A verification code was sent to your current email address.',
      requestId: request.id,
      expiresInMinutes: 10,
    };
  }

  async verifyCurrentEmailOtp(
    user: AuthenticatedUser,
    dto: VerifyEmailChangeOtpDto,
  ): Promise<{ message: string; canProceedToNewEmail: true }> {
    const request = await this.getEmailChangeRequest(user.id, dto.requestId);
    await this.verifyEmailChangeCode(
      request.currentCodeHash,
      request.currentCodeExpiresAt,
      request.currentAttempts,
      dto.otp,
      async () => {
        await this.databaseService.emailChangeRequest.update({
          where: { id: request.id },
          data: { currentAttempts: { increment: 1 } },
        });
      },
    );

    await this.databaseService.emailChangeRequest.update({
      where: { id: request.id },
      data: { currentVerifiedAt: new Date() },
    });

    return {
      message: 'Current email verified',
      canProceedToNewEmail: true,
    };
  }

  async sendNewEmailOtp(
    user: AuthenticatedUser,
    dto: RequestNewEmailOtpDto,
  ): Promise<{
    message: string;
    requestId: string;
    newEmail: string;
    expiresInMinutes: number;
  }> {
    const request = await this.getEmailChangeRequest(user.id, dto.requestId);
    if (!request.currentVerifiedAt) {
      throw new BadRequestException('Verify the current email first');
    }

    const newEmail = this.normalizeEmail(dto.newEmail);
    const existing = await this.databaseService.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email is already in use');
    }

    const otp = this.cryptoService.randomOtp();
    await this.databaseService.emailChangeRequest.update({
      where: { id: request.id },
      data: {
        newEmail,
        newCodeHash: this.cryptoService.hashOtp(otp),
        newCodeExpiresAt: new Date(Date.now() + AuthService.OTP_TTL_MS),
        newAttempts: 0,
        newVerifiedAt: null,
      },
    });

    await this.emailService.sendOtpEmail(newEmail, otp, 'email change');
    return {
      message: 'A verification code was sent to the new email address.',
      requestId: request.id,
      newEmail,
      expiresInMinutes: 10,
    };
  }

  async verifyNewEmailOtp(
    user: AuthenticatedUser,
    dto: VerifyEmailChangeOtpDto,
  ): Promise<{ message: string; canProceedToPasswordConfirmation: true }> {
    const request = await this.getEmailChangeRequest(user.id, dto.requestId);
    if (
      !request.currentVerifiedAt ||
      !request.newCodeHash ||
      !request.newCodeExpiresAt
    ) {
      throw new BadRequestException(
        'New email verification has not been started',
      );
    }

    await this.verifyEmailChangeCode(
      request.newCodeHash,
      request.newCodeExpiresAt,
      request.newAttempts,
      dto.otp,
      async () => {
        await this.databaseService.emailChangeRequest.update({
          where: { id: request.id },
          data: { newAttempts: { increment: 1 } },
        });
      },
    );

    await this.databaseService.emailChangeRequest.update({
      where: { id: request.id },
      data: { newVerifiedAt: new Date() },
    });

    return {
      message: 'New email verified',
      canProceedToPasswordConfirmation: true,
    };
  }

  async confirmEmailChange(
    user: AuthenticatedUser,
    dto: ConfirmEmailChangeDto,
  ): Promise<{ message: string; newEmail: string; requiresReauth: true }> {
    const request = await this.getEmailChangeRequest(user.id, dto.requestId);
    if (
      !request.currentVerifiedAt ||
      !request.newVerifiedAt ||
      !request.newEmail
    ) {
      throw new BadRequestException('Both email addresses must be verified');
    }

    const storedUser = await this.databaseService.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    const passwordValid = await bcrypt.compare(
      dto.currentPassword,
      storedUser.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    try {
      await this.databaseService.$transaction(async (transaction) => {
        await transaction.user.update({
          where: { id: user.id },
          data: {
            email: request.newEmail!,
            emailVerifiedAt: new Date(),
            tokenVersion: { increment: 1 },
          },
        });
        await transaction.emailChangeRequest.update({
          where: { id: request.id },
          data: { completedAt: new Date() },
        });
        await transaction.authSession.updateMany({
          where: { userId: user.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already in use');
      }
      throw error;
    }

    await this.sendSecurityNotification(() =>
      this.emailService.sendEmailChangeSuccessEmail(
        storedUser.email,
        request.newEmail!,
      ),
    );

    return {
      message: 'Email changed successfully. Sign in again.',
      newEmail: request.newEmail,
      requiresReauth: true,
    };
  }

  private async createSession(
    user: User,
    rememberMe: boolean,
    metadata: RequestMetadata,
  ): Promise<SessionTokens> {
    const refreshTtlSeconds = rememberMe
      ? this.configService.getOrThrow<number>('auth.refreshRememberTtlSeconds')
      : this.configService.getOrThrow<number>('auth.refreshTtlSeconds');
    const expiresAt = new Date(Date.now() + refreshTtlSeconds * 1000);
    const refreshToken = this.cryptoService.randomToken(64);
    const tokenHash = this.cryptoService.hashRefreshToken(refreshToken);

    const session = await this.databaseService.authSession.create({
      data: {
        userId: user.id,
        rememberMe,
        expiresAt,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        refreshTokens: {
          create: {
            tokenHash,
            expiresAt,
          },
        },
      },
    });

    return {
      sessionId: session.id,
      refreshToken,
      accessToken: await this.signAccessToken(user, session.id),
    };
  }

  private async signAccessToken(
    user: User,
    sessionId: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        sid: sessionId,
        role: user.role,
        tv: user.tokenVersion,
        type: 'access',
      },
      {
        secret: this.configService.getOrThrow<string>('auth.jwtSecret'),
        issuer: this.configService.getOrThrow<string>('auth.issuer'),
        audience: this.configService.getOrThrow<string>('auth.audience'),
        algorithm: 'HS512',
        expiresIn: this.configService.getOrThrow<number>(
          'auth.accessTtlSeconds',
        ),
      },
    );
  }

  private async createChallenge(
    purpose: ChallengePurpose,
    target: string,
    userId?: number,
  ): Promise<{ challenge: VerificationChallenge; otp: string }> {
    const otp = this.cryptoService.randomOtp();
    const expiresAt = new Date(Date.now() + AuthService.OTP_TTL_MS);

    await this.databaseService.verificationChallenge.deleteMany({
      where: {
        purpose,
        target,
        consumedAt: null,
      },
    });

    const challenge = await this.databaseService.verificationChallenge.create({
      data: {
        purpose,
        target,
        userId,
        codeHash: this.cryptoService.hashOtp(otp),
        expiresAt,
      },
    });

    return { challenge, otp };
  }

  private async verifyChallengeAndIssueGrant(
    dto: VerifyOtpDto,
    purpose: ChallengePurpose,
  ): Promise<string> {
    const challenge = await this.getChallengeForVerification(
      dto.challengeId,
      purpose,
    );
    await this.verifyChallengeCode(challenge, dto.otp);

    const grant = this.cryptoService.randomToken(48);
    await this.databaseService.verificationChallenge.update({
      where: { id: challenge.id },
      data: {
        verifiedAt: new Date(),
        grantHash: this.cryptoService.hashGrant(grant),
        expiresAt: new Date(Date.now() + AuthService.GRANT_TTL_MS),
      },
    });
    return grant;
  }

  private async getChallengeForVerification(
    challengeId: string,
    purpose: ChallengePurpose,
  ): Promise<VerificationChallenge> {
    const challenge =
      await this.databaseService.verificationChallenge.findFirst({
        where: { id: challengeId, purpose },
      });

    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.verifiedAt ||
      challenge.expiresAt <= new Date() ||
      challenge.attempts >= challenge.maxAttempts
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    return challenge;
  }

  private async verifyChallengeCode(
    challenge: VerificationChallenge,
    otp: string,
  ): Promise<void> {
    const submittedHash = this.cryptoService.hashOtp(otp);
    if (!this.cryptoService.safeEqual(challenge.codeHash, submittedHash)) {
      await this.databaseService.verificationChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid or expired verification code');
    }
  }

  private async getUsableGrant(
    grantHash: string,
    purpose: ChallengePurpose,
  ): Promise<VerificationChallenge> {
    const challenge =
      await this.databaseService.verificationChallenge.findFirst({
        where: {
          grantHash,
          purpose,
          verifiedAt: { not: null },
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
    if (!challenge) {
      throw new BadRequestException('Invalid or expired grant');
    }
    return challenge;
  }

  private async getEmailChangeRequest(userId: number, requestId: string) {
    const request = await this.databaseService.emailChangeRequest.findFirst({
      where: {
        id: requestId,
        userId,
        completedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!request) {
      throw new BadRequestException('Invalid or expired email-change request');
    }
    return request;
  }

  private async verifyEmailChangeCode(
    expectedHash: string,
    expiresAt: Date,
    attempts: number,
    otp: string,
    onFailure: () => Promise<void>,
  ): Promise<void> {
    if (expiresAt <= new Date() || attempts >= 5) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    const actualHash = this.cryptoService.hashOtp(otp);
    if (!this.cryptoService.safeEqual(expectedHash, actualHash)) {
      await onFailure();
      throw new BadRequestException('Invalid or expired verification code');
    }
  }

  private async sendSecurityNotification(
    operation: () => Promise<void>,
  ): Promise<void> {
    try {
      await operation();
    } catch (error) {
      this.logger.error(
        'A security notification email could not be delivered',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async revokeSession(sessionId: string): Promise<void> {
    await this.databaseService.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private toUserResponse(
    user: Pick<User, 'id' | 'email' | 'username' | 'role' | 'emailVerifiedAt'>,
  ) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: Boolean(user.emailVerifiedAt),
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private fakeChallengeResponse(message: string): {
    message: string;
    challengeId: string;
    expiresInMinutes: number;
  } {
    return {
      message,
      challengeId: this.cryptoService.randomToken(24),
      expiresInMinutes: 10,
    };
  }

  private async performDummyPasswordCheck(password: string): Promise<void> {
    const dummyHash =
      '$2b$12$dLx0JcR5KJfYfSNzG4WfXuf3KjV5C/8OJ0n9HZgWGLm6vTFmdZVfC';
    await bcrypt.compare(password, dummyHash).catch(() => false);
  }
}
