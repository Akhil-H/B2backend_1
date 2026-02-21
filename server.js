const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
require('dotenv').config();

// AWS S3 Client Configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Multer S3 Configuration
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, `salons/${Date.now().toString()}-${file.originalname}`);
        }
    })
});

// Import Model
const Salon = require('./models/Salon');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing multipart/form-data
app.use(express.static(path.join(__dirname, 'public')));

// 2. MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ FATAL ERROR: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// 3. API Routes

/**
 * POST /api/salons
 * Adds a new salon to the database with multiple image uploads to S3
 */
app.post('/api/salons', upload.array('images', 5), async (req, res) => {
    try {
        console.log('--- Incoming Request Body ---');
        console.log(req.body);

        const { name, city, rating, latitude, longitude, features } = req.body;

        // Handle multiple images from S3
        const images = req.files ? req.files.map(file => file.location) : [];

        // If features is sent as a string (common with multipart/form-data), parse it
        let parsedFeatures = features;
        if (typeof features === 'string') {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (e) {
                console.error("Error parsing features JSON:", e);
            }
        }

        const newSalon = new Salon({
            name,
            city,
            rating: Number(rating) || 0,
            latitude: Number(latitude),
            longitude: Number(longitude),
            images,
            features: parsedFeatures
        });

        const savedSalon = await newSalon.save();
        console.log('✅ Salon Saved:', savedSalon._id);

        res.status(201).json({
            success: true,
            data: savedSalon
        });
    } catch (error) {
        console.error('POST /api/salons Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});


/**
 * GET /api/salons
 * Fetches all salons sorted by newest first
 */
app.get('/api/salons', async (req, res) => {
    try {
        const salons = await Salon.find().sort({ createdAt: -1 });
        res.status(200).json(salons);
    } catch (error) {
        console.error('GET /api/salons Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

// 4. Serve Frontend (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. Start Server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`👉 Press Ctrl+C to stop`);
});

// Handle Port Errors gracefully
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
        console.error(`💡 Solution: Run "taskkill /F /IM node.exe" to clear background processes.`);
    } else {
        console.error('❌ Server Error:', err.message);
    }
});
