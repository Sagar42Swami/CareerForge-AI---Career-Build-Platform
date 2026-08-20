const OpenAI = require('openai');
const { safeParseLLMResponse } = require('../utils/jsonParser');

let openai = null;

function hasOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  return key && key.trim() !== '' && !key.includes('your-openai-api-key');
}

function getOpenAI() {
  if (!openai && hasOpenAI()) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function callLLM(systemPrompt, userPrompt, jsonMode = false) {
  if (!hasOpenAI()) return null;

  try {
    const client = getOpenAI();
    const params = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    };

    if (jsonMode) {
      params.response_format = { type: 'json_object' };
    }

    const response = await client.chat.completions.create(params);
    return response.choices[0].message.content;
  } catch (err) {
    console.warn('OpenAI API call failed, switching to local heuristic fallback:', err.message);
    return null;
  }
}

async function extractSkillsFromResume(resumeText) {
  if (hasOpenAI()) {
    try {
      const systemPrompt =
        'You are a resume analyzer. Extract structured career data from resumes. Respond only with valid JSON, no markdown, no preamble.';
      const userPrompt = `Analyze this resume and return JSON with keys: skills (array of strings), experienceYears (number), seniority (one of: junior, mid, senior, lead).

Resume:
${resumeText.slice(0, 8000)}`;

      const raw = await callLLM(systemPrompt, userPrompt, true);
      if (raw) {
        const parsed = safeParseLLMResponse(raw);
        if (parsed?.skills) return parsed;
      }
    } catch {
      // Fallback below
    }
  }

  // Heuristic Offline Extractor
  const textLower = resumeText.toLowerCase();
  const KNOWN_SKILLS = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Express', 'SQL', 'MongoDB',
    'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'Git', 'HTML', 'CSS',
    'Tailwind', 'Redux', 'REST APIs', 'GraphQL', 'Machine Learning', 'TensorFlow',
    'PyTorch', 'Pandas', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
    'React Native', 'Figma', 'Agile', 'Scrum', 'Linux', 'CI/CD', 'Jira', 'Unit Testing'
  ];

  const detectedSkills = KNOWN_SKILLS.filter((skill) =>
    textLower.includes(skill.toLowerCase())
  );

  let experienceYears = 1;
  const expMatch = textLower.match(/(\d+)\+?\s*(years|yrs)\s*(of)?\s*experience/);
  if (expMatch) {
    experienceYears = parseInt(expMatch[1], 10);
  }

  let seniority = 'junior';
  if (textLower.includes('lead') || textLower.includes('principal') || textLower.includes('architect')) {
    seniority = 'lead';
  } else if (textLower.includes('senior') || experienceYears >= 5) {
    seniority = 'senior';
  } else if (experienceYears >= 2) {
    seniority = 'mid';
  }

  return {
    skills: detectedSkills.length > 0 ? detectedSkills : ['JavaScript', 'HTML', 'CSS', 'Git'],
    experienceYears,
    seniority,
  };
}

