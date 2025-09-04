const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler, requestLogger } = require('./middlewares/errorHandler');
const dbConfig = require('./config/database');

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin:
          process.env.NODE_ENV === 'production'
            ? process.env.ALLOWED_ORIGINS?.split(',') || []
            : true,
        credentials: true
      })
    );

    // Compression middleware
    this.app.use(compression());

    // Request logging
    this.app.use(requestLogger);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy (for deployed environments)
    this.app.set('trust proxy', 1);
  }

  initializeRoutes() {
    // Health check endpoint at root
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Teacher-Student API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    const apiPrefix = process.env.API_PREFIX || '/api';
    this.app.use(apiPrefix, apiRoutes);
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Test database connection
      const isDbConnected = await dbConfig.testConnection();
      if (!isDbConnected) {
        throw new Error('Failed to connect to database');
      }

      console.log('✅ Database connection established');

      // Start server
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📚 API Documentation available at http://localhost:${this.port}`);
        console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      return this.server;
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    await dbConfig.closePool();
    console.log('🛑 Server stopped');
  }

  getApp() {
    return this.app;
  }
}

module.exports = App;
