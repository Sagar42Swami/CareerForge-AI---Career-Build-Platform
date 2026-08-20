const Resume = require('../models/Resume');
const JobRole = require('../models/JobRole');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const { recommendCareerPaths, generateSkillGapReport } = require('./llm.service');
const { query } = require('../config/vectorDb');
const { embedText } = require('./embedding.service');

const RESOURCE_MAP = {
  JavaScript: { title: 'JavaScript.info', type: 'course', url: 'https://javascript.info' },
  Python: { title: 'Python Official Tutorial', type: 'course', url: 'https://docs.python.org/3/tutorial/' },
  React: { title: 'React Official Docs', type: 'course', url: 'https://react.dev/learn' },
  'Node.js': { title: 'Node.js Getting Started', type: 'course', url: 'https://nodejs.org/en/learn' },
  SQL: { title: 'SQLBolt', type: 'course', url: 'https://sqlbolt.com' },
  AWS: { title: 'AWS Cloud Practitioner', type: 'certification', url: 'https://aws.amazon.com/certification/' },
  Docker: { title: 'Docker Getting Started', type: 'course', url: 'https://docs.docker.com/get-started/' },
  Kubernetes: { title: 'Kubernetes Basics', type: 'course', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
  'Machine Learning': { title: 'Fast.ai Course', type: 'course', url: 'https://course.fast.ai' },
  TypeScript: { title: 'TypeScript Handbook', type: 'course', url: 'https://www.typescriptlang.org/docs/handbook/' },
  default: { title: 'freeCodeCamp', type: 'course', url: 'https://www.freecodecamp.org' },
};

function getResourceForSkill(skill) {
  const match = Object.entries(RESOURCE_MAP).find(([key]) =>
    skill.toLowerCase().includes(key.toLowerCase())
  );
  const resource = match ? match[1] : RESOURCE_MAP.default;
  return { skill, ...resource };
}

async function getVectorMatchedRoles(skills) {
  try {
    const profileText = `Skills: ${skills.join(', ')}`;
    const embedding = await embedText(profileText);
    const results = await query(embedding, 5);

    if (!results.metadatas?.[0]) return [];

    return results.metadatas[0].map((meta, i) => ({
      title: meta.title,
      matchScore: Math.round((1 - (results.distances?.[0]?.[i] || 0.5)) * 100),
      reasoning: `Semantic match based on skill profile`,
      avgSalary: meta.salary || 0,
    }));
  } catch {
    return [];
  }
}

async function generateRecommendations(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const resume = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });
  const skills = resume?.extractedSkills?.length
    ? resume.extractedSkills
    : user.skills;

  const userProfile = {
    name: user.name,
    skills,
    targetRoles: user.targetRoles,
    experienceYears: resume?.experienceYears || 0,
    seniority: resume?.seniority || 'junior',
  };

  const [llmResult, vectorRoles, allJobs] = await Promise.all([
    recommendCareerPaths(userProfile).catch(() => ({ roles: [] })),
    getVectorMatchedRoles(skills),
    JobRole.find().limit(10).lean(),
  ]);

  const llmRoles = llmResult.roles || [];
  const roleMap = new Map();

  [...llmRoles, ...vectorRoles].forEach((role) => {
    const existing = roleMap.get(role.title);
    if (!existing || role.matchScore > existing.matchScore) {
      roleMap.set(role.title, role);
    }
  });

  allJobs.forEach((job) => {
    const skillOverlap = job.requiredSkills.filter((s) =>
      skills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
    ).length;
    const matchScore = Math.min(Math.round((skillOverlap / Math.max(job.requiredSkills.length, 1)) * 100), 95);

    if (matchScore > 30) {
      const existing = roleMap.get(job.title);
      if (!existing || matchScore > existing.matchScore) {
        roleMap.set(job.title, {
          title: job.title,
          matchScore,
          reasoning: `${skillOverlap} matching skills with market demand score ${job.demandScore}`,
          avgSalary: job.avgSalary,
        });
      }
    }
  });

  const recommendedRoles = Array.from(roleMap.values())
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);

  const topRole = recommendedRoles[0]?.title || user.targetRoles[0] || 'Software Engineer';
  const gapResult = await generateSkillGapReport(skills, topRole).catch(() => ({ gaps: [] }));
  const skillGaps = (gapResult.gaps || []).map((g) => ({
    skill: g.skill,
    priority: g.priority || 'medium',
    targetRole: topRole,
  }));

  const resources = skillGaps.slice(0, 6).map((g) => getResourceForSkill(g.skill));

  const recommendation = await Recommendation.findOneAndUpdate(
    { userId },
    {
      recommendedRoles,
      skillGaps,
      resources,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return recommendation;
}

module.exports = { generateRecommendations, getResourceForSkill };
