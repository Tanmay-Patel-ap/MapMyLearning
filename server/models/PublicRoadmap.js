const mongoose = require('mongoose');

const publicRoadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required']
  },
  category: {
    type: String,
    enum: ['role', 'skill'],
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    default: ''
  },
  steps: [{
    title: String,
    description: String,
    resources: [String]
  }],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PublicRoadmap', publicRoadmapSchema);
