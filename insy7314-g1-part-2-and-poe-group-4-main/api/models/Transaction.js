const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required']
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client reference is required']
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required']
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    platformFee: {
      type: Number,
      required: [true, 'Platform fee calculation is required'],
      default: 0
    },
    estimatedTax: {
      type: Number,
      required: [true, 'Estimated tax calculation is required'],
      default: 0
    },
    netFreelancerIncome: {
      type: Number,
      required: [true, 'Net income calculation is required'],
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['simulated_card', 'simulated_wallet'],
      default: 'simulated_card'
    },
    status: {
      type: String,
      enum: ['completed', 'refunded'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);