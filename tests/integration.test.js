const request = require('supertest');
const App = require('../src/app');

describe('Teacher-Student API Integration Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    app = new App();
    server = app.getApp();
  });

  afterAll(async () => {
    if (app) {
      await app.stop();
    }
  });

  describe('POST /api/register', () => {
    it('should register students to a teacher successfully', async () => {
      const requestBody = {
        teacher: 'teacherken@gmail.com',
        students: ['studentjon@gmail.com', 'studenthon@gmail.com']
      };

      const response = await request(server).post('/api/register').send(requestBody).expect(204);

      expect(response.body).toEqual({});
    });

    it('should handle duplicate registrations gracefully', async () => {
      const requestBody = {
        teacher: 'teacherken@gmail.com',
        students: ['studentjon@gmail.com']
      };

      // Register first time
      await request(server).post('/api/register').send(requestBody).expect(204);

      // Register same student again
      await request(server).post('/api/register').send(requestBody).expect(204);
    });

    it('should return 400 for invalid email format', async () => {
      const requestBody = {
        teacher: 'invalid-email',
        students: ['studentjon@gmail.com']
      };

      const response = await request(server).post('/api/register').send(requestBody).expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(server).post('/api/register').send({}).expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 400 for empty students array', async () => {
      const requestBody = {
        teacher: 'teacherken@gmail.com',
        students: []
      };

      const response = await request(server).post('/api/register').send(requestBody).expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/commonstudents', () => {
    beforeEach(async () => {
      // Setup test data
      const registrations = [
        {
          teacher: 'teacherken@gmail.com',
          students: [
            'commonstudent1@gmail.com',
            'commonstudent2@gmail.com',
            'student_only_under_teacher_ken@gmail.com'
          ]
        },
        {
          teacher: 'teacherjoe@gmail.com',
          students: [
            'commonstudent1@gmail.com',
            'commonstudent2@gmail.com',
            'student_only_under_teacher_joe@gmail.com'
          ]
        }
      ];

      for (const reg of registrations) {
        await request(server).post('/api/register').send(reg);
      }
    });

    it('should return students for a single teacher', async () => {
      const response = await request(server)
        .get('/api/commonstudents?teacher=teacherken%40gmail.com')
        .expect(200);

      expect(response.body).toHaveProperty('students');
      expect(response.body.students).toEqual(
        expect.arrayContaining([
          'commonstudent1@gmail.com',
          'commonstudent2@gmail.com',
          'student_only_under_teacher_ken@gmail.com'
        ])
      );
      expect(response.body.students).toHaveLength(3);
    });

    it('should return common students for multiple teachers', async () => {
      const response = await request(server)
        .get('/api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com')
        .expect(200);

      expect(response.body).toHaveProperty('students');
      expect(response.body.students).toEqual(
        expect.arrayContaining(['commonstudent1@gmail.com', 'commonstudent2@gmail.com'])
      );
      expect(response.body.students).toHaveLength(2);
    });

    it('should return 400 when teacher parameter is missing', async () => {
      const response = await request(server).get('/api/commonstudents').expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Validation error: "teacher" is required');
    });

    it('should handle non-existent teacher gracefully', async () => {
      const response = await request(server)
        .get('/api/commonstudents?teacher=nonexistent%40gmail.com')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/suspend', () => {
    beforeEach(async () => {
      // Register a student first
      await request(server)
        .post('/api/register')
        .send({
          teacher: 'teacherken@gmail.com',
          students: ['studentmary@gmail.com']
        });
    });

    it('should suspend a student successfully', async () => {
      const requestBody = {
        student: 'studentmary@gmail.com'
      };

      const response = await request(server).post('/api/suspend').send(requestBody).expect(204);

      expect(response.body).toEqual({});
    });

    it('should return 400 for invalid email format', async () => {
      const requestBody = {
        student: 'invalid-email'
      };

      const response = await request(server).post('/api/suspend').send(requestBody).expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation error');
    });

    it('should return 500 for non-existent student', async () => {
      const requestBody = {
        student: 'nonexistent@gmail.com'
      };

      const response = await request(server).post('/api/suspend').send(requestBody).expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/retrievefornotifications', () => {
    beforeEach(async () => {
      // Setup test data
      await request(server)
        .post('/api/register')
        .send({
          teacher: 'teacherken@gmail.com',
          students: ['studentbob@gmail.com', 'studentagnes@gmail.com']
        });
    });

    it('should retrieve notification recipients with mentions', async () => {
      const requestBody = {
        teacher: 'teacherken@gmail.com',
        notification: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com'
      };

      const response = await request(server)
        .post('/api/retrievefornotifications')
        .send(requestBody)
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).toEqual(expect.arrayContaining(['studentbob@gmail.com']));
    });

    it('should retrieve notification recipients without mentions', async () => {
      const requestBody = {
        teacher: 'teacherken@gmail.com',
        notification: 'Hey everybody'
      };

      const response = await request(server)
        .post('/api/retrievefornotifications')
        .send(requestBody)
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).toEqual(expect.arrayContaining(['studentbob@gmail.com']));
    });

    it('should exclude suspended students from recipients', async () => {
      // Suspend a student
      await request(server).post('/api/suspend').send({ student: 'studentbob@gmail.com' });

      const requestBody = {
        teacher: 'teacherken@gmail.com',
        notification: 'Hey everybody'
      };

      const response = await request(server)
        .post('/api/retrievefornotifications')
        .send(requestBody)
        .expect(200);

      expect(response.body).toHaveProperty('recipients');
      expect(response.body.recipients).not.toContain('studentbob@gmail.com');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(server)
        .post('/api/retrievefornotifications')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(server).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Statistics', () => {
    it('should return API statistics', async () => {
      const response = await request(server).get('/api/stats').expect(200);

      expect(response.body).toHaveProperty('statistics');
      expect(response.body.statistics).toHaveProperty('totalTeachers');
      expect(response.body.statistics).toHaveProperty('totalStudents');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(server).get('/api/nonexistent').expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Route /api/nonexistent not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(server)
        .post('/api/register')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });
});
