const express = require('express');
const router = express.Router();

const {
  getTransactions,
  getFreelancerIncomeSummary
} = require('../controllers/transactionController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTransactions);
router.get('/freelancer-income', authorizeRoles('freelancer', 'admin'), getFreelancerIncomeSummary);

module.exports = router;