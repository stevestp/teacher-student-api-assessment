require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

const dbConfig = require('../src/config/database');

// Global test setup
beforeAll(async () => {
  // Ensure we're using test database
  console.log('Setting up test database...');

  // Wait for database connection
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const isConnected = await dbConfig.testConnection();
      if (isConnected) {
        console.log('✅ Test database connected');
        break;
      }
      throw new Error('Database not ready');
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error('❌ Failed to connect to test database:', error.message);
        process.exit(1);
      }
      console.log(`⏳ Waiting for database... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
});

// Clean up after all tests
afterAll(async () => {
  console.log('Cleaning up test database...');
  try {
    // Clean up test data
    await dbConfig.query('DELETE FROM teacher_students');
    await dbConfig.query('DELETE FROM students');
    await dbConfig.query('DELETE FROM teachers');

    // Close database connection
    await dbConfig.closePool();
    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error.message);
  }
});

// Clean database before each test file
beforeEach(async () => {
  // Clean up tables in correct order (due to foreign keys)
  await dbConfig.query('DELETE FROM teacher_students');
  await dbConfig.query('DELETE FROM students');
  await dbConfig.query('DELETE FROM teachers');

  // Reset auto increment
  await dbConfig.query('ALTER TABLE teacher_students AUTO_INCREMENT = 1');
  await dbConfig.query('ALTER TABLE students AUTO_INCREMENT = 1');
  await dbConfig.query('ALTER TABLE teachers AUTO_INCREMENT = 1');
});
