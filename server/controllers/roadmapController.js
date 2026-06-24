const { generateRoadmap } = require('../services/geminiService');

// @desc    Generate a roadmap
// @route   POST /api/roadmap/generate
// @access  Public (or Private if you want to restrict it)
exports.createRoadmap = async (req, res, next) => {
  try {
    const { topic } = req.body;
    console.log('[Roadmap] Generate request for topic:', topic);

    if (!topic) {
      console.warn('[Roadmap] Missing topic in request');
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const roadmap = await generateRoadmap(topic);
    console.log('[Roadmap] Successfully generated roadmap:', roadmap.title);
    
    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (err) {
    console.error('[Roadmap Error] Generate failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
