const dbConfig = require('../config/database');

class TeacherStudentRepository {
  /**
   * Register students to a teacher
   * @param {number} teacherId - Teacher ID
   * @param {number[]} studentIds - Array of student IDs
   * @returns {Promise<void>}
   */
  async registerStudents(teacherId, studentIds) {
    if (studentIds.length === 0) return;

    const connection = await dbConfig.beginTransaction();

    try {
      // Use INSERT IGNORE to avoid duplicate key errors
      const values = studentIds.map(studentId => [teacherId, studentId]);
      const placeholders = values.map(() => '(?, ?)').join(',');
      const query = `INSERT IGNORE INTO teacher_students (teacher_id, student_id) VALUES ${placeholders}`;
      const flatValues = values.flat();

      await connection.execute(query, flatValues);
      await connection.commit();
      connection.release();
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  /**
   * Get students registered to a specific teacher
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Array>} - Array of student objects
   */
  async getStudentsByTeacher(teacherId) {
    const query = `
      SELECT s.* 
      FROM students s
      INNER JOIN teacher_students ts ON s.id = ts.student_id
      WHERE ts.teacher_id = ?
      ORDER BY s.email
    `;
    return await dbConfig.query(query, [teacherId]);
  }

  /**
   * Get students registered to multiple teachers (intersection)
   * @param {number[]} teacherIds - Array of teacher IDs
   * @returns {Promise<Array>} - Array of student objects common to all teachers
   */
  async getCommonStudents(teacherIds) {
    if (teacherIds.length === 0) return [];

    if (teacherIds.length === 1) {
      return await this.getStudentsByTeacher(teacherIds[0]);
    }

    const placeholders = teacherIds.map(() => '?').join(',');
    const query = `
      SELECT s.*, COUNT(DISTINCT ts.teacher_id) as teacher_count
      FROM students s
      INNER JOIN teacher_students ts ON s.id = ts.student_id
      WHERE ts.teacher_id IN (${placeholders})
      GROUP BY s.id, s.email, s.is_suspended, s.created_at, s.updated_at
      HAVING teacher_count = ?
      ORDER BY s.email
    `;

    const params = [...teacherIds, teacherIds.length];
    return await dbConfig.query(query, params);
  }

  /**
   * Get teachers for a specific student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} - Array of teacher objects
   */
  async getTeachersByStudent(studentId) {
    const query = `
      SELECT t.* 
      FROM teachers t
      INNER JOIN teacher_students ts ON t.id = ts.teacher_id
      WHERE ts.student_id = ?
      ORDER BY t.email
    `;
    return await dbConfig.query(query, [studentId]);
  }

  /**
   * Check if a student is registered to a teacher
   * @param {number} teacherId - Teacher ID
   * @param {number} studentId - Student ID
   * @returns {Promise<boolean>} - True if registered, false otherwise
   */
  async isStudentRegisteredToTeacher(teacherId, studentId) {
    const query = `
      SELECT 1 FROM teacher_students 
      WHERE teacher_id = ? AND student_id = ?
    `;
    const results = await dbConfig.query(query, [teacherId, studentId]);
    return results.length > 0;
  }

  /**
   * Remove student from teacher
   * @param {number} teacherId - Teacher ID
   * @param {number} studentId - Student ID
   * @returns {Promise<boolean>} - True if removed, false if not found
   */
  async unregisterStudent(teacherId, studentId) {
    const query = `
      DELETE FROM teacher_students 
      WHERE teacher_id = ? AND student_id = ?
    `;
    const result = await dbConfig.query(query, [teacherId, studentId]);
    return result.affectedRows > 0;
  }

  /**
   * Get all teacher-student relationships
   * @returns {Promise<Array>} - Array of relationship objects
   */
  async getAllRelationships() {
    const query = `
      SELECT ts.*, t.email as teacher_email, s.email as student_email
      FROM teacher_students ts
      INNER JOIN teachers t ON ts.teacher_id = t.id
      INNER JOIN students s ON ts.student_id = s.id
      ORDER BY t.email, s.email
    `;
    return await dbConfig.query(query);
  }

  /**
   * Get students who can receive notifications from a teacher
   * This includes:
   * 1. Students registered to the teacher (and not suspended)
   * 2. Students mentioned in the notification (and not suspended)
   * @param {number} teacherId - Teacher ID
   * @param {string[]} mentionedEmails - Array of mentioned student emails
   * @returns {Promise<Array>} - Array of student objects
   */
  async getNotificationRecipients(teacherId, mentionedEmails = []) {
    let query = `
      SELECT DISTINCT s.email
      FROM students s
      WHERE s.is_suspended = FALSE AND (
    `;

    const conditions = [];
    const params = [];

    // Add condition for registered students
    conditions.push(`
      s.id IN (
        SELECT ts.student_id 
        FROM teacher_students ts 
        WHERE ts.teacher_id = ?
      )
    `);
    params.push(teacherId);

    // Add condition for mentioned students
    if (mentionedEmails.length > 0) {
      const placeholders = mentionedEmails.map(() => '?').join(',');
      conditions.push(`s.email IN (${placeholders})`);
      params.push(...mentionedEmails);
    }

    query += conditions.join(' OR ') + ') ORDER BY s.email';

    const results = await dbConfig.query(query, params);
    return results.map(row => row.email);
  }
}

module.exports = TeacherStudentRepository;