async function recommendCareerPaths(userProfile) {
  if (hasOpenAI()) {
    try {
      const systemPrompt =
        'You are a career advisor. Recommend career paths based on user profiles. Respond only with valid JSON, no markdown, no preamble.';
      const userPrompt = `Given this user profile, return JSON with key "roles": array of objects with title, matchScore (0-100), reasoning, avgSalary (number).

Profile:
${JSON.stringify(userProfile)}`;

      const raw = await callLLM(systemPrompt, userPrompt, true);
      if (raw) {
        const parsed = safeParseLLMResponse(raw);
        if (parsed?.roles?.length) return parsed;
      }
    } catch {
      // Fallback below
    }
  }

  // Heuristic Offline Recommendations
  const userSkills = (userProfile.skills || []).map((s) => s.toLowerCase());

  const PREDEFINED_ROLES = [
    { title: 'Frontend Developer', skills: ['javascript', 'react', 'html', 'css', 'typescript'], salary: 95000 },
    { title: 'Backend Developer', skills: ['node.js', 'python', 'sql', 'express', 'docker', 'aws'], salary: 105000 },
    { title: 'Full Stack Developer', skills: ['javascript', 'react', 'node.js', 'mongodb', 'sql'], salary: 110000 },
    { title: 'Data Scientist', skills: ['python', 'machine learning', 'sql', 'pandas', 'tensorflow'], salary: 120000 },
    { title: 'DevOps Engineer', skills: ['docker', 'kubernetes', 'aws', 'linux', 'ci/cd'], salary: 115000 },
  ];

  const roles = PREDEFINED_ROLES.map((role) => {
    const matches = role.skills.filter((s) => userSkills.includes(s)).length;
    const matchScore = Math.min(Math.round((matches / role.skills.length) * 100) + 40, 95);
    return {
      title: role.title,
      matchScore,
      reasoning: `Matched ${matches} core skills for ${role.title} based on your skill profile.`,
      avgSalary: role.salary,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return { roles };
}

async function generateSkillGapReport(userSkills = [], targetRole = 'Software Engineer') {
  if (hasOpenAI()) {
    try {
      const systemPrompt =
        'You are a skills analyst. Identify skill gaps for career transitions. Respond only with valid JSON, no markdown, no preamble.';
      const userPrompt = `Return JSON with key "gaps": array of objects with skill, priority (high/medium/low), description.

User skills: ${JSON.stringify(userSkills)}
Target role: ${targetRole}`;

      const raw = await callLLM(systemPrompt, userPrompt, true);
      if (raw) {
        const parsed = safeParseLLMResponse(raw);
        if (parsed?.gaps?.length) return parsed;
      }
    } catch {
      // Fallback below
    }
  }

  // Heuristic Offline Skill Gap Report
  const userSkillLower = userSkills.map((s) => s.toLowerCase());
  const COMMON_REQUIREMENTS = {
    'Frontend Developer': ['TypeScript', 'Testing (Jest/RTL)', 'State Management', 'Web Performance'],
    'Backend Developer': ['Docker', 'AWS/Cloud Deployment', 'Microservices', 'GraphQL'],
    'Full Stack Developer': ['Docker', 'System Design', 'CI/CD Pipelines', 'Security Best Practices'],
    'Data Scientist': ['PyTorch', 'Data Warehousing', 'Feature Engineering', 'Model Deployment'],
    default: ['Docker', 'Cloud Infrastructure (AWS/GCP)', 'System Design', 'CI/CD Pipelines'],
  };

  const required = COMMON_REQUIREMENTS[targetRole] || COMMON_REQUIREMENTS.default;
  const gaps = required.map((skill, index) => ({
    skill,
    priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
    description: `Essential for mastering ${targetRole} positions.`,
  }));

  return { gaps };
}

async function generateCoverLetter(resumeText, jobDescription) {
  if (hasOpenAI()) {
    try {
      const systemPrompt = 'You are a professional cover letter writer.';
      const userPrompt = `Write a tailored cover letter (300-400 words) for this job.

Resume summary:
${resumeText.slice(0, 3000)}

Job description:
${jobDescription.slice(0, 3000)}`;

      const result = await callLLM(systemPrompt, userPrompt, false);
      if (result) return result;
    } catch {
      // Fallback below
    }
  }

  // Heuristic Offline Cover Letter Generator
  const jobSnippet = jobDescription.slice(0, 100).replace(/\n/g, ' ');
  return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the open role described in your job posting ("${jobSnippet}..."). With a strong background in software engineering, technical problem-solving, and continuous learning, I am confident in my ability to contribute value to your team.

My technical experience includes hands-on work with modern frameworks, API integrations, data structures, and standard software architecture practices. Throughout my career, I have focused on building scalable, user-focused applications while collaborating effectively in agile, team-oriented environments.

I would welcome the opportunity to discuss how my skill set and background align with your organization's goals. Thank you for your time and consideration.

Sincerely,
Candidate`;
}

async function generateInterviewQuestion(role, history = []) {
  if (hasOpenAI()) {
    try {
      const systemPrompt =
        'You are an interview coach. Generate interview questions. Respond only with valid JSON, no markdown, no preamble.';
      const historyText = history.map((h) => `${h.role}: ${h.content}`).join('\n');
      const userPrompt = `Generate the next interview question for a "${role}" role.
Previous Q&A:
${historyText || 'None yet.'}

Return JSON: { "question": "...", "category": "technical|behavioral|situational" }`;

      const raw = await callLLM(systemPrompt, userPrompt, true);
      if (raw) {
        const parsed = safeParseLLMResponse(raw);
        if (parsed?.question) return parsed;
      }
    } catch {
      // Fallback below
    }
  }

  // Heuristic Offline Questions
  const QUESTIONS = [
    { question: `Can you describe a challenging project you built as a ${role} and how you handled technical hurdles?`, category: 'technical' },
    { question: 'How do you prioritize competing deadlines and stay focused under pressure?', category: 'behavioral' },
    { question: `What tools and best practices do you rely on when designing scalable solutions for a ${role} position?`, category: 'technical' },
    { question: 'Describe a situation where you had a disagreement with a team member. How did you resolve it?', category: 'situational' },
    { question: 'Where do you see your technical career evolving over the next 2-3 years?', category: 'behavioral' },
  ];

  const qIndex = Math.min(Math.floor(history.length / 2), QUESTIONS.length - 1);
  return QUESTIONS[qIndex];
}

async function evaluateAnswer(question, answer, role) {
  if (hasOpenAI()) {
    try {
      const systemPrompt =
        'You are an interview evaluator. Score and provide feedback. Respond only with valid JSON, no markdown, no preamble.';
      const userPrompt = `Evaluate this interview answer for a "${role}" position.

Question: ${question}
Answer: ${answer}

Return JSON: { "score": 0-100, "feedback": "...", "strengths": [], "improvements": [] }`;

      const raw = await callLLM(systemPrompt, userPrompt, true);
      if (raw) {
        const parsed = safeParseLLMResponse(raw);
        if (parsed?.score != null) return parsed;
      }
    } catch {
      // Fallback below
    }
  }

  // Heuristic Offline Evaluator
  const length = answer.trim().length;
  let score = 70;
  if (length > 200) score = 88;
  else if (length > 100) score = 80;
  else if (length < 30) score = 55;

  return {
    score,
    feedback: length > 100
      ? 'Solid response! You communicated your points clearly and provided relevant context.'
      : 'Good attempt. Adding specific examples or metrics would make your answer significantly stronger.',
    strengths: ['Clear structure', 'Direct answer to question'],
    improvements: ['Include quantified outcomes or metrics', 'Elaborate on technical implementation details'],
  };
}

async function careerCounselorReply(userMessage, context, history = []) {
  if (hasOpenAI()) {
    try {
      const systemPrompt = `You are Pathwise, an expert career counselor. Use the provided job market context to give actionable advice. Be concise and encouraging.

Context from knowledge base:
${context}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ];

      const client = getOpenAI();
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    } catch {
      // Fallback below
    }
  }

  // Heuristic Offline Counselor Response
  const msgLower = userMessage.toLowerCase();
  if (msgLower.includes('resume') || msgLower.includes('ats')) {
    return 'To optimize your resume for ATS systems: 1) Use standard section headings like Experience, Skills, and Education. 2) Include relevant keywords directly from target job postings. 3) Quantify achievements with metrics (e.g. "improved speed by 25%"). 4) Keep formatting clean without complex tables or graphics.';
  }
  if (msgLower.includes('interview') || msgLower.includes('practice')) {
    return 'For interview success: Use the STAR method (Situation, Task, Action, Result) for behavioral questions. For technical questions, explain your thought process out loud before jumping into solutions!';
  }
  if (msgLower.includes('transition') || msgLower.includes('switch') || msgLower.includes('role')) {
    return 'Career transitions work best when you leverage your transferable skills. Identify overlapping skills between your current background and target role, then build 1-2 practical portfolio projects demonstrating your new skills.';
  }

  return `Thanks for asking! Based on our career data, staying focused on core fundamentals (like JavaScript, Python, SQL, and Cloud practices) while building hands-on portfolio projects is the fastest path to advancing your career. Let me know if you want tips on resume building or mock interview prep!`;
}

module.exports = {
  callLLM,
  extractSkillsFromResume,
  recommendCareerPaths,
  generateSkillGapReport,
  generateCoverLetter,
  generateInterviewQuestion,
  evaluateAnswer,
  careerCounselorReply,
};
