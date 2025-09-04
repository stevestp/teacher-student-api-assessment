const TeacherStudentService = require('../services/TeacherStudentService');
const { asyncHandler } = require('../middlewares/errorHandler');

class TeacherStudentController {
  constructor() {
    this.teacherStudentService = new TeacherStudentService();
  }

  /**
   * Register students to a teacher
   * POST /api/register
   */
  register = asyncHandler(async (req, res) => {
    const { teacher, students } = req.body;

    await this.teacherStudentService.registerStudents(teacher, students);

    res.status(204).send();
  });

  /**
   * Get common students for given teachers
   * GET /api/commonstudents?teacher=email1&teacher=email2
   */
  getCommonStudents = asyncHandler(async (req, res) => {
    const { teacher } = req.query;

    if (!teacher) {
      return res.status(400).json({
        message: 'Teacher parameter is required'
      });
    }

    const students = await this.teacherStudentService.getCommonStudents(teacher);

    res.status(200).json({
      students
    });
  });

  /**
   * Suspend a student
   * POST /api/suspend
   */
  suspend = asyncHandler(async (req, res) => {
    const { student } = req.body;

    await this.teacherStudentService.suspendStudent(student);

    res.status(204).send();
  });

  /**
   * Get students who can receive notifications
   * POST /api/retrievefornotifications
   */
  retrieveForNotifications = asyncHandler(async (req, res) => {
    const { teacher, notification } = req.body;

    const recipients = await this.teacherStudentService.getNotificationRecipients(
      teacher,
      notification
    );

    res.status(200).json({
      recipients
    });
  });

  /**
   * Health check endpoint
   * GET /api/health
   */
  healthCheck = asyncHandler(async (req, res) => {
    const isHealthy = await this.teacherStudentService.healthCheck();

    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Get API statistics
   * GET /api/stats
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await this.teacherStudentService.getStatistics();

    res.status(200).json({
      statistics: stats,
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = TeacherStudentController;
