// utils/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET;

console.log('MIDDLEWARE JWT_SECRET_KEY:', JWT_SECRET_KEY); // Add this line to log the secret key
// Middleware to verify JWT token and extract user role
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from 'Authorization' header
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    // console.log('Decoded JWT token:', decoded); // Log the decoded token
    req.user = decoded; // Attach the decoded payload to the request object
    next(); // Continue to the next middleware/route
  } catch (error) {
    // Suppress logging for expected errors (malformed tokens from logout or no login)
    // Only log unexpected errors like signature verification failures
    if (error.name === 'JsonWebTokenError' && error.message.includes('malformed')) {
      // Silent - these are expected when not logged in
    } else if (error.name === 'TokenExpiredError') {
      // Silent - these are expected when sessions expire
    } else {
      // Log unexpected errors
      console.error('Error verifying token:', error);
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to restrict access based on roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { verifyToken, restrictTo };
