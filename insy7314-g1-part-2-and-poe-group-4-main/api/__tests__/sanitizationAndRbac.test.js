const { sanitizeValue } = require('../middleware/sanitizeInput');
const { isStrongPassword } = require('../controllers/authController');

describe('Security & Sanitization Unit Tests', () => {
  describe('Input Sanitization (XSS & NoSQL Injection)', () => {
    test('strips HTML script tags from string input', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello World';
      const clean = sanitizeValue(maliciousInput);
      expect(clean).toBe('Hello World');
      expect(clean).not.toContain('<script>');
    });

    test('strips NoSQL query operators from objects', () => {
      const maliciousObject = {
        email: 'user@example.com',
        $gt: '',
        'admin.role': 'superadmin'
      };
      const clean = sanitizeValue(maliciousObject);
      expect(clean.email).toBe('user@example.com');
      expect(clean['$gt']).toBeUndefined();
      expect(clean['admin.role']).toBeUndefined();
    });
  });

  describe('Password Complexity Validation', () => {
    test('approves complex passwords with uppercase, lowercase, numbers, and symbols', () => {
      const result = isStrongPassword('HustleHubPass2026!');
      expect(result.valid).toBe(true);
    });

    test('rejects passwords under 8 characters', () => {
      const result = isStrongPassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    test('rejects passwords missing uppercase letters', () => {
      const result = isStrongPassword('nouppercase2026!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    test('rejects passwords missing numbers', () => {
      const result = isStrongPassword('NoNumbersHere!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });

    test('rejects passwords missing special characters', () => {
      const result = isStrongPassword('NoSpecialChar2026');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('special character');
    });
  });
});