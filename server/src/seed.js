require('dotenv').config();
const { connectDB } = require('./config/db');
const JobRole = require('./models/JobRole');
const { upsert } = require('./config/vectorDb');
const { embedText } = require('./services/embedding.service');

const SAMPLE_JOBS = [
  {
    title: 'Frontend Developer',
    description: 'Build responsive web applications using React, TypeScript, and modern CSS frameworks.',
    requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Git'],
    avgSalary: 95000,
    demandScore: 88,
    category: 'Technology',
  },
  {
    title: 'Backend Developer',
    description: 'Design and implement scalable server-side APIs and microservices.',
    requiredSkills: ['Node.js', 'Python', 'SQL', 'REST APIs', 'Docker', 'AWS'],
    avgSalary: 105000,
    demandScore: 90,
    category: 'Technology',
  },
  {
    title: 'Full Stack Developer',
    description: 'End-to-end web development across frontend and backend stacks.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Git'],
    avgSalary: 110000,
    demandScore: 92,
    category: 'Technology',
  },
  {
    title: 'Data Scientist',
    description: 'Analyze complex datasets and build predictive models using ML techniques.',
    requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas', 'TensorFlow'],
    avgSalary: 120000,
    demandScore: 85,
    category: 'Data',
  },
  {
    title: 'DevOps Engineer',
    description: 'Automate CI/CD pipelines and manage cloud infrastructure at scale.',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Terraform', 'CI/CD'],
    avgSalary: 115000,
    demandScore: 87,
    category: 'Infrastructure',
  },
  {
    title: 'Mobile Developer',
    description: 'Build cross-platform mobile apps for iOS and Android.',
    requiredSkills: ['React Native', 'JavaScript', 'Swift', 'Kotlin', 'Mobile UI', 'Git'],
    avgSalary: 100000,
    demandScore: 78,
    category: 'Technology',
  },
  {
    title: 'Cloud Architect',
    description: 'Design enterprise cloud solutions on AWS, Azure, or GCP.',
    requiredSkills: ['AWS', 'Azure', 'Cloud Architecture', 'Terraform', 'Networking', 'Security'],
    avgSalary: 140000,
    demandScore: 82,
    category: 'Infrastructure',
  },
  {
    title: 'Machine Learning Engineer',
    description: 'Deploy ML models into production systems with monitoring and scaling.',
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Docker', 'MLOps'],
    avgSalary: 130000,
    demandScore: 91,
    category: 'Data',
  },
  {
    title: 'Product Manager',
    description: 'Define product strategy, roadmap, and coordinate cross-functional teams.',
    requiredSkills: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Communication', 'Roadmapping'],
    avgSalary: 125000,
    demandScore: 80,
    category: 'Product',
  },
  {
    title: 'UX Designer',
    description: 'Create user-centered designs through research, wireframes, and prototypes.',
    requiredSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'UI Design', 'Accessibility'],
    avgSalary: 90000,
    demandScore: 75,
    category: 'Design',
  },
  {
    title: 'Security Engineer',
    description: 'Protect systems through threat modeling, penetration testing, and compliance.',
    requiredSkills: ['Cybersecurity', 'Network Security', 'Penetration Testing', 'SIEM', 'Compliance', 'Linux'],
    avgSalary: 118000,
    demandScore: 86,
    category: 'Security',
  },
  {
    title: 'QA Engineer',
    description: 'Ensure software quality through automated and manual testing strategies.',
    requiredSkills: ['Test Automation', 'Selenium', 'JavaScript', 'API Testing', 'CI/CD', 'Bug Tracking'],
    avgSalary: 85000,
    demandScore: 72,
    category: 'Technology',
  },
  {
    title: 'Database Administrator',
    description: 'Manage, optimize, and secure relational and NoSQL database systems.',
    requiredSkills: ['SQL', 'PostgreSQL', 'MongoDB', 'Database Optimization', 'Backup', 'Security'],
    avgSalary: 98000,
    demandScore: 70,
    category: 'Infrastructure',
  },
  {
    title: 'Site Reliability Engineer',
    description: 'Maintain system reliability, uptime, and performance at scale.',
    requiredSkills: ['Linux', 'Monitoring', 'Kubernetes', 'Python', 'Incident Response', 'Automation'],
    avgSalary: 125000,
    demandScore: 84,
    category: 'Infrastructure',
  },
  {
    title: 'Business Analyst',
    description: 'Bridge business needs and technical solutions through requirements analysis.',
    requiredSkills: ['Requirements Analysis', 'SQL', 'Data Visualization', 'Communication', 'Agile', 'Documentation'],
    avgSalary: 82000,
    demandScore: 68,
    category: 'Business',
  },
  {
    title: 'AI Engineer',
    description: 'Build and integrate AI-powered features using LLMs and generative AI.',
    requiredSkills: ['Python', 'OpenAI', 'LangChain', 'Machine Learning', 'APIs', 'Prompt Engineering'],
    avgSalary: 135000,
    demandScore: 95,
    category: 'Data',
  },
  {
    title: 'Blockchain Developer',
    description: 'Develop decentralized applications and smart contracts.',
    requiredSkills: ['Solidity', 'Ethereum', 'Web3', 'JavaScript', 'Smart Contracts', 'Cryptography'],
    avgSalary: 115000,
    demandScore: 65,
    category: 'Technology',
  },
  {
    title: 'Technical Writer',
    description: 'Create clear documentation for APIs, SDKs, and developer tools.',
    requiredSkills: ['Technical Writing', 'Documentation', 'APIs', 'Markdown', 'Communication', 'Git'],
    avgSalary: 78000,
    demandScore: 60,
    category: 'Content',
  },
  {
    title: 'Scrum Master',
    description: 'Facilitate agile ceremonies and remove blockers for development teams.',
    requiredSkills: ['Scrum', 'Agile', 'Facilitation', 'Communication', 'Jira', 'Coaching'],
    avgSalary: 95000,
    demandScore: 73,
    category: 'Product',
  },
  {
    title: 'Solutions Architect',
    description: 'Design technical solutions that align with business requirements.',
    requiredSkills: ['System Design', 'Cloud Architecture', 'APIs', 'Communication', 'AWS', 'Microservices'],
    avgSalary: 145000,
    demandScore: 83,
    category: 'Technology',
  },
  {
    title: 'Data Engineer',
    description: 'Build data pipelines and ETL processes for analytics platforms.',
    requiredSkills: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'ETL', 'Data Warehousing'],
    avgSalary: 118000,
    demandScore: 89,
    category: 'Data',
  },
  {
    title: 'iOS Developer',
    description: 'Build native iOS applications using Swift and Apple frameworks.',
    requiredSkills: ['Swift', 'iOS', 'Xcode', 'UIKit', 'SwiftUI', 'Mobile UI'],
    avgSalary: 108000,
    demandScore: 76,
    category: 'Technology',
  },
  {
    title: 'Android Developer',
    description: 'Develop native Android apps using Kotlin and Jetpack Compose.',
    requiredSkills: ['Kotlin', 'Android', 'Jetpack Compose', 'Mobile UI', 'REST APIs', 'Git'],
    avgSalary: 102000,
    demandScore: 74,
    category: 'Technology',
  },
  {
    title: 'Growth Marketing Manager',
    description: 'Drive user acquisition and retention through data-driven marketing.',
    requiredSkills: ['Digital Marketing', 'Analytics', 'SEO', 'A/B Testing', 'Content Strategy', 'CRM'],
    avgSalary: 88000,
    demandScore: 71,
    category: 'Marketing',
  },
  {
    title: 'Cybersecurity Analyst',
    description: 'Monitor threats, investigate incidents, and implement security controls.',
    requiredSkills: ['Cybersecurity', 'SIEM', 'Incident Response', 'Network Security', 'Risk Assessment', 'Compliance'],
    avgSalary: 92000,
    demandScore: 88,
    category: 'Security',
  },
];

