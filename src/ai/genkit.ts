
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

// If GEMINI_API_KEY is found, we'll rely on the googleAI() plugin to pick it up from process.env.
// If only GOOGLE_API_KEY is found, it should also be picked up.
// No need to explicitly pass googleAiPluginOptions if the key is in the environment.
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.warn('[genkit.ts] Neither GEMINI_API_KEY nor GOOGLE_API_KEY found in environment. Genkit AI calls may fail.');
}

export const ai = genkit({
  plugins: [
    googleAI() // Rely on plugin to find API key in process.env
  ],
  model: 'googleai/gemini-2.0-flash', // Reverted to user's preferred model
});
