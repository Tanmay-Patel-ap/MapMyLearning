const express = require('express');
const { createRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// You can make this protected if you want only logged in users to generate roadmaps
router.post('/generate', createRoadmap);

module.exports = router;
