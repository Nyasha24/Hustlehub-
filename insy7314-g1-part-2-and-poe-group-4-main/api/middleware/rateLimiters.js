const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Authentication Endpoints (Register & Login)
 * Mitigates Brute-Force and Credential Stuffing Attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfterMinutes: 15
    });
  }
});

/**
 * Rate Limiter for Sensitive Booking & Transaction Endpoints
 * Mitigates Financial Spam and Automated Order Floods
 */
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 bookings per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Booking rate limit reached. Please wait a moment before creating more bookings.',
      code: 'BOOKING_RATE_LIMIT_EXCEEDED',
      retryAfterMinutes: 15
    });
  }
});

/**
 * General API Limiter for Public Endpoints
 */
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Too many requests across API endpoints. Please slow down.',
      code: 'API_RATE_LIMIT_EXCEEDED'
    });
  }
});

module.exports = {
  authLimiter,
  bookingLimiter,
  generalApiLimiter
};