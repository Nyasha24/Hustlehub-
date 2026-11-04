const express = require('express');
const router = express.Router();

const {
  getAllGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  seedGigs
} = require('../controllers/gigController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes (Clients and guests can browse available gigs)
router.get('/', getAllGigs);
router.post('/seed', seedGigs);
router.get('/:id', getGigById);

// Protected routes (Freelancers and Admins)
router.post('/', protect, authorizeRoles('freelancer', 'admin'), createGig);
router.put('/:id', protect, authorizeRoles('freelancer', 'admin'), updateGig);
router.delete('/:id', protect, authorizeRoles('freelancer', 'admin'), deleteGig);

module.exports = router;