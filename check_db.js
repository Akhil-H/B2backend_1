const mongoose = require('mongoose');
const Salon = require('./models/Salon');
require('dotenv').config();

async function checkData() {
    await mongoose.connect(process.env.MONGODB_URI);
    const salons = await Salon.find().sort({ createdAt: -1 });
    console.log(JSON.stringify(salons, null, 2));
    await mongoose.disconnect();
}

checkData();
