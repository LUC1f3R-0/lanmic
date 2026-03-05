const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('================================');

  try {
    // Step 1: Clear all existing data (with error handling for missing tables)
    console.log('🗑️  Clearing existing data...');
    
    // Delete in correct order to respect foreign key constraints
    // Use try-catch for each table in case they don't exist yet
    try {
      await prisma.refreshToken.deleteMany({});
      console.log('   ✅ Cleared refresh tokens');
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('   ℹ️  Refresh tokens table does not exist (skipping)');
      } else {
        throw error;
      }
    }
    
    try {
      await prisma.blogPost.deleteMany({});
      console.log('   ✅ Cleared blog posts');
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('   ℹ️  Blog posts table does not exist (skipping)');
      } else {
        throw error;
      }
    }
    
    try {
      await prisma.user.deleteMany({});
      console.log('   ✅ Cleared users');
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('   ℹ️  Users table does not exist (skipping)');
      } else {
        throw error;
      }
    }

    // Step 2: Create fresh data
    console.log('\n📝 Creating fresh data...');

    // Hash password with the same salt rounds as the auth service
    const adminPassword = await bcrypt.hash('admin@pass', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'anonymous.inbox99@gmail.com',
        password: adminPassword,
        username: 'admin',
        isVerified: false, // User must verify email to access dashboard
        otp: null,
        otpExpiresAt: null,
        // Note: newEmail field is not included as it doesn't exist in current migration
      },
    });

    console.log('   ✅ Admin user created:', {
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      isVerified: adminUser.isVerified,
    });

    // Note: Blog posts creation is skipped as the blog_posts table doesn't exist in current migration
    // This will be available once the full schema migration is created

    // Step 3: Summary
    console.log('\n📊 Seed Summary');
    console.log('================');
    console.log(`✅ Users created: 1`);
    console.log(`✅ Blog posts created: 0 (table not available in current migration)`);
    console.log(`✅ Refresh tokens: 0 (clean slate)`);
    
    console.log('\n🔑 Login Credentials');
    console.log('===================');
    console.log('Admin User:');
    console.log('  Email: anonymous.inbox99@gmail.com');
    console.log('  Password: admin@pass');
    console.log('  Status: Not verified (must verify email)');

    console.log('\n🎉 Database seed completed successfully!');
    console.log('==========================================');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
