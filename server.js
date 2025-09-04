const App = require('./src/app');

// Create and start the application
const app = new App();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🔄 Received SIGINT. Graceful shutdown starting...');
  await app.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM. Graceful shutdown starting...');
  await app.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
app.start().catch(error => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
