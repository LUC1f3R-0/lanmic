import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash the admin password with the same salt rounds as the auth service
  const hashedPassword = await bcrypt.hash('admin@pass', 12);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      // Update password in case it changed
      password: hashedPassword,
      isVerified: true,
      username: 'admin',
    },
    create: {
      email: 'admin@gmail.com',
      password: hashedPassword,
      username: 'admin',
      isVerified: true,
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
