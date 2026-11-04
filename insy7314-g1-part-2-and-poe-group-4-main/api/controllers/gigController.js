const mongoose = require('mongoose');  // require mongoose dependency to connecet to mongodb
const Gig = require('../models/Gig');
const { seedInitialGigs } = require('../config/seedData');

const getAllGigs = async (req, res, next) => {
  try {                                                // getting all the gigs
    const gigs = await Gig.find()
      .populate('freelancer', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: gigs.length,
      data: gigs
    });
  } catch (error) {
    return next(error);
  }
};

const getGigById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid gig ID format' });
    }

    const gig = await Gig.findById(id).populate('freelancer', 'fullName email');

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    return res.status(200).json({ data: gig });
  } catch (error) {
    return next(error);
  }
};

const createGig = async (req, res, next) => {
  try {
    const { title, category, description, price, deliveryDays, location, image, tags } = req.body;

    if (!title || !category || !description || !price) {
      return res.status(400).json({ error: 'Title, category, description, and price are required' });
    }

    const newGig = await Gig.create({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      deliveryDays: deliveryDays ? Math.max(1, Math.min(60, Number(deliveryDays))) : 3,
      location: location ? location.trim() : 'South Africa (Remote)',
      image: image && image.trim() ? image.trim() : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Verified', 'Freelance']),
      freelancer: req.user.id
    });

    return res.status(201).json({
      message: 'Gig created successfully',
      data: newGig
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
};

const updateGig = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid gig ID format' });
    }

    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // RBAC + Ownership check: only owner freelancer or admin can update
    if (req.user.role !== 'admin' && gig.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only update your own gigs' });
    }

    const updatedGig = await Gig.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      message: 'Gig updated successfully',
      data: updatedGig
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
};

const deleteGig = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid gig ID format' });
    }

    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // RBAC + Ownership check: only owner freelancer or admin can delete
    if (req.user.role !== 'admin' && gig.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only delete your own gigs' });
    }  // checks if the right person is trying to delete a gif

    await Gig.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Gig deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

const seedGigs = async (req, res, next) => {
  try {
    const { force } = req.query;
    const result = await seedInitialGigs(force === 'true');
    return res.status(200).json({
      message: result.seeded ? 'Database seeded successfully' : 'Database already seeded',
      ...result
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  seedGigs
};