
const path = require('path');
const { spawn } = require('child_process');
// === Start Python Embedding Server ===
const pythonVenvPath = path.join(__dirname, 'embedding_venv', 'bin', 'python');
const pythonScriptPath = path.join(__dirname, 'embedding_service', 'embedding_server.py');
const pythonProcess = spawn(pythonVenvPath, [pythonScriptPath]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`[Python] ${data}`);
});
pythonProcess.stderr.on('data', (data) => {
  console.error(`[Python Error] ${data}`);
});
pythonProcess.on('close', (code) => {
  console.log(`[Python] Process exited with code ${code}`);
});
// === End Python Embedding Server ===

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db'); 
const admin = require('./config/firebaseAdmin')
//const { initializeFirebaseAdmin, getDb } = require('./config/firebaseAdmin');
const PORT = process.env.PORT || 5000;

/*
// Connect to the database
console.log("Connecting to MongoDB...");
connectDB().then(() => {
  console.log("MongoDB connected successfully.");
}).catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});
*/
// Initialize Express app
const app = express();

// Trust proxy - Important for Cloudflare tunnel
app.set('trust proxy', true);

// ============================================================
// COMPRESSION MIDDLEWARE - MUST BE FIRST
// Reduces API response sizes by 90% (10MB → 1MB)
// ============================================================
app.use(compression({
  // Compress all responses
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  // Compression level (0-9, 6 is default, good balance)
  level: 6,
  // Minimum response size to compress (1KB)
  threshold: 1024
}));
console.log('✅ Response compression enabled (gzip/brotli)');

// Middleware - CORS Configuration
// DEVELOPMENT ONLY: Allow all origins for CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));
app.use(bodyParser.json()); // Parse JSON requests
app.use(express.json());

// Default route for root URL
app.get('/', (req, res) => {
  console.log("Received request for root URL");
  res.status(200).send('Hello World');
});

// Serve static files from the uploads directory with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  immutable: false,
  setHeaders: (res, filePath) => {
    // Cache images for 7 days
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
    }
  }
}));
console.log('✅ Static asset caching enabled (7-day cache for images)');

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
const adminAuthRoutes = require('./api/routes/adminAuthRoutes'); // Import admin auth routes
const adminUserManagementRoutes = require('./api/routes/adminUserManagementRoutes'); // Import admin user management routes

const feedbackRoutes = require('./api/routes/feedbackRoutes'); // Import feedback routes
const fabricDataRoutes = require('./api/routes/fabricDataRoutes'); // Import Fabric/Power BI data routes
app.use('/api/feedback', feedbackRoutes); // Feedback submission and admin review

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
app.use('/api/admin/auth', adminAuthRoutes); // Admin authentication routes (login, register, profile, change-password)
app.use('/api/admin/users', adminUserManagementRoutes); // Admin user management routes (Platform Admin only)
app.use('/api/admin/fabric', fabricDataRoutes); // Microsoft Fabric / Power BI data routes

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  console.log(`API route not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'API route not found' });
});

// Handle other routes (optional)
app.get('*', (req, res) => {
  console.log(`Route not found: ${req.originalUrl}`);
  res.status(404).send('Cannot GET ' + req.originalUrl);
})


// Connect to MongoDB then start server
console.log("Connecting to MongoDB...");
connectDB()
  .then(() => {
    console.log("MongoDB connected successfully.");
    // Start server only after DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// Add error handler for Firebase
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'FirebaseError') {
    return res.status(500).json({ error: 'Firebase operation failed' });
  }
  next(err);
});