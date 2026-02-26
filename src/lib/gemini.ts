import { GoogleGenAI } from '@google/genai';

export const createGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing!');
    throw new Error('API Key missing');
  }

  return new GoogleGenAI({ apiKey });
};

