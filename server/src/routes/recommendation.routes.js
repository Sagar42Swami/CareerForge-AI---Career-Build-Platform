const express = require('express');
const Recommendation = require('../models/Recommendation');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateRecommendations } = require('../services/recommendation.service');

const router = express.Router();

router.get('/:userId', verifyToken, async (req, res, next) => {
  try {
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let recommendation = await Recommendation.findOne({ userId: req.user._id });

    if (!recommendation) {
      recommendation = await generateRecommendations(req.user._id);
    }

    res.json({ recommendation });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', verifyToken, async (req, res, next) => {
  try {
    const recommendation = await generateRecommendations(req.user._id);
    res.json({ recommendation });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
