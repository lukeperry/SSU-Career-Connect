// db.js

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// MongoDB connection string from .env
const dbURI = process.env.MONGODB_URI;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    process.exit(1); // Exit the process with failure if connection fails
  }
};

module.exports = connectDB;
