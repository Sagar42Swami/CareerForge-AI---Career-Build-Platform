const express = require('express');
const multer = require('multer');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth.middleware');
const { extractText, calculateATSScore } = require('../services/resumeParser.service');
const { extractSkillsFromResume, generateCoverLetter } = require('../services/llm.service');
const { generateRecommendations } = require('../services/recommendation.service');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/upload', verifyToken, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const rawText = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract meaningful text from the file' });
    }

    let extracted = { skills: [], experienceYears: 0, seniority: 'junior' };

    try {
      extracted = await extractSkillsFromResume(rawText);
    } catch (llmErr) {
      console.warn('LLM skill extraction failed, using heuristic fallback:', llmErr.message);
      const words = rawText.toLowerCase();
      const commonSkills = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS',
        'Docker', 'TypeScript', 'Git', 'HTML', 'CSS', 'MongoDB', 'PostgreSQL',
      ];
      extracted.skills = commonSkills.filter((s) => words.includes(s.toLowerCase()));
    }

    const user = await User.findById(req.user._id);
    const targetRole = user.targetRoles[0] || '';
    const atsScore = calculateATSScore(rawText, targetRole, extracted.skills);

    const resume = await Resume.create({
      userId: req.user._id,
      rawText,
      extractedSkills: extracted.skills || [],
      experienceYears: extracted.experienceYears || 0,
      seniority: extracted.seniority || 'junior',
      atsScore,
    });

    if (extracted.skills?.length) {
      await User.findByIdAndUpdate(req.user._id, { skills: extracted.skills });
    }

    // Auto-generate fresh recommendations in background
    generateRecommendations(req.user._id).catch((err) =>
      console.warn('Background recommendation generation error:', err.message)
    );

    res.status(201).json({
      resume: {
        id: resume._id,
        extractedSkills: resume.extractedSkills,
        experienceYears: resume.experienceYears,
        seniority: resume.seniority,
        atsScore: resume.atsScore,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/latest', verifyToken, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(404).json({ error: 'No resume found' });
    }
    res.json({ resume });
  } catch (err) {
    next(err);
  }
});

router.get('/history', verifyToken, async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .select('-rawText');
    res.json({ resumes });
  } catch (err) {
    next(err);
  }
});

router.post('/cover-letter', verifyToken, async (req, res, next) => {
  try {
    const { jobDescription, resumeId } = req.body;
    if (!jobDescription?.trim()) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    let resume;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else {
      resume = await Resume.findOne({ userId: req.user._id }).sort({ uploadedAt: -1 });
    }

    if (!resume || !resume.rawText) {
      return res.status(400).json({ error: 'Please upload a resume first.' });
    }

    const coverLetter = await generateCoverLetter(resume.rawText, jobDescription.trim());
    res.json({ coverLetter });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
