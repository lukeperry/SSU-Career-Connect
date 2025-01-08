// server.js
require('dotenv').config();
console.log("Welcome to SSU Career Connect!");
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db'); 
const PORT = process.env.PORT;
const path = require('path');

// Connect to the database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());  // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON requests
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to SSU Career Connect Platform!');
});

// Import routes
const authRoutes = require('./api/routes/authRoutes');
const jobRoutes = require('./api/routes/jobRoutes');
const userRoutes = require('./api/routes/userRoutes');
const applicationRoutes = require('./api/routes/applicationRoute');  // Import the application routes
const dashboardRoutes = require('./api/routes/dashboardRoutes');
const hrRoutes = require('./api/routes/hrRoutes'); // Import HR routes

// Use routes
app.use('/api/auth', authRoutes);  // Auth-related routes like login, register
app.use('/api/jobs', jobRoutes);   // Job-related routes like create job, list jobs
app.use('/api/users', userRoutes); // User-related routes like profile management
app.use('/api/application', applicationRoutes); // Application routes for talents and HRs
app.use('/api/dashboard', dashboardRoutes); // Dashboard routes for talents and HRs
app.use('/api/hr', hrRoutes); // Use HR routes

//production scripts
app.use(express.static("./client/build"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));