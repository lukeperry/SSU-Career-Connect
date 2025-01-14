require('dotenv').config();
const mongoose = require('mongoose');
const Talent = require('../models/talent');

const createSampleTalent = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const sampleTalent = new Talent({
    firstName: 'John',
    lastName: 'Doe',
    birthday: new Date('1990-01-01'),
    gender: 'male',
    email: 'john.doe2@example.com', // Changed email to avoid duplication
    phoneNumber: '123-456-7890',
    password: 'password123', // Ensure to hash the password in a real application
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: '3 years of experience in software development.',
    location: 'New York'
  });

  await sampleTalent.save();
  console.log('Sample talent created:', sampleTalent);

  mongoose.disconnect();
};

createSampleTalent().catch(err => console.error('Error creating sample talent:', err));