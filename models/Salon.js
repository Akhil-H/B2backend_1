const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    id: String,
    name: String,
    time: String,
    rate: Number
}, { _id: false });

const salonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        default: 0
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    images: [{
        type: String
    }],
    features: {
        haircut: [serviceSchema],
        spa: [serviceSchema],
        makeup: [serviceSchema],
        facial: [serviceSchema]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Salon', salonSchema);

