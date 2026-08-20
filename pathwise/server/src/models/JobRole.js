const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    requiredSkills: [{ type: String, trim: true }],
    avgSalary: { type: Number, default: 0 },
    demandScore: { type: Number, min: 0, max: 100, default: 50 },
    category: { type: String, trim: true, default: 'Technology' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobRole', jobRoleSchema);
