const express = require('express');
const TeacherStudentController = require('../controllers/TeacherStudentController');
const { validateRequest } = require('../middlewares/validation');
const {
  registerSchema,
  suspendSchema,
  retrieveForNotificationsSchema,
  queryTeacherSchema
} = require('../validators/schemas');

const router = express.Router();
const controller = new TeacherStudentController();

// Register students to teacher
router.post('/register', validateRequest(registerSchema, 'body'), controller.register);

// Get common students
router.get(
  '/commonstudents',
  validateRequest(queryTeacherSchema, 'query'),
  controller.getCommonStudents
);

// Suspend student
router.post('/suspend', validateRequest(suspendSchema, 'body'), controller.suspend);

// Retrieve students for notifications
router.post(
  '/retrievefornotifications',
  validateRequest(retrieveForNotificationsSchema, 'body'),
  controller.retrieveForNotifications
);

// Health check endpoint
router.get('/health', controller.healthCheck);

// Statistics endpoint
router.get('/stats', controller.getStatistics);

module.exports = router;
