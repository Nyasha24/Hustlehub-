const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

const isStrongPassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };   //checking if the password fits all the given restrictions
                                                                                                                                                         
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
};


 // Normalizes email and creates a lookup query supporting Gmail dot-invariance
 
const buildUserEmailQuery = (rawEmail) => {
  const normalized = (rawEmail || '').toLowerCase().trim();
  if (normalized.endsWith('@gmail.com') || normalized.endsWith('@googlemail.com') || normalized.endsWith('@outlook.com') ) {   //checking if they use an valid doimain
    const [local, domain] = normalized.split('@');
    const stripped = local.replace(/\./g, '');
    const regexPattern = '^' + stripped.split('').join('\\.?') + '@' + domain.replace('.', '\\.') + '$';
    return {
      $or: [
        { email: normalized },
        { email: { $regex: new RegExp(regexPattern, 'i') } }
      ]
    };
  }
  return { email: normalized };
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });  //checking if all the need values are present in the request body
    }

    if (
      typeof fullName !== 'string' ||
      typeof email !== 'string' ||                    //checking if they have been sent as the right data type 
      typeof password !== 'string'      
    ) {
      return res.status(400).json({ error: 'Full name, email, and password must be text values' });
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne(buildUserEmailQuery(normalizedEmail)); // checking the database if the user exists already

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });   //returns error messag to th user 
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const assignedRole = role === 'freelancer' ? 'freelancer' : 'client';

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole
    });

    const token = createToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne(buildUserEmailQuery(normalizedEmail)).select('+passwordHash');

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Google OAuth 2.0 Token Verification & Unified Login
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID Token is required' });
    }

    // Verify Google ID Token via Google's tokeninfo API
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    const response = await fetch(googleVerifyUrl);
    const payload = await response.json();

    if (!response.ok || !payload.email) {
      return res.status(401).json({ error: 'Invalid or expired Google authentication token' });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const assignedRole = role === 'freelancer' ? 'freelancer' : 'client';
      user = await User.create({
        fullName: payload.name || payload.email.split('@')[0],
        email: normalizedEmail,
        googleId: payload.sub,
        role: assignedRole
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    const token = createToken(user);

    return res.status(200).json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('fullName email role createdAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('fullName email role createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: users.length,
      data: users
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createToken,
  isStrongPassword,
  buildUserEmailQuery,
  register,
  login,                            //exporting the modules 
  googleLogin,
  getProfile,
  getAllUsers
};