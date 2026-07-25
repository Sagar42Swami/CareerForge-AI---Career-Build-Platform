require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

let server;
let token;

beforeAll(async () => {
  await connectDB();
  server = app.listen(0);

  const res = await request(app).post('/api/auth/register').send({
    name: 'Route Test User',
    email: `route-test-${Date.now()}@example.com`,
    password: 'password123',
    skills: ['JavaScript', 'React', 'Node.js'],
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
  if (server) server.close();
});

describe('Resume & Cover Letter API', () => {
  it('POST /api/resume/cover-letter - should reject if no job description provided', async () => {
    const res = await request(app)
      .post('/api/resume/cover-letter')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Job description is required/i);
  });

  it('POST /api/resume/cover-letter - should reject if no resume uploaded yet', async () => {
    const res = await request(app)
      .post('/api/resume/cover-letter')
      .set('Authorization', `Bearer ${token}`)
      .send({ jobDescription: 'Seeking Senior Full Stack Developer...' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/upload a resume first/i);
  });
});

describe('Jobs Matching API', () => {
  it('GET /api/jobs/match - should return matches for user skills', async () => {
    const res = await request(app)
      .get('/api/jobs/match')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.matches)).toBe(true);
    expect(Array.isArray(res.body.skills)).toBe(true);
  });
});
