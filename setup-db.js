const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('🚀 Setting up database schema...');

  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not found');
      return false;
    }

    // Parse DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: {
        rejectUnauthorized: false
      }
    };

    console.log('🔧 Connecting to database...');
    console.log(`Host: ${config.host}`);
    console.log(`Database: ${config.database}`);

    // Create connection
    const connection = await mysql.createConnection(config);

    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.log('❌ Schema file not found at:', schemaPath);
      return false;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠️  Table already exists, skipping...');
        } else {
          console.log('❌ Error executing statement:', error.message);
        }
      }
    }

    await connection.end();
    console.log('✅ Database schema setup completed');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase().then(() => process.exit(0));
}

module.exports = setupDatabase;
