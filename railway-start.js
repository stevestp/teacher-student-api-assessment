const setupDatabase = require('./setup-db');

async function start() {
  console.log('🚀 Starting Railway deployment...');

  try {
    // Setup database schema first
    console.log('📊 Setting up database schema...');
    const dbSetupSuccess = await setupDatabase();

    if (dbSetupSuccess) {
      console.log('✅ Database setup completed successfully');
    } else {
      console.log('⚠️  Database setup had issues, but continuing...');
    }

    // Start the main application
    console.log('🚀 Starting main application...');
    require('./server.js');
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

start();
