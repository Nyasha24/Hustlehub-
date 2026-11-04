const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gig title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must not exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: [
          'Web Development',
          'Design',
          'Design & Creative',
          'Writing',
          'Writing & Translation',
          'Marketing',
          'Digital Marketing',
          'Consulting',
          'AI & Tech Consulting',
          'Video & Audio',
          'Video & Animation'
        ],
        message: '{VALUE} is not an allowed category'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must not exceed 1000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [5, 'Minimum price is 5']
    },
    deliveryDays: {
      type: Number,
      required: [true, 'Delivery days required'],
      min: [1, 'Delivery time must be at least 1 day'],
      max: [60, 'Delivery time cannot exceed 60 days']
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required']
    },
    location: {
      type: String,
      default: 'South Africa (Remote)',
      trim: true
    },
    image: {
      type: String,
      default: '',
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

gigSchema.virtual('freelancerId').get(function () {
  return this.freelancer;
});

module.exports = mongoose.model('Gig', gigSchema);