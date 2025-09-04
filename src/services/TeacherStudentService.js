const TeacherRepository = require('../repositories/TeacherRepository');
const StudentRepository = require('../repositories/StudentRepository');
const TeacherStudentRepository = require('../repositories/TeacherStudentRepository');
const { normalizeEmails, extractMentionedEmails, removeDuplicates } = require('../utils/helpers');

class TeacherStudentService {
  constructor() {
    this.teacherRepo = new TeacherRepository();
    this.studentRepo = new StudentRepository();
    this.teacherStudentRepo = new TeacherStudentRepository();
  }

  /**
   * Register students to a teacher
   * @param {string} teacherEmail - Teacher email
   * @param {string[]} studentEmails - Array of student emails
   * @returns {Promise<void>}
   */
  async registerStudents(teacherEmail, studentEmails) {
    // Normalize emails
    const normalizedTeacherEmail = normalizeEmails(teacherEmail);
    const normalizedStudentEmails = normalizeEmails(studentEmails);

    // Remove duplicates from student emails
    const uniqueStudentEmails = removeDuplicates(normalizedStudentEmails);

    // Find or create teacher
    const teacher = await this.teacherRepo.findOrCreate(normalizedTeacherEmail);

    // Find or create students
    const students = [];
    for (const studentEmail of uniqueStudentEmails) {
      const student = await this.studentRepo.findOrCreate(studentEmail);
      students.push(student);
    }

    // Register relationships
    const studentIds = students.map(student => student.id);
    await this.teacherStudentRepo.registerStudents(teacher.id, studentIds);
  }

  /**
   * Get common students for given teachers
   * @param {string|string[]} teacherEmails - Teacher email(s)
   * @returns {Promise<string[]>} - Array of common student emails
   */
  async getCommonStudents(teacherEmails) {
    // Ensure teacherEmails is an array
    const emailArray = Array.isArray(teacherEmails) ? teacherEmails : [teacherEmails];

    // Normalize emails
    const normalizedEmails = normalizeEmails(emailArray);

    // Remove duplicates
    const uniqueTeacherEmails = removeDuplicates(normalizedEmails);

    // Find teachers
    const teachers = await this.teacherRepo.findByEmails(uniqueTeacherEmails);

    // Check if all teachers exist
    if (teachers.length !== uniqueTeacherEmails.length) {
      const foundEmails = teachers.map(t => t.email);
      const missingEmails = uniqueTeacherEmails.filter(email => !foundEmails.includes(email));
      throw new Error(`Teachers not found: ${missingEmails.join(', ')}`);
    }

    // Get common students
    const teacherIds = teachers.map(teacher => teacher.id);
    const commonStudents = await this.teacherStudentRepo.getCommonStudents(teacherIds);

    return commonStudents.map(student => student.email);
  }

  /**
   * Suspend a student
   * @param {string} studentEmail - Student email
   * @returns {Promise<boolean>} - True if suspended, false if student not found
   */
  async suspendStudent(studentEmail) {
    const normalizedEmail = normalizeEmails(studentEmail);

    // Check if student exists
    const student = await this.studentRepo.findByEmail(normalizedEmail);
    if (!student) {
      throw new Error(`Student not found: ${normalizedEmail}`);
    }

    // Suspend the student
    return await this.studentRepo.suspend(normalizedEmail);
  }

  /**
   * Get students who can receive notifications
   * @param {string} teacherEmail - Teacher email
   * @param {string} notification - Notification text
   * @returns {Promise<string[]>} - Array of recipient student emails
   */
  async getNotificationRecipients(teacherEmail, notification) {
    const normalizedTeacherEmail = normalizeEmails(teacherEmail);

    // Find teacher
    const teacher = await this.teacherRepo.findByEmail(normalizedTeacherEmail);
    if (!teacher) {
      // If teacher doesn't exist, only mentioned students can receive notifications
      const mentionedEmails = extractMentionedEmails(notification);
      if (mentionedEmails.length === 0) {
        return [];
      }

      // Check which mentioned students exist and are not suspended
      const normalizedMentioned = normalizeEmails(mentionedEmails);
      const mentionedStudents = await this.studentRepo.findByEmails(normalizedMentioned);

      return mentionedStudents
        .filter(student => !student.is_suspended)
        .map(student => student.email);
    }

    // Extract mentioned emails from notification
    const mentionedEmails = extractMentionedEmails(notification);
    const normalizedMentioned = normalizeEmails(mentionedEmails);

    // Get recipients (registered students + mentioned students, excluding suspended)
    const recipients = await this.teacherStudentRepo.getNotificationRecipients(
      teacher.id,
      normalizedMentioned
    );

    return removeDuplicates(recipients);
  }

  /**
   * Health check - verify database connectivity
   * @returns {Promise<boolean>} - True if healthy, false otherwise
   */
  async healthCheck() {
    try {
      // Simple query to check database connectivity
      const teachers = await this.teacherRepo.findAll();
      return Array.isArray(teachers);
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get statistics (for monitoring/debugging)
   * @returns {Promise<object>} - Statistics object
   */
  async getStatistics() {
    try {
      const [teachers, students, relationships] = await Promise.all([
        this.teacherRepo.findAll(),
        this.studentRepo.findAll(),
        this.teacherStudentRepo.getAllRelationships()
      ]);

      const suspendedStudents = students.filter(s => s.is_suspended);

      return {
        totalTeachers: teachers.length,
        totalStudents: students.length,
        suspendedStudents: suspendedStudents.length,
        activeStudents: students.length - suspendedStudents.length,
        totalRelationships: relationships.length
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw error;
    }
  }
}

module.exports = TeacherStudentService;
