#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const createOnly = args.includes('--create-only');
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
Database Setup Script

Usage: node scripts/setup-db.js [options]

Options:
  --create-only    Only create the database, skip migrations and seeding
  --help, -h       Show this help message

Examples:
  node scripts/setup-db.js                    # Full setup (create + migrate + seed)
  node scripts/setup-db.js --create-only      # Only create database
  npm run db:create-only                      # Using npm script
  npm run db:setup                            # Full setup using npm script
`);
  process.exit(0);
}

// Load environment variables
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please make sure your .env file contains DATABASE_URL');
  process.exit(1);
}

// Parse database URL to extract connection details
function parseDatabaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: urlObj.port || 3306,
      user: urlObj.username,
      password: urlObj.password,
      database: urlObj.pathname.substring(1), // Remove leading slash
    };
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
    process.exit(1);
  }
}

// Create database using MySQL command
async function createDatabase() {
  const dbConfig = parseDatabaseUrl(DATABASE_URL);
  
  console.log('🔧 Creating database...');
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   User: ${dbConfig.user}`);

  try {
    // Create the database using MySQL command
    const createDbCommand = `mysql -h${dbConfig.host} -P${dbConfig.port} -u${dbConfig.user} -p${dbConfig.password} -e "CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;"`;
    
    execSync(createDbCommand, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ Database created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    
    // Try alternative method using mysql command without password in command line
    console.log('🔄 Trying alternative method...');
    try {
      const createDbCommand = `mysql -h${dbConfig.host} -P${dbConfig.port} -u${dbConfig.user} -p -e "CREATE DATABASE IF NOT EXISTS \\\`${dbConfig.database}\\\`;"`;
      
      execSync(createDbCommand, { 
        stdio: 'inherit',
        input: dbConfig.password + '\n'
      });
      
      console.log('✅ Database created successfully using alternative method!');
      return true;
    } catch (altError) {
      console.error('❌ Alternative method also failed:', altError.message);
      console.error('\n💡 Manual database creation:');
      console.error(`   Connect to MySQL and run: CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      return false;
    }
  }
}

// Run Prisma migrations
async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

// Generate Prisma client
async function generateClient() {
  console.log('🔧 Generating Prisma client...');
  
  try {
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Prisma client generated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Prisma client generation failed:', error.message);
    return false;
  }
}

// Seed the database
async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  try {
    execSync('npm run seed', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting database setup...');
  console.log(`   Mode: ${createOnly ? 'CREATE ONLY' : 'FULL SETUP'}`);
  console.log('');

  // Step 1: Create database
  const dbCreated = await createDatabase();
  if (!dbCreated) {
    console.error('❌ Database creation failed. Exiting...');
    process.exit(1);
  }

  if (createOnly) {
    console.log('');
    console.log('🎉 Database creation completed!');
    console.log('💡 Next steps:');
    console.log('   - Run migrations: npm run db:migrate');
    console.log('   - Generate client: npm run db:generate');
    console.log('   - Seed database: npm run db:seed');
    console.log('   - Or run full setup: npm run db:setup');
    return;
  }

  // Step 2: Generate Prisma client
  const clientGenerated = await generateClient();
  if (!clientGenerated) {
    console.error('❌ Prisma client generation failed. Exiting...');
    process.exit(1);
  }

  // Step 3: Run migrations
  const migrationsRun = await runMigrations();
  if (!migrationsRun) {
    console.error('❌ Migrations failed. Exiting...');
    process.exit(1);
  }

  // Step 4: Seed database
  const seeded = await seedDatabase();
  if (!seeded) {
    console.error('❌ Seeding failed. Exiting...');
    process.exit(1);
  }

  console.log('');
  console.log('🎉 Database setup completed successfully!');
  console.log('💡 Your database is ready to use.');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
