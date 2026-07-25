const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function parsePDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractText(buffer, mimetype, originalname) {
  const name = (originalname || '').toLowerCase();

  if (mimetype === 'application/pdf' || name.endsWith('.pdf')) {
    return parsePDF(buffer);
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return parseDocx(buffer);
  }

  if (mimetype === 'text/plain' || name.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported file type. Upload PDF, DOCX, or TXT.');
}

function calculateATSScore(rawText, targetRole = '', userSkills = []) {
  let score = 0;
  const text = rawText.toLowerCase();

  const hasEmail = /\S+@\S+\.\S+/.test(rawText);
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(rawText);
  if (hasEmail) score += 10;
  if (hasPhone) score += 10;

  const sections = ['experience', 'education', 'skills', 'projects', 'summary'];
  const foundSections = sections.filter((s) => text.includes(s));
  score += foundSections.length * 8;

  const bulletCount = (rawText.match(/[•\-\*]\s/g) || []).length;
  score += Math.min(bulletCount * 2, 20);

  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 300 && wordCount <= 1200) score += 15;
  else if (wordCount >= 150) score += 8;

  if (targetRole) {
    const roleKeywords = targetRole.toLowerCase().split(/\s+/);
    const roleMatches = roleKeywords.filter((kw) => text.includes(kw)).length;
    score += Math.min(roleMatches * 5, 15);
  }

  if (userSkills.length) {
    const skillMatches = userSkills.filter((s) => text.includes(s.toLowerCase())).length;
    score += Math.min(skillMatches * 3, 15);
  }

  return Math.min(Math.round(score), 100);
}

module.exports = { extractText, parsePDF, parseDocx, calculateATSScore };
