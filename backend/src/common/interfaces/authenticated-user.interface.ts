import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  isVerified: boolean;
  sessionId: string;
  tokenVersion: number;
}
