const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const upload = require('../middleware/upload');

router.route('/')
    .get(salonController.getSalons)
    .post(upload.array('images', 5), salonController.createSalon);

module.exports = router;
