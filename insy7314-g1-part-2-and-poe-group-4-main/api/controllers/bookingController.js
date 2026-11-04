const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Gig = require('../models/Gig');
const Transaction = require('../models/Transaction');

const createBooking = async (req, res, next) => {
  try {
    const { gigId, requirements } = req.body;

    if (!gigId || !requirements) {
      return res.status(400).json({ error: 'Gig ID and requirements are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({ error: 'Invalid gig ID format' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Clients cannot book their own gigs
    if (gig.freelancer.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot book your own service' });
    }

    const booking = await Booking.create({
      client: req.user.id,
      freelancer: gig.freelancer,
      gig: gig._id,
      amount: gig.price,
      requirements: requirements.trim(),
      status: 'confirmed'
    });

    // Automatically generate simulated transaction record and financial calculations
    const platformFee = Math.round(gig.price * 0.10 * 100) / 100; // 10% platform fee
    const netFreelancerIncome = Math.round((gig.price - platformFee) * 100) / 100;
    const estimatedTax = Math.round(netFreelancerIncome * 0.15 * 100) / 100; // 15% estimated tax obligation

    const transaction = await Transaction.create({
      booking: booking._id,
      client: req.user.id,
      freelancer: gig.freelancer,
      amount: gig.price,
      platformFee,
      netFreelancerIncome,
      estimatedTax,
      paymentMethod: 'simulated_card',
      status: 'completed'
    });

    return res.status(201).json({
      message: 'Booking and simulated transaction created successfully',
      booking,
      transaction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    let query = {};

    // RBAC: Clients see their own bookings; Freelancers see bookings for their gigs; Admins see all
    if (req.user.role === 'client') {
      query = { client: req.user.id };
    } else if (req.user.role === 'freelancer') {
      query = { freelancer: req.user.id };
    }

    const bookings = await Booking.find(query)
      .populate('client', 'fullName email')
      .populate('freelancer', 'fullName email')
      .populate('gig', 'title category price')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    return next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(id)
      .populate('client', 'fullName email')
      .populate('freelancer', 'fullName email')
      .populate('gig', 'title category price');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Ownership check: only client, freelancer, or admin can view
    const isOwner =
      req.user.role === 'admin' ||
      booking.client._id.toString() === req.user.id ||
      booking.freelancer._id.toString() === req.user.id;

    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: Unauthorized to view this booking' });
    }

    return res.status(200).json({ data: booking });
  } catch (error) {
    return next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const validStatuses = ['pending', 'confirmed', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // RBAC: Freelancer or Admin can advance progress; Client can cancel
    const isFreelancer = booking.freelancer.toString() === req.user.id;
    const isClient = booking.client.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isFreelancer && !isClient) {
      return res.status(403).json({ error: 'Access denied' });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus
};