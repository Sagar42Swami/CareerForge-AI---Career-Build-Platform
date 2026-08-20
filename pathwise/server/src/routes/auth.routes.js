const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, targetRoles = [], skills = [] } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash, targetRoles, skills });

      const secret = process.env.JWT_SECRET || 'pathwise_dev_secret_key_2026';
      const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRoles: user.targetRoles,
          skills: user.skills,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const secret = process.env.JWT_SECRET || 'pathwise_dev_secret_key_2026';
      const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRoles: user.targetRoles,
          skills: user.skills,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', verifyToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      targetRoles: req.user.targetRoles,
      skills: req.user.skills,
    },
  });
});

router.put('/profile', verifyToken, async (req, res, next) => {
  try {
    const { name, targetRoles, skills } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (targetRoles) updates.targetRoles = targetRoles;
    if (skills) updates.skills = skills;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRoles: user.targetRoles,
        skills: user.skills,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
