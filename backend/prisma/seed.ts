import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();

  const password = process.env.ADMIN_PASSWORD;

  if (!email || !username || !password) {
    throw new Error(
      'ADMIN_EMAIL, ADMIN_USERNAME and ADMIN_PASSWORD must be provided for seeding.',
    );
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: {
      email,
    },

    update: {
      username,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      emailVerifiedAt: new Date(),

      tokenVersion: {
        increment: 1,
      },
    },

    create: {
      email,
      username,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Administrator account ensured for ${email}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
