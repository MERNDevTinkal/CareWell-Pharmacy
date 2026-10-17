const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carewell_pharmacy');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
