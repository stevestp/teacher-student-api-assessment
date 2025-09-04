const dbConfig = require('../config/database');

class StudentRepository {
  /**
   * Find student by email
   * @param {string} email - Student email
   * @returns {Promise<object|null>} - Student object or null
   */
  async findByEmail(email) {
    const query = 'SELECT * FROM students WHERE email = ?';
    const results = await dbConfig.query(query, [email]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a new student
   * @param {string} email - Student email
   * @returns {Promise<object>} - Created student object
   */
  async create(email) {
    const query = 'INSERT INTO students (email, is_suspended) VALUES (?, FALSE)';
    const result = await dbConfig.query(query, [email]);

    return {
      id: result.insertId,
      email: email,
      is_suspended: false,
      created_at: new Date()
    };
  }

  /**
   * Find or create student
   * @param {string} email - Student email
   * @returns {Promise<object>} - Student object
   */
  async findOrCreate(email) {
    let student = await this.findByEmail(email);

    if (!student) {
      student = await this.create(email);
    }

    return student;
  }

  /**
   * Find students by email list
   * @param {string[]} emails - Array of student emails
   * @returns {Promise<Array>} - Array of student objects
   */
  async findByEmails(emails) {
    if (emails.length === 0) return [];

    const placeholders = emails.map(() => '?').join(',');
    const query = `SELECT * FROM students WHERE email IN (${placeholders})`;
    return await dbConfig.query(query, emails);
  }

  /**
   * Suspend a student
   * @param {string} email - Student email
   * @returns {Promise<boolean>} - True if suspended, false if not found
   */
  async suspend(email) {
    const query = 'UPDATE students SET is_suspended = TRUE WHERE email = ?';
    const result = await dbConfig.query(query, [email]);
    return result.affectedRows > 0;
  }

  /**
   * Get all active (non-suspended) students
   * @returns {Promise<Array>} - Array of active student objects
   */
  async findAllActive() {
    const query = 'SELECT * FROM students WHERE is_suspended = FALSE ORDER BY email';
    return await dbConfig.query(query);
  }

  /**
   * Get all students
   * @returns {Promise<Array>} - Array of all student objects
   */
  async findAll() {
    const query = 'SELECT * FROM students ORDER BY email';
    return await dbConfig.query(query);
  }

  /**
   * Check if student is suspended
   * @param {string} email - Student email
   * @returns {Promise<boolean>} - True if suspended, false otherwise
   */
  async isSuspended(email) {
    const query = 'SELECT is_suspended FROM students WHERE email = ?';
    const results = await dbConfig.query(query, [email]);
    return results.length > 0 ? results[0].is_suspended : false;
  }

  /**
   * Unsuspend a student (for testing purposes)
   * @param {string} email - Student email
   * @returns {Promise<boolean>} - True if unsuspended, false if not found
   */
  async unsuspend(email) {
    const query = 'UPDATE students SET is_suspended = FALSE WHERE email = ?';
    const result = await dbConfig.query(query, [email]);
    return result.affectedRows > 0;
  }

  /**
   * Delete student by email
   * @param {string} email - Student email
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async deleteByEmail(email) {
    const query = 'DELETE FROM students WHERE email = ?';
    const result = await dbConfig.query(query, [email]);
    return result.affectedRows > 0;
  }
}

module.exports = StudentRepository;
