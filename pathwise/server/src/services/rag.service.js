const { query } = require('../config/vectorDb');
const { embedText } = require('./embedding.service');
const { careerCounselorReply } = require('./llm.service');

async function retrieveContext(userQuestion, nResults = 5) {
  try {
    const embedding = await embedText(userQuestion);
    const results = await query(embedding, nResults);

    if (!results.documents?.[0]?.length) {
      return 'No specific job market data available.';
    }

    return results.documents[0]
      .map((doc, i) => {
        const meta = results.metadatas?.[0]?.[i] || {};
        return `[${meta.title || 'Role'}] Skills: ${meta.skills || 'N/A'}. Salary: $${meta.salary || 'N/A'}. ${doc}`;
      })
      .join('\n\n');
  } catch (err) {
    console.warn('RAG retrieval failed, proceeding without context:', err.message);
    return 'Job market data temporarily unavailable.';
  }
}

async function answerWithRAG(userMessage, history = []) {
  const context = await retrieveContext(userMessage);
  const reply = await careerCounselorReply(userMessage, context, history);
  return { reply, contextUsed: context !== 'Job market data temporarily unavailable.' };
}

module.exports = { retrieveContext, answerWithRAG };
