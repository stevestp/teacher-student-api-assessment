const {
  extractMentionedEmails,
  normalizeEmails,
  removeDuplicates,
  isValidEmail
} = require('../src/utils/helpers');

describe('Utility Functions', () => {
  describe('extractMentionedEmails', () => {
    it('should extract mentioned emails from notification text', () => {
      const text = 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com';
      const expected = ['studentagnes@gmail.com', 'studentmiche@gmail.com'];

      const result = extractMentionedEmails(text);

      expect(result).toEqual(expected);
    });

    it('should return empty array when no emails are mentioned', () => {
      const text = 'Hello students! No mentions here.';

      const result = extractMentionedEmails(text);

      expect(result).toEqual([]);
    });

    it('should handle duplicate mentions', () => {
      const text = 'Hello @student@gmail.com and @student@gmail.com again!';

      const result = extractMentionedEmails(text);

      expect(result).toEqual(['student@gmail.com']);
    });

    it('should handle complex email formats', () => {
      const text = 'Contact @john.doe+test@university.edu.sg for details';

      const result = extractMentionedEmails(text);

      expect(result).toEqual(['john.doe+test@university.edu.sg']);
    });

    it('should handle empty or null input', () => {
      expect(extractMentionedEmails('')).toEqual([]);
      expect(extractMentionedEmails(null)).toEqual([]);
      expect(extractMentionedEmails(undefined)).toEqual([]);
    });
  });

  describe('normalizeEmails', () => {
    it('should normalize single email to lowercase', () => {
      const email = 'TEACHER@GMAIL.COM';

      const result = normalizeEmails(email);

      expect(result).toBe('teacher@gmail.com');
    });

    it('should normalize array of emails', () => {
      const emails = ['TEACHER@GMAIL.COM', ' student@EXAMPLE.com '];

      const result = normalizeEmails(emails);

      expect(result).toEqual(['teacher@gmail.com', 'student@example.com']);
    });

    it('should trim whitespace', () => {
      const email = '  teacher@gmail.com  ';

      const result = normalizeEmails(email);

      expect(result).toBe('teacher@gmail.com');
    });
  });

  describe('removeDuplicates', () => {
    it('should remove duplicate values from array', () => {
      const array = ['a', 'b', 'a', 'c', 'b'];

      const result = removeDuplicates(array);

      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty array', () => {
      const result = removeDuplicates([]);

      expect(result).toEqual([]);
    });

    it('should handle array with no duplicates', () => {
      const array = ['a', 'b', 'c'];

      const result = removeDuplicates(array);

      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user name@domain.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });
});
