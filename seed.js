const mongoose = require('mongoose');
const Salon = require('./models/Salon');
require('dotenv').config();

const salonData = {
    name: "Style Studio Salon",
    city: "Delhi",
    rating: 4.8,
    latitude: 28.6139,
    longitude: 77.2090,
    images: [
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80"
    ],
    features: {
        haircut: [
            { id: 'h1', name: 'Classic Fade', time: '30 min', rate: 500 },
            { id: 'h2', name: 'Buzz Cut', time: '20 min', rate: 350 },
            { id: 'h3', name: 'Long Hair Styling', time: '45 min', rate: 800 }
        ],
        spa: [
            { id: 's1', name: 'Head Massage', time: '20 min', rate: 400 },
            { id: 's2', name: 'Full Body Spa', time: '60 min', rate: 2500 }
        ],
        makeup: [
            { id: 'm1', name: 'Party Makeup', time: '40 min', rate: 1500 },
            { id: 'm2', name: 'Bridal Touchup', time: '30 min', rate: 1200 }
        ],
        facial: [
            { id: 'f1', name: 'Gold Facial', time: '50 min', rate: 1800 },
            { id: 'f2', name: 'Detan Glow', time: '30 min', rate: 900 }
        ]
    }
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        await Salon.deleteMany({}); // Clear existing salons for clean demo
        const newSalon = new Salon(salonData);
        await newSalon.save();

        console.log("Data Seeded Successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedDB();
