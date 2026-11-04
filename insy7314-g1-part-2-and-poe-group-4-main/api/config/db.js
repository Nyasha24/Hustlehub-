const mongoose = require('mongoose');
const { seedInitialGigs } = require('./seedData');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!mongoUri) {
      console.warn('No MONGO_URI or MONGO_URL provided. Database connection skipped.');
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Auto-seed high quality gigs if database is empty
    if (process.env.NODE_ENV !== 'test') {
      await seedInitialGigs();
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;