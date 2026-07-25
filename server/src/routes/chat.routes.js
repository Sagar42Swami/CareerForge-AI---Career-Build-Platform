const express = require('express');
const ChatSession = require('../models/ChatSession');
const { verifyToken } = require('../middleware/auth.middleware');
const { answerWithRAG } = require('../services/rag.service');

const router = express.Router();

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id });
    }

    if (!session) {
      session = await ChatSession.create({
        userId: req.user._id,
        type: 'career_counselor',
        messages: [],
      });
    }

    session.messages.push({ role: 'user', content: message.trim() });

    const { reply } = await answerWithRAG(message, session.messages);

    session.messages.push({ role: 'assistant', content: reply });
    await session.save();

    res.json({
      sessionId: session._id,
      reply,
      messages: session.messages,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/sessions', verifyToken, async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({
      userId: req.user._id,
      type: 'career_counselor',
    })
      .sort({ updatedAt: -1 })
      .select('messages type createdAt updatedAt')
      .limit(10);

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
