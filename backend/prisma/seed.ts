import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'anonymous.inbox99@gmail.com';
  const adminPlainPassword = process.env.ADMIN_PASSWORD || 'admin@pass';

  // Hash the admin password with the same salt rounds as the auth service
  const hashedPassword = await bcrypt.hash(adminPlainPassword, 12);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      // Update password in case it changed
      password: hashedPassword,
      isVerified: false,
      username: 'admin',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      username: 'admin',
      isVerified: false,
    },
  });

  console.log('✅ Admin user created/updated:', {
    id: adminUser.id,
    email: adminUser.email,
    username: adminUser.username,
    isActive: adminUser.isVerified,
  });

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
