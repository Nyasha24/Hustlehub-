const User = require('../models/User');

describe('User Model Validation Unit Tests', () => {
  test('User schema requires fullName and email', () => {
    const user = new User({});
    const err = user.validateSync();
    expect(err.errors.fullName).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  test('User schema accepts standard credentials', () => {
    const user = new User({
      fullName: 'Mthunzi Sibiya',
      email: 'mthunzi@example.com',
      passwordHash: 'hashedpassword123',
      role: 'freelancer'
    });
    const err = user.validateSync();
    expect(err).toBeUndefined();
    expect(user.role).toBe('freelancer');
  });

  test('User schema accepts Google SSO identity without password', () => {
    const user = new User({
      fullName: 'Google User',
      email: 'googleuser@gmail.com',
      googleId: 'google-oauth2-123456789',
      role: 'client'
    });
    const err = user.validateSync();
    expect(err).toBeUndefined();
    expect(user.googleId).toBe('google-oauth2-123456789');
  });

  test('User schema rejects invalid role', () => {
    const user = new User({
      fullName: 'Mthunzi Sibiya',
      email: 'mthunzi@example.com',
      role: 'superadmin'
    });
    const err = user.validateSync();
    expect(err.errors.role).toBeDefined();
  });
});