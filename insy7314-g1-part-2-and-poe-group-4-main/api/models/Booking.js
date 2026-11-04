const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
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
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: [true, 'Gig reference is required']
    },
    amount: {
      type: Number,
      required: [true, 'Booking amount is required'],
      min: [5, 'Minimum booking amount is 5']
    },
    requirements: {
      type: String,
      required: [true, 'Project requirements must be specified'],
      trim: true,
      minlength: [5, 'Requirements must be at least 5 characters'],
      maxlength: [1000, 'Requirements must not exceed 1000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
        message: '{VALUE} is not a valid booking status'
      },
      default: 'confirmed'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);