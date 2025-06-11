
import { config } from 'dotenv'; // Import dotenv
config(); // Call config() at the top to load .env variables

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Log environment variables to check if the API key is loaded
console.log('[genkit.ts] Checking for API keys in process.env (after dotenv.config()):');
console.log(`[genkit.ts] GOOGLE_API_KEY is ${process.env.GOOGLE_API_KEY ? 'FOUND' : 'MISSING'}`);
console.log(`[genkit.ts] GEMINI_API_KEY is ${process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING'}`);
if (process.env.GOOGLE_API_KEY) {
  console.log('[genkit.ts] GOOGLE_API_KEY value (first 5 chars):', process.env.GOOGLE_API_KEY.substring(0, 5) + '...');
}
if (process.env.GEMINI_API_KEY) {
  console.log('[genkit.ts] GEMINI_API_KEY value (first 5 chars):', process.env.GEMINI_API_KEY.substring(0, 5) + '...');
}

const googleAiPluginOptions: any = {};
if (process.env.GEMINI_API_KEY) {
  googleAiPluginOptions.apiKey = process.env.GEMINI_API_KEY;
  console.log('[genkit.ts] GEMINI_API_KEY will be explicitly passed to googleAI plugin.');
} else if (process.env.GOOGLE_API_KEY) {
  // Fallback to GOOGLE_API_KEY if GEMINI_API_KEY is not set, though GEMINI_API_KEY is preferred for Gemini models
  googleAiPluginOptions.apiKey = process.env.GOOGLE_API_KEY;
  console.log('[genkit.ts] GOOGLE_API_KEY will be explicitly passed to googleAI plugin (as fallback).');
} else {
  console.warn('[genkit.ts] Neither GEMINI_API_KEY nor GOOGLE_API_KEY found in environment. Genkit AI calls may fail.');
}

export const ai = genkit({
  plugins: [
    googleAI(googleAiPluginOptions) // Explicitly pass options (which may include apiKey)
  ],
  model: 'googleai/gemini-2.0-flash', // Default model for generate
});

