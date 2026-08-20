const express = require('express');
const ChatSession = require('../models/ChatSession');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateInterviewQuestion, evaluateAnswer } = require('../services/llm.service');

const router = express.Router();

router.post('/start', verifyToken, async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role?.trim()) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const session = await ChatSession.create({
      userId: req.user._id,
      type: 'mock_interview',
      metadata: { targetRole: role.trim(), questionIndex: 0 },
      messages: [],
    });

    const questionData = await generateInterviewQuestion(role.trim(), []);

    session.messages.push({
      role: 'assistant',
      content: questionData.question,
    });
    session.metadata.questionIndex = 1;
    await session.save();

    res.status(201).json({
      sessionId: session._id,
      question: questionData.question,
      category: questionData.category,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/answer', verifyToken, async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer?.trim()) {
      return res.status(400).json({ error: 'Session ID and answer are required' });
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user._id,
      type: 'mock_interview',
    });

    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    const lastQuestion = [...session.messages].reverse().find((m) => m.role === 'assistant');
    if (!lastQuestion) {
      return res.status(400).json({ error: 'No question found in session' });
    }

    session.messages.push({ role: 'user', content: answer.trim() });

    const evaluation = await evaluateAnswer(
      lastQuestion.content,
      answer.trim(),
      session.metadata.targetRole
    );

    const feedbackMessage = `Score: ${evaluation.score}/100\n\n${evaluation.feedback}\n\nStrengths: ${(evaluation.strengths || []).join(', ')}\nAreas to improve: ${(evaluation.improvements || []).join(', ')}`;

    session.messages.push({ role: 'assistant', content: feedbackMessage });

    let nextQuestion = null;
    if (session.metadata.questionIndex < 5) {
      const questionData = await generateInterviewQuestion(
        session.metadata.targetRole,
        session.messages
      );
      nextQuestion = questionData.question;
      session.messages.push({ role: 'assistant', content: nextQuestion });
      session.metadata.questionIndex += 1;
    }

    await session.save();

    res.json({
      evaluation,
      nextQuestion,
      completed: !nextQuestion,
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
      type: 'mock_interview',
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
