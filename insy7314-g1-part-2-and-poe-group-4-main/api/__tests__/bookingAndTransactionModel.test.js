const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

describe('Booking & Transaction Model Unit Tests', () => {
  const dummyClientId = new mongoose.Types.ObjectId();
  const dummyFreelancerId = new mongoose.Types.ObjectId();
  const dummyGigId = new mongoose.Types.ObjectId();
  const dummyBookingId = new mongoose.Types.ObjectId();

  describe('Booking Model', () => {
    test('validates successfully with complete parameters', () => {
      const booking = new Booking({
        client: dummyClientId,
        freelancer: dummyFreelancerId,
        gig: dummyGigId,
        amount: 200,
        requirements: 'Need a custom responsive web application.',
        status: 'pending'
      });

      const err = booking.validateSync();
      expect(err).toBeUndefined();
      expect(booking.amount).toBe(200);
      expect(booking.status).toBe('pending');
    });

    test('fails validation when required fields are missing', () => {
      const booking = new Booking({});
      const err = booking.validateSync();

      expect(err.errors.client).toBeDefined();
      expect(err.errors.freelancer).toBeDefined();
      expect(err.errors.gig).toBeDefined();
      expect(err.errors.amount).toBeDefined();
      expect(err.errors.requirements).toBeDefined();
    });
  });

  describe('Transaction Model', () => {
    test('validates successfully with calculated financial values', () => {
      const transaction = new Transaction({
        booking: dummyBookingId,
        client: dummyClientId,
        freelancer: dummyFreelancerId,
        amount: 200,
        platformFee: 20,
        estimatedTax: 27,
        netFreelancerIncome: 180,
        paymentMethod: 'simulated_card',
        status: 'completed'
      });

      const err = transaction.validateSync();
      expect(err).toBeUndefined();
      expect(transaction.netFreelancerIncome).toBe(180);
      expect(transaction.estimatedTax).toBe(27);
    });
  });
});