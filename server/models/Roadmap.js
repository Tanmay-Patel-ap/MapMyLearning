const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required']
  },
  goal: {
    type: String,
    enum: ['web-development', 'data-science-ai', 'automation-scripting', 'software-engineering', 'game-development'],
    required: [true, 'Goal is required']
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  category: {
    type: String,
    enum: ['role', 'skill', ''],
    default: ''
  },
  title: String,
  steps: [{
    title: String,
    description: String,
    resources: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
