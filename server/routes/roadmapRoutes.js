const express = require('express');
const { createRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', protect, createRoadmap);

module.exports = router;
