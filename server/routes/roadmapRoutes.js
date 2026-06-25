const express = require('express');
const { createRoadmap, getMyRoadmaps, getSharedRoadmap, getPublicRoadmaps, getRoadmapById, savePublicRoadmap, toggleBookmark, getBookmarked } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', protect, createRoadmap);
router.get('/my', protect, getMyRoadmaps);
router.get('/share/:id', getSharedRoadmap);

router.get('/public', getPublicRoadmaps);
router.get('/view/:id', getRoadmapById);
router.post('/save/:id', protect, savePublicRoadmap);
router.post('/bookmark/:id', protect, toggleBookmark);
router.get('/bookmarked', protect, getBookmarked);

module.exports = router;
