const { generateRoadmap } = require('../services/geminiService');
const Roadmap = require('../models/Roadmap');
const PublicRoadmap = require('../models/PublicRoadmap');
const User = require('../models/User');

const goalLabels = {
  'web-development': 'Web Development',
  'data-science-ai': 'Data Science & AI',
  'automation-scripting': 'Automation & Scripting',
  'software-engineering': 'Software Engineering',
  'game-development': 'Game Development'
};

exports.createRoadmap = async (req, res, next) => {
  try {
    const { topic, goal, visibility, category } = req.body;
    console.log('[Roadmap] Generate request:', { topic, goal, visibility, category });

    if (!topic || !goal) {
      console.warn('[Roadmap] Missing required fields');
      return res.status(400).json({ success: false, error: 'Topic and goal are required' });
    }

    const goalName = goalLabels[goal] || goal;
    const roadmap = await generateRoadmap(topic, goalName);

    const saved = await Roadmap.create({
      user: req.user.id,
      topic,
      goal,
      visibility: visibility || 'private',
      category: category || '',
      title: roadmap.title,
      steps: roadmap.steps
    });

    console.log('[Roadmap] Saved to DB:', saved._id);

    res.status(201).json({
      success: true,
      data: { ...roadmap, _id: saved._id, visibility: saved.visibility }
    });
  } catch (err) {
    console.error('[Roadmap Error] Generate failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user.id })
      .select('topic goal visibility category title createdAt')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: roadmaps });
  } catch (err) {
    console.error('[Roadmap Error] Fetch failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPublicRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await PublicRoadmap.find().sort('-createdAt');
    const grouped = {
      role: roadmaps.filter(r => r.category === 'role'),
      skill: roadmaps.filter(r => r.category === 'skill')
    };
    res.status(200).json({ success: true, data: grouped });
  } catch (err) {
    console.error('[Roadmap Error] Fetch public failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRoadmapById = async (req, res, next) => {
  try {
    let roadmap = await PublicRoadmap.findById(req.params.id);
    if (!roadmap) {
      roadmap = await Roadmap.findById(req.params.id).populate('user', 'name');
    }
    if (!roadmap) {
      return res.status(404).json({ success: false, error: 'Roadmap not found' });
    }
    const type = roadmap.constructor.modelName === 'PublicRoadmap' ? 'public' : 'personal';
    res.status(200).json({ success: true, data: { ...roadmap.toObject(), _type: type } });
  } catch (err) {
    console.error('[Roadmap Error] View fetch failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.savePublicRoadmap = async (req, res, next) => {
  try {
    const publicRoadmap = await PublicRoadmap.findById(req.params.id);
    if (!publicRoadmap) {
      return res.status(404).json({ success: false, error: 'Public roadmap not found' });
    }

    const existing = await Roadmap.findOne({
      user: req.user.id,
      title: publicRoadmap.title,
      topic: publicRoadmap.topic
    });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Roadmap already saved' });
    }

    const saved = await Roadmap.create({
      user: req.user.id,
      topic: publicRoadmap.topic,
      goal: 'software-engineering',
      visibility: 'private',
      title: publicRoadmap.title,
      steps: publicRoadmap.steps
    });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('[Roadmap Error] Save public failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const publicRoadmap = await PublicRoadmap.findById(req.params.id);
    if (!publicRoadmap) {
      return res.status(404).json({ success: false, error: 'Public roadmap not found' });
    }

    const user = await User.findById(req.user.id);
    const idx = user.bookmarks.indexOf(publicRoadmap._id);
    if (idx > -1) {
      user.bookmarks.splice(idx, 1);
      await user.save();
      return res.status(200).json({ success: true, bookmarked: false });
    } else {
      user.bookmarks.push(publicRoadmap._id);
      await user.save();
      return res.status(200).json({ success: true, bookmarked: true });
    }
  } catch (err) {
    console.error('[Roadmap Error] Toggle bookmark failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBookmarked = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarks');
    res.status(200).json({ success: true, data: user.bookmarks || [] });
  } catch (err) {
    console.error('[Roadmap Error] Fetch bookmarked failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSharedRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .populate('user', 'name');

    if (!roadmap) {
      return res.status(404).json({ success: false, error: 'Roadmap not found' });
    }

    if (roadmap.visibility === 'private' && (!req.user || roadmap.user._id.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, error: 'This roadmap is private' });
    }

    res.status(200).json({ success: true, data: roadmap });
  } catch (err) {
    console.error('[Roadmap Error] Share fetch failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
