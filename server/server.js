require('dotenv').config();
console.log("Welcome to SSU Career Connect!");
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db'); 
const { initializeFirebaseAdmin, getDb } = require('./config/firebaseAdmin');
const path = require('path');
const PORT = process.env.PORT || 5000;

// Connect to the database
console.log("Connecting to MongoDB...");
connectDB().then(() => {
  console.log("MongoDB connected successfully.");
}).catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors());  // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON requests
app.use(express.json());

// Default route for root URL
app.get('/', (req, res) => {
  console.log("Received request for root URL");
  res.status(200).send('Hello World');
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./api/routes/authRoutes');
const jobRoutes = require('./api/routes/jobRoutes');
const userRoutes = require('./api/routes/userRoutes');
const applicationRoutes = require('./api/routes/applicationRoute');  // Import the application routes
const dashboardRoutes = require('./api/routes/dashboardRoutes');
const hrRoutes = require('./api/routes/hrRoutes'); // Import HR routes
const talentRoutes = require('./api/routes/talentRoutes'); // Import Talent routes
const matchRoutes = require('./api/routes/matchRoutes'); // Import Match routes
const notificationRoutes = require('./api/routes/notificationRoutes'); // Import notification routes
const messageRoutes = require('./api/routes/messageRoutes'); // Import message routes

// Use routes
app.use('/api/auth', authRoutes);  // Auth-related routes like login, register
app.use('/api/jobs', jobRoutes);   // Job-related routes like create job, list jobs
app.use('/api/users', userRoutes); // User-related routes like profile management
app.use('/api/application', applicationRoutes); // Use the application routes
app.use('/api/dashboard', dashboardRoutes); // Dashboard routes for talents and HRs
app.use('/api/hr', hrRoutes); // Use HR routes
app.use('/api/talent', talentRoutes); // Use Talent routes
app.use('/api/match', matchRoutes); // Use Match routes
app.use('/api/notifications', notificationRoutes); // Notification routes
app.use('/api/messages', messageRoutes); // Message routes

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  console.log(`API route not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'API route not found' });
});

// Handle other routes (optional)
app.get('*', (req, res) => {
  console.log(`Route not found: ${req.originalUrl}`);
  res.status(404).send('Cannot GET ' + req.originalUrl);
});

// Initialize Firebase Admin
console.log("Initializing Firebase Admin...");
initializeFirebaseAdmin().then(() => {
  console.log("Firebase Admin initialized successfully.");
  // Ensure Firestore is initialized
  const db = getDb();
  if (!db) {
    throw new Error('Firestore has not been initialized.');
  }

  // Start the server after Firebase Admin is initialized
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1); // Exit the process with failure if initialization fails
});