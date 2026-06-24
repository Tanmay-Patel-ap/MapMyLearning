const { generateRoadmap } = require('../services/geminiService');

// @desc    Generate a roadmap
// @route   POST /api/roadmap/generate
// @access  Public (or Private if you want to restrict it)
exports.createRoadmap = async (req, res, next) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const roadmap = await generateRoadmap(topic);
    
    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
