const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rawText: { type: String, required: true },
    extractedSkills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0 },
    seniority: { type: String, enum: ['junior', 'mid', 'senior', 'lead'], default: 'junior' },
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
