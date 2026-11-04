const express = require('express');
const router = express.Router();

const {
  register,
  login,
  googleLogin,
  getProfile,
  getAllUsers
} = require('../controllers/authController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.get('/me', protect, getProfile);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);

module.exports = router;