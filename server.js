const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const salonRoutes = require('./routes/salonRoutes');

// Environment Validation
const requiredEnv = ['MONGODB_URI', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET_NAME'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
    console.error(`❌ CRITICAL ERROR: Missing environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

// Initialize app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/salons', salonRoutes);

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
