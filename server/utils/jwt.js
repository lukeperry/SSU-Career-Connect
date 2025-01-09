// utils/jwt.js
const jwt = require('jsonwebtoken');

// Secret key to sign JWT (store in environment variables for security)
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';

// Function to generate a JWT token
const generateToken = (user) => {
  const payload = {
    userId: user._id, // Store user ID or other relevant information
    username: user.username,
  };

  // Create a JWT token with a secret key and expiration time (optional)
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1h' });

  return token;
};

module.exports = { generateToken };
