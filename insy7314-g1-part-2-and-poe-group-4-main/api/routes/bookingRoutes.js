const express = require('express');
const router = express.Router();

const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus
} = require('../controllers/bookingController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { bookingLimiter } = require('../middleware/rateLimiters');

// All booking routes require authentication
router.use(protect);

router.post('/', bookingLimiter, authorizeRoles('client', 'admin'), createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);

module.exports = router;