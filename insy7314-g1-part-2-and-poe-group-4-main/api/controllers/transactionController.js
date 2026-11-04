const Transaction = require('../models/Transaction');

const getTransactions = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'client') {
      query = { client: req.user.id };
    } else if (req.user.role === 'freelancer') {
      query = { freelancer: req.user.id };
    }

    const transactions = await Transaction.find(query)
      .populate('booking', 'status requirements')
      .populate('client', 'fullName email')
      .populate('freelancer', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    return next(error);
  }
};

const getFreelancerIncomeSummary = async (req, res, next) => {
  try {
    const freelancerId = req.user.id;

    const transactions = await Transaction.find({
      freelancer: freelancerId,
      status: 'completed'
    });

    const totalGrossEarnings = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPlatformFees = transactions.reduce((acc, curr) => acc + curr.platformFee, 0);
    const totalNetIncome = transactions.reduce((acc, curr) => acc + curr.netFreelancerIncome, 0);
    const totalEstimatedTax = transactions.reduce((acc, curr) => acc + curr.estimatedTax, 0);

    return res.status(200).json({
      freelancerId,
      completedTransactionsCount: transactions.length,
      financialSummary: {
        totalGrossEarnings: Math.round(totalGrossEarnings * 100) / 100,
        totalPlatformFees: Math.round(totalPlatformFees * 100) / 100,
        totalNetIncome: Math.round(totalNetIncome * 100) / 100,
        totalEstimatedTaxObligation: Math.round(totalEstimatedTax * 100) / 100,
        currency: 'USD'
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTransactions,
  getFreelancerIncomeSummary
};