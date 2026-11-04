const { swaggerDocument } = require('../config/swagger');
const { isStrongPassword } = require('../controllers/authController');

describe('Extended Auth & Swagger Specification Unit Tests', () => {
  test('Swagger document contains OpenAPI 3.0 specification with complete paths', () => {
    expect(swaggerDocument.openapi).toBe('3.0.0');
    expect(swaggerDocument.info.title).toContain('HustleHub+');
    expect(swaggerDocument.paths['/health']).toBeDefined();
    expect(swaggerDocument.paths['/api/auth/register']).toBeDefined();
    expect(swaggerDocument.paths['/api/auth/login']).toBeDefined();
    expect(swaggerDocument.paths['/api/auth/google']).toBeDefined();
    expect(swaggerDocument.paths['/api/gigs']).toBeDefined();
    expect(swaggerDocument.paths['/api/bookings']).toBeDefined();
    expect(swaggerDocument.paths['/api/transactions']).toBeDefined();
  });

  test('Password validator verifies complex passwords for resets', () => {
    expect(isStrongPassword('NewSecurePass2026!').valid).toBe(true);
    expect(isStrongPassword('weakpass').valid).toBe(false);
  });
});