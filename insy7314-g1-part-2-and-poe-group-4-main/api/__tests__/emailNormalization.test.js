const { buildUserEmailQuery } = require('../controllers/authController');

describe('Email Normalization and Gmail Dot-Invariance Unit Tests', () => {
  test('Standard non-Gmail email produces exact lowercase normalized query', () => {
    const query = buildUserEmailQuery('User.Test@Example.COM');
    expect(query).toEqual({ email: 'user.test@example.com' });
  });

  test('Gmail email query includes regex matching any internal dot placement', () => {
    const query = buildUserEmailQuery('mthunzi.sibiya2005@gmail.com');
    expect(query.$or).toBeDefined();
    expect(query.$or[0]).toEqual({ email: 'mthunzi.sibiya2005@gmail.com' });
    expect(query.$or[1].email.$regex).toBeInstanceOf(RegExp);

    const regex = query.$or[1].email.$regex;
    expect(regex.test('mthunzisibiya2005@gmail.com')).toBe(true);
    expect(regex.test('mthunzi.sibiya2005@gmail.com')).toBe(true);
    expect(regex.test('m.t.h.u.n.z.i.sibiya2005@gmail.com')).toBe(true);
    expect(regex.test('otheruser2005@gmail.com')).toBe(false);
  });

  test('Handles empty or undefined email safely', () => {
    const query = buildUserEmailQuery('');
    expect(query).toEqual({ email: '' });
  });
});
