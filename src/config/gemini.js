const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const MODEL_FALLBACK_CHAIN = [
  GEMINI_MODEL,
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
].filter((v, i, a) => a.indexOf(v) === i);

const structuredCallTimestamps = [];
const chatCallTimestamps = [];
const MAX_STRUCTURED_PER_MINUTE = 6;
const MAX_CHAT_PER_MINUTE = 30;

function isGeminiConfigured() {
  return !!GEMINI_API_KEY;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pruneTimestamps(bucket) {
  const now = Date.now();
  while (bucket.length && now - bucket[0] > 60000) bucket.shift();
}

function canMakeCall(bucket, max) {
  pruneTimestamps(bucket);
  return bucket.length < max;
}

function recordCall(bucket) {
  bucket.push(Date.now());
}

async function postGemini(body, { maxAttempts = 4, models = MODEL_FALLBACK_CHAIN } = {}) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  let lastError;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const { data } = await axios.post(url, body, { timeout: 60000 });
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          const reason = data.candidates?.[0]?.finishReason;
          throw new Error(reason ? `Gemini blocked: ${reason}` : "Empty Gemini response");
        }
        return { text: text.trim(), model };
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message;

        if (status === 429 && attempt < maxAttempts - 1) {
          const retryAfter = parseInt(err.response?.headers?.["retry-after"] || "0", 10);
          await sleep(retryAfter > 0 ? retryAfter * 1000 : 2000 * Math.pow(2, attempt));
          continue;
        }

        if (status === 429 || status === 404 || (status === 400 && /quota|limit|not valid|not found/i.test(msg))) {
          console.warn(`Gemini model ${model} unavailable: ${msg.slice(0, 120)}`);
          break;
        }

        throw err;
      }
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

async function generateContent(prompt, systemInstruction, { maxTokens = 2048 } = {}) {
  if (!canMakeCall(structuredCallTimestamps, MAX_STRUCTURED_PER_MINUTE)) {
    const err = new Error("Local structured API rate limit reached");
    err.code = "RATE_LIMIT_LOCAL";
    throw err;
  }
  recordCall(structuredCallTimestamps);

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens, responseMimeType: "application/json" },
  };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

  const { text } = await postGemini(body);
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse Gemini JSON response");
  }
}

async function generateText({ systemInstruction, userMessage, history = [], maxTokens = 2048, temperature = 0.85 }) {
  if (!canMakeCall(chatCallTimestamps, MAX_CHAT_PER_MINUTE)) {
    const err = new Error("Local chat rate limit reached");
    err.code = "RATE_LIMIT_LOCAL";
    throw err;
  }
  recordCall(chatCallTimestamps);

  const contents = [];
  for (const turn of history) {
    if (!turn.message && !turn.content) continue;
    contents.push({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.message || turn.content }],
    });
  }
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const body = {
    contents,
    generationConfig: { temperature, maxOutputTokens: maxTokens, topP: 0.95 },
  };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

  const { text, model } = await postGemini(body);
  console.log(`Gemini chat response via ${model}`);
  return text;
}

module.exports = { isGeminiConfigured, generateContent, generateText };
