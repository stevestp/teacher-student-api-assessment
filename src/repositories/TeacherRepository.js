const dbConfig = require('../config/database');

class TeacherRepository {
  /**
   * Find teacher by email
   * @param {string} email - Teacher email
   * @returns {Promise<object|null>} - Teacher object or null
   */
  async findByEmail(email) {
    const query = 'SELECT * FROM teachers WHERE email = ?';
    const results = await dbConfig.query(query, [email]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a new teacher
   * @param {string} email - Teacher email
   * @returns {Promise<object>} - Created teacher object
   */
  async create(email) {
    const query = 'INSERT INTO teachers (email) VALUES (?)';
    const result = await dbConfig.query(query, [email]);

    return {
      id: result.insertId,
      email: email,
      created_at: new Date()
    };
  }

  /**
   * Find or create teacher
   * @param {string} email - Teacher email
   * @returns {Promise<object>} - Teacher object
   */
  async findOrCreate(email) {
    let teacher = await this.findByEmail(email);

    if (!teacher) {
      teacher = await this.create(email);
    }

    return teacher;
  }

  /**
   * Get all teachers
   * @returns {Promise<Array>} - Array of teacher objects
   */
  async findAll() {
    const query = 'SELECT * FROM teachers ORDER BY email';
    return await dbConfig.query(query);
  }

  /**
   * Find teachers by email list
   * @param {string[]} emails - Array of teacher emails
   * @returns {Promise<Array>} - Array of teacher objects
   */
  async findByEmails(emails) {
    if (emails.length === 0) return [];

    const placeholders = emails.map(() => '?').join(',');
    const query = `SELECT * FROM teachers WHERE email IN (${placeholders})`;
    return await dbConfig.query(query, emails);
  }

  /**
   * Delete teacher by email
   * @param {string} email - Teacher email
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async deleteByEmail(email) {
    const query = 'DELETE FROM teachers WHERE email = ?';
    const result = await dbConfig.query(query, [email]);
    return result.affectedRows > 0;
  }
}

module.exports = TeacherRepository;
