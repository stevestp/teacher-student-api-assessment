const TeacherStudentService = require('../src/services/TeacherStudentService');

// Mock the repositories
jest.mock('../src/repositories/TeacherRepository');
jest.mock('../src/repositories/StudentRepository');
jest.mock('../src/repositories/TeacherStudentRepository');

const TeacherRepository = require('../src/repositories/TeacherRepository');
const StudentRepository = require('../src/repositories/StudentRepository');
const TeacherStudentRepository = require('../src/repositories/TeacherStudentRepository');

describe('TeacherStudentService', () => {
  let service;
  let mockTeacherRepo;
  let mockStudentRepo;
  let mockTeacherStudentRepo;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockTeacherRepo = {
      findByEmail: jest.fn(),
      findOrCreate: jest.fn(),
      findByEmails: jest.fn()
    };

    mockStudentRepo = {
      findByEmail: jest.fn(),
      findOrCreate: jest.fn(),
      findByEmails: jest.fn(),
      suspend: jest.fn()
    };

    mockTeacherStudentRepo = {
      registerStudents: jest.fn(),
      getCommonStudents: jest.fn(),
      getNotificationRecipients: jest.fn()
    };

    // Mock the constructor calls
    TeacherRepository.mockImplementation(() => mockTeacherRepo);
    StudentRepository.mockImplementation(() => mockStudentRepo);
    TeacherStudentRepository.mockImplementation(() => mockTeacherStudentRepo);

    service = new TeacherStudentService();
  });

  describe('registerStudents', () => {
    it('should register students to teacher successfully', async () => {
      const teacherEmail = 'teacher@example.com';
      const studentEmails = ['student1@example.com', 'student2@example.com'];

      mockTeacherRepo.findOrCreate.mockResolvedValue({ id: 1, email: teacherEmail });
      mockStudentRepo.findOrCreate
        .mockResolvedValueOnce({ id: 1, email: studentEmails[0] })
        .mockResolvedValueOnce({ id: 2, email: studentEmails[1] });
      mockTeacherStudentRepo.registerStudents.mockResolvedValue();

      await service.registerStudents(teacherEmail, studentEmails);

      expect(mockTeacherRepo.findOrCreate).toHaveBeenCalledWith(teacherEmail);
      expect(mockStudentRepo.findOrCreate).toHaveBeenCalledTimes(2);
      expect(mockTeacherStudentRepo.registerStudents).toHaveBeenCalledWith(1, [1, 2]);
    });

    it('should handle duplicate student emails', async () => {
      const teacherEmail = 'teacher@example.com';
      const studentEmails = ['student1@example.com', 'student1@example.com'];

      mockTeacherRepo.findOrCreate.mockResolvedValue({ id: 1, email: teacherEmail });
      mockStudentRepo.findOrCreate.mockResolvedValue({ id: 1, email: studentEmails[0] });
      mockTeacherStudentRepo.registerStudents.mockResolvedValue();

      await service.registerStudents(teacherEmail, studentEmails);

      expect(mockStudentRepo.findOrCreate).toHaveBeenCalledTimes(1);
      expect(mockTeacherStudentRepo.registerStudents).toHaveBeenCalledWith(1, [1]);
    });
  });

  describe('getCommonStudents', () => {
    it('should get common students for single teacher', async () => {
      const teacherEmail = 'teacher@example.com';
      const expectedStudents = [
        { email: 'student1@example.com' },
        { email: 'student2@example.com' }
      ];

      mockTeacherRepo.findByEmails.mockResolvedValue([{ id: 1, email: teacherEmail }]);
      mockTeacherStudentRepo.getCommonStudents.mockResolvedValue(expectedStudents);

      const result = await service.getCommonStudents(teacherEmail);

      expect(result).toEqual(['student1@example.com', 'student2@example.com']);
      expect(mockTeacherRepo.findByEmails).toHaveBeenCalledWith([teacherEmail]);
      expect(mockTeacherStudentRepo.getCommonStudents).toHaveBeenCalledWith([1]);
    });

    it('should get common students for multiple teachers', async () => {
      const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      const expectedStudents = [{ email: 'common@example.com' }];

      mockTeacherRepo.findByEmails.mockResolvedValue([
        { id: 1, email: teacherEmails[0] },
        { id: 2, email: teacherEmails[1] }
      ]);
      mockTeacherStudentRepo.getCommonStudents.mockResolvedValue(expectedStudents);

      const result = await service.getCommonStudents(teacherEmails);

      expect(result).toEqual(['common@example.com']);
      expect(mockTeacherStudentRepo.getCommonStudents).toHaveBeenCalledWith([1, 2]);
    });

    it('should throw error when teacher not found', async () => {
      const teacherEmail = 'nonexistent@example.com';

      mockTeacherRepo.findByEmails.mockResolvedValue([]);

      await expect(service.getCommonStudents(teacherEmail)).rejects.toThrow(
        'Teachers not found: nonexistent@example.com'
      );
    });
  });

  describe('suspendStudent', () => {
    it('should suspend student successfully', async () => {
      const studentEmail = 'student@example.com';

      mockStudentRepo.findByEmail.mockResolvedValue({ id: 1, email: studentEmail });
      mockStudentRepo.suspend.mockResolvedValue(true);

      const result = await service.suspendStudent(studentEmail);

      expect(result).toBe(true);
      expect(mockStudentRepo.findByEmail).toHaveBeenCalledWith(studentEmail);
      expect(mockStudentRepo.suspend).toHaveBeenCalledWith(studentEmail);
    });

    it('should throw error when student not found', async () => {
      const studentEmail = 'nonexistent@example.com';

      mockStudentRepo.findByEmail.mockResolvedValue(null);

      await expect(service.suspendStudent(studentEmail)).rejects.toThrow(
        'Student not found: nonexistent@example.com'
      );
    });
  });

  describe('getNotificationRecipients', () => {
    it('should get notification recipients with mentions', async () => {
      const teacherEmail = 'teacher@example.com';
      const notification = 'Hello @mentioned@example.com';

      mockTeacherRepo.findByEmail.mockResolvedValue({ id: 1, email: teacherEmail });
      mockTeacherStudentRepo.getNotificationRecipients.mockResolvedValue([
        'registered@example.com',
        'mentioned@example.com'
      ]);

      const result = await service.getNotificationRecipients(teacherEmail, notification);

      expect(result).toEqual(['registered@example.com', 'mentioned@example.com']);
      expect(mockTeacherStudentRepo.getNotificationRecipients).toHaveBeenCalledWith(1, [
        'mentioned@example.com'
      ]);
    });

    it('should handle non-existent teacher with mentions', async () => {
      const teacherEmail = 'nonexistent@example.com';
      const notification = 'Hello @mentioned@example.com';

      mockTeacherRepo.findByEmail.mockResolvedValue(null);
      mockStudentRepo.findByEmails.mockResolvedValue([
        { email: 'mentioned@example.com', is_suspended: false }
      ]);

      const result = await service.getNotificationRecipients(teacherEmail, notification);

      expect(result).toEqual(['mentioned@example.com']);
    });

    it('should return empty array for non-existent teacher without mentions', async () => {
      const teacherEmail = 'nonexistent@example.com';
      const notification = 'Hello everyone';

      mockTeacherRepo.findByEmail.mockResolvedValue(null);

      const result = await service.getNotificationRecipients(teacherEmail, notification);

      expect(result).toEqual([]);
    });
  });
});
