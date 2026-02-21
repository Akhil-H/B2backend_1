const Salon = require('../models/Salon');

/**
 * @desc Get all salons
 * @route GET /api/salons
 */
exports.getSalons = async (req, res) => {
    try {
        const { search, city } = req.query;
        let filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        if (city) {
            filter.city = { $regex: city, $options: 'i' };
        }

        const salons = await Salon.find(filter).sort({ createdAt: -1 });
        res.status(200).json(salons);
    } catch (error) {
        console.error('GET /api/salons Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc Create new salon
 * @route POST /api/salons
 */
exports.createSalon = async (req, res) => {
    try {
        const { name, city, rating, latitude, longitude, features } = req.body;

        // Handle multiple images from S3
        const images = req.files ? req.files.map(file => file.location) : [];

        // Parse features if it's a string
        let parsedFeatures = features;
        if (typeof features === 'string') {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (e) {
                console.error("Error parsing features JSON:", e);
                parsedFeatures = {}; // Default to empty object if parse fails
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
        res.status(201).json({
            success: true,
            data: savedSalon
        });
    } catch (error) {
        console.error('POST /api/salons Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
