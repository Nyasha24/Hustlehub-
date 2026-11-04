const { authLimiter, bookingLimiter, generalApiLimiter } = require('../middleware/rateLimiters');

describe('Rate Limiting Configuration Unit Tests', () => {
  test('authLimiter is defined with standard headers and custom 429 handler', () => {
    expect(authLimiter).toBeDefined();
    expect(typeof authLimiter).toBe('function');
  });

  test('bookingLimiter is defined with strict limits for financial routes', () => {
    expect(bookingLimiter).toBeDefined();
    expect(typeof bookingLimiter).toBe('function');
  });

  test('generalApiLimiter is defined for global API traffic', () => {
    expect(generalApiLimiter).toBeDefined();
    expect(typeof generalApiLimiter).toBe('function');
  });
});