function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    return JSON.parse(cleaned);
  }
}

async function safeParseLLMResponse(text, retryFn) {
  try {
    return parseJSON(text);
  } catch (firstError) {
    if (retryFn) {
      const retryText = await retryFn();
      try {
        return parseJSON(retryText);
      } catch {
        throw new Error(`Failed to parse LLM JSON response: ${firstError.message}`);
      }
    }
    throw new Error(`Failed to parse LLM JSON response: ${firstError.message}`);
  }
}

module.exports = { parseJSON, safeParseLLMResponse };
