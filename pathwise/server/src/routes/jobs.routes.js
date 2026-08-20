const express = require('express');
const JobRole = require('../models/JobRole');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { verifyToken } = require('../middleware/auth.middleware');
const { embedText } = require('../services/embedding.service');
const { query } = require('../config/vectorDb');

const router = express.Router();

router.get('/market-insights', verifyToken, async (req, res, next) => {
  try {
    const jobs = await JobRole.find().lean();

    const skillCounts = {};
    jobs.forEach((job) => {
      job.requiredSkills.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const trendingSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count, demand: Math.round((count / jobs.length) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const salaryBands = jobs
      .map((j) => ({ title: j.title, salary: j.avgSalary, demandScore: j.demandScore }))
      .sort((a, b) => b.salary - a.salary);

    const avgSalary = jobs.length
      ? Math.round(jobs.reduce((sum, j) => sum + j.avgSalary, 0) / jobs.length)
      : 0;

    const categories = {};
    jobs.forEach((j) => {
      categories[j.category] = (categories[j.category] || 0) + 1;
    });

    res.json({
      totalRoles: jobs.length,
      avgSalary,
      trendingSkills,
      salaryBands: salaryBands.slice(0, 10),
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/match', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const resume = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });

    const skills = resume?.extractedSkills?.length
      ? resume.extractedSkills
      : user?.skills || [];

    if (!skills.length) {
      return res.status(400).json({ error: 'No skills found. Upload a resume first.' });
    }

    try {
      const embedding = await embedText(`Skills: ${skills.join(', ')}`);
      const results = await query(embedding, 8);

      const metadatas = results.metadatas?.[0] || [];
      if (metadatas.length) {
        const matches = metadatas.map((meta, i) => ({
          title: meta.title,
          skills: meta.skills?.split(', ') || [],
          salary: meta.salary,
          matchScore: Math.max(
            0,
            Math.min(100, Math.round((1 - (results.distances?.[0]?.[i] || 0.5)) * 100))
          ),
          description: results.documents?.[0]?.[i] || '',
        }));

        return res.json({ matches, skills, semantic: true });
      }

      // Chroma can be unavailable or unseeded. Fall back to the MongoDB
      // catalog so the matching feature still works in a fresh local setup.
    } catch {
      const jobs = await JobRole.find().lean();
      const matches = jobs
        .map((job) => {
          const overlap = job.requiredSkills.filter((s) =>
            skills.some((us) => us.toLowerCase() === s.toLowerCase())
          ).length;
          return {
            title: job.title,
            skills: job.requiredSkills,
            salary: job.avgSalary,
            matchScore: Math.round((overlap / Math.max(job.requiredSkills.length, 1)) * 100),
            description: job.description,
          };
        })
        .filter((m) => m.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 8);

      return res.json({ matches, skills, fallback: true });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/roles', verifyToken, async (req, res, next) => {
  try {
    const roles = await JobRole.find().select('-__v').lean();
    res.json({ roles });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
