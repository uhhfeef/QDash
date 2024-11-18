# D1 Database Setup and Configuration Guide

## Overview
This document outlines the setup, configuration, and usage of Cloudflare D1 database in our project. D1 is Cloudflare's native serverless SQL database, built on SQLite.

## Table of Contents
1. [Project Configuration](#project-configuration)
2. [Local Development Setup](#local-development-setup)
3. [Database Schema](#database-schema)
4. [Migration Management](#migration-management)
5. [Development Workflow](#development-workflow)
6. [Production Deployment](#production-deployment)
7. [Common Commands](#common-commands)
8. [Troubleshooting](#troubleshooting)

## Project Configuration

### wrangler.toml Configuration
```toml
[[d1_databases]]
binding = "DB"
database_name = "qdash-users"
database_id = "d79734cb-f61d-473a-bc9c-0e06bf01be58"
```

This configuration:
- Binds the D1 database to `DB` in our application
- Names the database "qdash-users"
- Associates it with our specific database ID

## Local Development Setup

### Initial Setup
1. Install Wrangler globally (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. Create a new D1 database:
   ```bash
   wrangler d1 create qdash-users
   ```
   This command will:
   - Create a new D1 database
   - Generate a unique database_id
   - Update wrangler.toml with the configuration

3. Initialize local development database:
   ```bash
   wrangler d1 execute qdash-users --local --file=./migrations/0000_create_users.sql
   ```

### Running Development Server
```bash
wrangler dev --local --persist
```
- `--local`: Uses local SQLite database
- `--persist`: Maintains data between development sessions

## Database Schema

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);
```

## Migration Management

### Migration Files
Migrations are stored in the `/migrations` directory:
- `0000_create_users.sql`: Initial users table creation
- Future migrations should follow the naming pattern: `XXXX_description.sql`

### Running Migrations
1. Local Development:
   ```bash
   wrangler d1 execute qdash-users --local --file=./migrations/migration_file.sql
   ```

2. Production:
   ```bash
   wrangler d1 execute qdash-users --file=./migrations/migration_file.sql
   ```

## Development Workflow

### 1. Local Database Operations
```javascript
// In your application code
app.post('/api/users', async (c) => {
    const result = await c.env.DB.prepare(
        'INSERT INTO users (email, password) VALUES (?, ?)'
    ).bind(email, hashedPassword).run();
});
```

### 2. Database Queries
View database contents:
```bash
# List all users
wrangler d1 execute qdash-users --local "SELECT * FROM users;"

# Run specific queries
wrangler d1 execute qdash-users --local "SELECT email FROM users WHERE id = 1;"
```

### 3. Database Location
Local development database is stored in:
`.wrangler/state/d1/`

## Production Deployment

### 1. Initial Deployment
```bash
wrangler deploy
```

### 2. Production Database Updates
```bash
# Run migrations
wrangler d1 execute qdash-users --file=./migrations/migration_file.sql

# Backup before major changes
wrangler d1 backup qdash-users
```

## Common Commands

### Database Management
```bash
# Create new database
wrangler d1 create <database-name>

# List databases
wrangler d1 list

# Execute SQL file
wrangler d1 execute <database-name> --file=./path/to/file.sql

# Execute SQL command
wrangler d1 execute <database-name> "SQL_COMMAND"

# Backup database
wrangler d1 backup <database-name>
```

### Development
```bash
# Start development server
wrangler dev --local --persist

# Apply migrations locally
wrangler d1 execute qdash-users --local --file=./migrations/migration_file.sql
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```
   Error: D1_ERROR: database not found
   ```
   Solution: Ensure wrangler.toml has correct database_id and you're running with --local flag for development.

2. **Migration Failures**
   ```
   Error: SQLITE_ERROR: table already exists
   ```
   Solution: Use `IF NOT EXISTS` in CREATE TABLE statements or drop table first.

3. **Persistence Issues**
   If data isn't persisting between sessions:
   - Ensure you're using the `--persist` flag
   - Check `.wrangler/state/d1` directory exists
   - Verify file permissions

### Best Practices

1. Always backup before major changes
2. Use migrations for schema changes
3. Test migrations locally before production
4. Keep local and production databases in sync
5. Use prepared statements to prevent SQL injection

### Support Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/commands)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
