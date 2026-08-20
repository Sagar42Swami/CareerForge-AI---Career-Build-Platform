const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const interviewRoutes = require('./routes/interview.routes');
const chatRoutes = require('./routes/chat.routes');
const jobsRoutes = require('./routes/jobs.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pathwise-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/jobs', jobsRoutes);

app.use(errorHandler);

module.exports = app;
