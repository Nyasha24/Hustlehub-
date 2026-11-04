const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createToken } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

describe('Authentication & JWT Security Unit Tests', () => {
  const testSecret = 'test_secret_key_12345';
  process.env.JWT_SECRET = testSecret;

  describe('Password Hashing with Bcrypt', () => {
    test('bcrypt securely hashes plain text password and validates comparison', async () => {
      const plainPassword = 'SuperSecurePassword2026!';
      const saltRounds = 12;
      const hash = await bcrypt.hash(plainPassword, saltRounds);

      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith('$2b$12$') || hash.startsWith('$2a$12$')).toBe(true);

      const isValid = await bcrypt.compare(plainPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('WrongPassword!', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    test('createToken returns signed JWT containing user id and role payload', () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        role: 'freelancer'
      };

      const token = createToken(mockUser);
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, testSecret);
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.role).toBe('freelancer');
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('Auth Middleware (protect)', () => {
    test('returns 401 when Authorization header is missing', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when token is invalid', () => {
      const req = {
        headers: { authorization: 'Bearer invalid.token.value' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('attaches decoded user and calls next() when token is valid', () => {
      const validToken = jwt.sign(
        { id: '12345', role: 'client' },
        testSecret,
        { expiresIn: '1h' }
      );

      const req = {
        headers: { authorization: `Bearer ${validToken}` }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      protect(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('12345');
      expect(req.user.role).toBe('client');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Role-Based Access Control Middleware (authorizeRoles)', () => {
    test('calls next() when user role matches allowed roles', () => {
      const middleware = authorizeRoles('admin', 'freelancer');
      const req = { user: { id: '123', role: 'freelancer' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('returns 403 Access denied when user role is not authorized', () => {
      const middleware = authorizeRoles('admin');
      const req = { user: { id: '123', role: 'client' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});