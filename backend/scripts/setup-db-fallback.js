const mysql = require('mysql2/promise');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

// Parse DATABASE_URL from environment
function parseDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not found in environment variables');
  }
  
  // Parse mysql://username:password@host:port/database
  const match = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format. Expected: mysql://username:password@host:port/database');
  }
  
  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5]
  };
}

// Get database configuration from environment
const DB_USER_CONFIG = parseDatabaseUrl();

// Root MySQL configuration (for creating database and user)
const DB_CONFIG = {
  host: process.env.MYSQL_ROOT_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_ROOT_PORT) || 3306,
  user: process.env.MYSQL_ROOT_USER || 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || '', // Default empty password for root
  database: DB_USER_CONFIG.database
};

async function createDatabase() {
  console.log('🗄️  Creating MySQL database...');
  
  try {
    // Connect to MySQL server (without specifying database)
    const connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    console.log(`   ✅ Database '${DB_CONFIG.database}' created/verified`);

    // Create user if it doesn't exist
    await connection.execute(`CREATE USER IF NOT EXISTS '${DB_USER_CONFIG.username}'@'localhost' IDENTIFIED BY '${DB_USER_CONFIG.password}'`);
    console.log(`   ✅ User '${DB_USER_CONFIG.username}' created/verified`);

    // Grant all privileges on the database to the user
    await connection.execute(`GRANT ALL PRIVILEGES ON \`${DB_CONFIG.database}\`.* TO '${DB_USER_CONFIG.username}'@'localhost'`);
    console.log(`   ✅ Privileges granted to '${DB_USER_CONFIG.username}'`);

    // Flush privileges to ensure changes take effect
    await connection.execute('FLUSH PRIVILEGES');
    console.log(`   ✅ Privileges flushed`);

    await connection.end();
    console.log('   ✅ Database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    throw error;
  }
}

async function runMigrations() {
  console.log('\n🔄 Running database migrations...');
  
  try {
    // Change to backend directory
    const backendDir = path.join(__dirname, '..');
    process.chdir(backendDir);
    
    // Sync database schema with Prisma schema
    console.log('   🚀 Syncing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('   ✅ Database schema synced successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function seedDatabase() {
  console.log('\n🌱 Seeding database with user data...');
  
  try {
    // Change to backend directory
    const backendDir = path.join(__dirname, '..');
    process.chdir(backendDir);
    
    // Run the seed script
    execSync('npm run seed', { stdio: 'inherit' });
    
    console.log('   ✅ Database seeded successfully');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

async function displaySummary() {
  console.log('\n📊 Setup Summary');
  console.log('================');
  console.log(`✅ MySQL database created: ${DB_USER_CONFIG.database}`);
  console.log(`✅ Database user created: ${DB_USER_CONFIG.username}`);
  console.log(`✅ User password set: ${DB_USER_CONFIG.password}`);
  console.log('✅ All tables created via migrations');
  console.log('✅ User table seeded with admin user');
  
  console.log('\n🔑 Admin Login Credentials');
  console.log('==========================');
  console.log('Email: anonymous.inbox99@gmail.com');
  console.log('Password: admin@pass');
  console.log('Username: admin');
  console.log('Status: Not verified (email verification required)');
  
  console.log('\n🌐 Database Connection');
  console.log('======================');
  console.log(`URL: ${process.env.DATABASE_URL}`);
  console.log(`Host: ${DB_USER_CONFIG.host}`);
  console.log(`Port: ${DB_USER_CONFIG.port}`);
  console.log(`Database: ${DB_USER_CONFIG.database}`);
  console.log(`Username: ${DB_USER_CONFIG.username}`);
  console.log(`Password: ${DB_USER_CONFIG.password}`);
}

async function main() {
  console.log('🚀 Starting fallback database setup...');
  console.log('=====================================');
  console.log('⚠️  This script assumes Prisma client is already generated');
  console.log('   If you get errors, first run: npm run db:generate');
  console.log('');
  
  try {
    // Step 1: Create database and user
    await createDatabase();
    
    // Step 2: Run migrations to create tables
    await runMigrations();
    
    // Step 3: Seed the database
    await seedDatabase();
    
    // Step 4: Display summary
    await displaySummary();
    
    console.log('\n🎉 Fallback database setup finished successfully!');
    console.log('================================================');
    console.log('\n💡 Next steps:');
    console.log('1. Start your backend server: npm run start:dev');
    console.log('2. Access your application and login with the admin credentials');
    console.log('3. Verify the admin email to activate the account');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Make sure MySQL server is running');
    console.error('2. Check if MySQL root user has proper privileges');
    console.error('3. Verify the DATABASE_URL in your .env file');
    console.error('4. Ensure all required dependencies are installed');
    console.error('5. Try running: npm run db:generate');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log('Fallback Database Setup Script');
  console.log('==============================');
  console.log('');
  console.log('This script will:');
  console.log('1. Parse DATABASE_URL from .env file');
  console.log('2. Create MySQL database and user from parsed URL');
  console.log('3. Grant all privileges to the user');
  console.log('4. Sync database schema with Prisma schema');
  console.log('5. Seed the database with admin user');
  console.log('');
  console.log('Usage:');
  console.log('  npm run db:setup:fallback');
  console.log('  node scripts/setup-db-fallback.js');
  console.log('');
  console.log('Prerequisites:');
  console.log('- MySQL server running');
  console.log('- MySQL root user accessible');
  console.log('- All npm dependencies installed');
  console.log('- .env file with DATABASE_URL configured');
  console.log('- Prisma client already generated (run: npm run db:generate)');
  console.log('');
  console.log('Environment Variables:');
  console.log('- DATABASE_URL (required): mysql://user:pass@host:port/database');
  console.log('- MYSQL_ROOT_HOST (optional): MySQL root host (default: localhost)');
  console.log('- MYSQL_ROOT_PORT (optional): MySQL root port (default: 3306)');
  console.log('- MYSQL_ROOT_USER (optional): MySQL root user (default: root)');
  console.log('- MYSQL_ROOT_PASSWORD (optional): MySQL root password (default: empty)');
  process.exit(0);
}

main()
  .catch((e) => {
    console.error('❌ Setup process failed:', e);
    process.exit(1);
  });
