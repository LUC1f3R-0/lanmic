# Database Setup Script for PowerShell
param(
    [switch]$CreateOnly,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Database Setup Script

Usage: .\scripts\setup-db.ps1 [options]

Options:
  -CreateOnly    Only create the database, skip migrations and seeding
  -Help          Show this help message

Examples:
  .\scripts\setup-db.ps1                    # Full setup (create + migrate + seed)
  .\scripts\setup-db.ps1 -CreateOnly        # Only create database
  npm run db:create-only                    # Using npm script
  npm run db:setup                          # Full setup using npm script
"@
    exit 0
}

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$DATABASE_URL = $env:DATABASE_URL

if (-not $DATABASE_URL) {
    Write-Error "❌ DATABASE_URL not found in environment variables"
    Write-Error "Please make sure your .env file contains DATABASE_URL"
    exit 1
}

# Parse database URL to extract connection details
function Parse-DatabaseUrl {
    param([string]$url)
    
    try {
        $uri = [System.Uri]$url
        return @{
            Host = $uri.Host
            Port = if ($uri.Port -ne -1) { $uri.Port } else { 3306 }
            User = $uri.UserInfo.Split(':')[0]
            Password = if ($uri.UserInfo.Contains(':')) { $uri.UserInfo.Split(':')[1] } else { "" }
            Database = $uri.AbsolutePath.TrimStart('/')
        }
    }
    catch {
        Write-Error "❌ Invalid DATABASE_URL format: $($_.Exception.Message)"
        exit 1
    }
}

# Create database using MySQL command
function New-Database {
    $dbConfig = Parse-DatabaseUrl $DATABASE_URL
    
    Write-Host "🔧 Creating database..."
    Write-Host "   Host: $($dbConfig.Host):$($dbConfig.Port)"
    Write-Host "   Database: $($dbConfig.Database)"
    Write-Host "   User: $($dbConfig.User)"

    try {
        # Create the database using MySQL command
        $createDbCommand = "mysql -h$($dbConfig.Host) -P$($dbConfig.Port) -u$($dbConfig.User) -p$($dbConfig.Password) -e `"CREATE DATABASE IF NOT EXISTS \`$($dbConfig.Database)\`;`""
        
        Invoke-Expression $createDbCommand | Out-Null
        
        Write-Host "✅ Database created successfully!"
        return $true
    }
    catch {
        Write-Error "❌ Failed to create database: $($_.Exception.Message)"
        
        # Try alternative method using mysql command with password prompt
        Write-Host "🔄 Trying alternative method..."
        try {
            $createDbCommand = "mysql -h$($dbConfig.Host) -P$($dbConfig.Port) -u$($dbConfig.User) -p -e `"CREATE DATABASE IF NOT EXISTS \`$($dbConfig.Database)\`;`""
            
            # Use Start-Process to handle password input
            $process = Start-Process -FilePath "mysql" -ArgumentList "-h$($dbConfig.Host)", "-P$($dbConfig.Port)", "-u$($dbConfig.User)", "-p", "-e", "CREATE DATABASE IF NOT EXISTS \`$($dbConfig.Database)\`;" -NoNewWindow -Wait -PassThru
            
            if ($process.ExitCode -eq 0) {
                Write-Host "✅ Database created successfully using alternative method!"
                return $true
            } else {
                throw "MySQL command failed with exit code $($process.ExitCode)"
            }
        }
        catch {
            Write-Error "❌ Alternative method also failed: $($_.Exception.Message)"
            Write-Host ""
            Write-Host "💡 Manual database creation:"
            Write-Host "   Connect to MySQL and run: CREATE DATABASE IF NOT EXISTS \`$($dbConfig.Database)\`;"
            return $false
        }
    }
}

# Run Prisma migrations
function Invoke-Migrations {
    Write-Host "🔄 Running database migrations..."
    
    try {
        Set-Location ".."
        npx prisma migrate deploy
        Set-Location "scripts"
        Write-Host "✅ Migrations completed successfully!"
        return $true
    }
    catch {
        Write-Error "❌ Migration failed: $($_.Exception.Message)"
        return $false
    }
}

# Generate Prisma client
function New-PrismaClient {
    Write-Host "🔧 Generating Prisma client..."
    
    try {
        Set-Location ".."
        npx prisma generate
        Set-Location "scripts"
        Write-Host "✅ Prisma client generated successfully!"
        return $true
    }
    catch {
        Write-Error "❌ Prisma client generation failed: $($_.Exception.Message)"
        return $false
    }
}

# Seed the database
function Invoke-Seed {
    Write-Host "🌱 Seeding database..."
    
    try {
        Set-Location ".."
        npm run seed
        Set-Location "scripts"
        Write-Host "✅ Database seeded successfully!"
        return $true
    }
    catch {
        Write-Error "❌ Seeding failed: $($_.Exception.Message)"
        return $false
    }
}

# Main execution
function Main {
    Write-Host "🚀 Starting database setup..."
    Write-Host "   Mode: $(if ($CreateOnly) { 'CREATE ONLY' } else { 'FULL SETUP' })"
    Write-Host ""

    # Step 1: Create database
    $dbCreated = New-Database
    if (-not $dbCreated) {
        Write-Error "❌ Database creation failed. Exiting..."
        exit 1
    }

    if ($CreateOnly) {
        Write-Host ""
        Write-Host "🎉 Database creation completed!"
        Write-Host "💡 Next steps:"
        Write-Host "   - Run migrations: npm run db:migrate"
        Write-Host "   - Generate client: npm run db:generate"
        Write-Host "   - Seed database: npm run db:seed"
        Write-Host "   - Or run full setup: npm run db:setup"
        return
    }

    # Step 2: Generate Prisma client
    $clientGenerated = New-PrismaClient
    if (-not $clientGenerated) {
        Write-Error "❌ Prisma client generation failed. Exiting..."
        exit 1
    }

    # Step 3: Run migrations
    $migrationsRun = Invoke-Migrations
    if (-not $migrationsRun) {
        Write-Error "❌ Migrations failed. Exiting..."
        exit 1
    }

    # Step 4: Seed database
    $seeded = Invoke-Seed
    if (-not $seeded) {
        Write-Error "❌ Seeding failed. Exiting..."
        exit 1
    }

    Write-Host ""
    Write-Host "🎉 Database setup completed successfully!"
    Write-Host "💡 Your database is ready to use."
}

# Run the main function
try {
    Main
}
catch {
    Write-Error "❌ Setup failed: $($_.Exception.Message)"
    exit 1
}
