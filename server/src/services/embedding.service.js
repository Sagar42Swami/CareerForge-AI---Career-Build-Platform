const OpenAI = require('openai');

let openai = null;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function embedText(text) {
  const client = getOpenAI();
  const input = text.slice(0, 8000);

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input,
  });

  return response.data[0].embedding;
}

module.exports = { embedText };
