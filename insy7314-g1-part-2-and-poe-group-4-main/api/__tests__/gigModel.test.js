const mongoose = require('mongoose');
const Gig = require('../models/Gig');

describe('Gig Model Schema Validation Tests', () => {
  const dummyFreelancerId = new mongoose.Types.ObjectId();

  test('Gig schema validates successfully with valid parameters', () => {
    const validGig = new Gig({
      title: 'Full-Stack Web Development',
      category: 'Web Development',
      description: 'Custom web application built with React and Node.js Express.',
      price: 150,
      deliveryDays: 7,
      freelancer: dummyFreelancerId
    });

    const err = validGig.validateSync();
    expect(err).toBeUndefined();
    expect(validGig.title).toBe('Full-Stack Web Development');
  });

  test('Gig schema fails when required fields are missing', () => {
    const invalidGig = new Gig({});
    const err = invalidGig.validateSync();

    expect(err.errors.title).toBeDefined();
    expect(err.errors.category).toBeDefined();
    expect(err.errors.description).toBeDefined();
    expect(err.errors.price).toBeDefined();
    expect(err.errors.deliveryDays).toBeDefined();
    expect(err.errors.freelancer).toBeDefined();
  });

  test('Gig schema rejects invalid category enum', () => {
    const invalidCategoryGig = new Gig({
      title: 'Valid Title Here',
      category: 'Unauthorized Category',
      description: 'Valid length description for the gig.',
      price: 50,
      deliveryDays: 3,
      freelancer: dummyFreelancerId
    });

    const err = invalidCategoryGig.validateSync();
    expect(err.errors.category).toBeDefined();
  });
});