const mongoose = require('mongoose');

const recommendedRoleSchema = new mongoose.Schema(
  {
    title: String,
    matchScore: Number,
    reasoning: String,
    avgSalary: Number,
  },
  { _id: false }
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: String,
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    targetRole: String,
  },
  { _id: false }
);

const resourceSchema = new mongoose.Schema(
  {
    skill: String,
    title: String,
    type: { type: String, enum: ['course', 'article', 'project', 'certification'], default: 'course' },
    url: String,
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    recommendedRoles: [recommendedRoleSchema],
    skillGaps: [skillGapSchema],
    resources: [resourceSchema],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
