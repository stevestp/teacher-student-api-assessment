const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseConfig {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
      const url = new URL(databaseUrl);
      this.config = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
          rejectUnauthorized: false
        }
      };
    } else {
      this.config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database:
          process.env.NODE_ENV === 'test'
            ? process.env.TEST_DB_NAME || 'teacher_student_test_db'
            : process.env.DB_NAME || 'teacher_student_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      };
    }

    this.pool = null;
  }

  async createPool() {
    if (!this.pool) {
      this.pool = mysql.createPool(this.config);
    }
    return this.pool;
  }

  async getConnection() {
    if (!this.pool) {
      await this.createPool();
    }
    return this.pool.getConnection();
  }

  async query(sql, params = []) {
    if (!this.pool) {
      await this.createPool();
    }
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async beginTransaction() {
    const connection = await this.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  async closePool() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  // Health check method
  async testConnection() {
    try {
      const result = await this.query('SELECT 1 as test');
      return result.length > 0;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
const dbConfig = new DatabaseConfig();

module.exports = dbConfig;