async function seed() {
  await connectDB();

  await JobRole.deleteMany({});
  const jobs = await JobRole.insertMany(SAMPLE_JOBS);
  console.log(`Seeded ${jobs.length} job roles into MongoDB`);

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key') {
    console.log('Generating embeddings for vector DB...');
    const ids = [];
    const embeddings = [];
    const documents = [];
    const metadatas = [];

    for (const job of jobs) {
      const text = `${job.title}. ${job.description}. Skills: ${job.requiredSkills.join(', ')}`;
      try {
        const embedding = await embedText(text);
        ids.push(job._id.toString());
        embeddings.push(embedding);
        documents.push(text);
        metadatas.push({
          title: job.title,
          skills: job.requiredSkills.join(', '),
          salary: job.avgSalary,
          category: job.category,
        });
      } catch (err) {
        console.warn(`Skipping embedding for ${job.title}:`, err.message);
      }
    }

    if (ids.length) {
      try {
        await upsert(ids, embeddings, documents, metadatas);
        console.log(`Upserted ${ids.length} embeddings into Chroma`);
      } catch (err) {
        console.warn('Vector DB upsert failed (is Chroma running?):', err.message);
      }
    }
  } else {
    console.log('Skipping vector DB seeding (set OPENAI_API_KEY to enable)');
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
