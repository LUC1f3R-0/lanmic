import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';

@Injectable()
export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try to connect to the database
      await this.prisma.$connect();

      // Test a simple query to ensure the connection is working
      await this.prisma.$queryRaw`SELECT 1 as test`;

      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    } finally {
      // Always disconnect after the test
      await this.prisma.$disconnect();
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
