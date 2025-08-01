'use server';
/**
 * @fileOverview A minimal Genkit flow to test basic AI text generation.
 * - testBasicGeneration - Calls ai.generate() directly.
 * - TestBasicGenerationOutput - The return type for the testBasicGeneration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TestBasicGenerationOutputSchema = z.object({
  generatedText: z.string().describe('The text generated by the model, or an error message if failed.'),
  success: z.boolean().describe('Whether the generation was successful.'),
});
export type TestBasicGenerationOutput = z.infer<typeof TestBasicGenerationOutputSchema>;

export async function testBasicGeneration(): Promise<TestBasicGenerationOutput> {
  return testBasicGenerationFlow({}); // Pass empty object as input to the flow
}

const testBasicGenerationFlow = ai.defineFlow(
  {
    name: 'testBasicGenerationFlow',
    inputSchema: z.object({}), // No specific input needed for this test
    outputSchema: TestBasicGenerationOutputSchema,
  },
  async () => {
    console.log('[TestBasicGenerationFlow] Starting basic generation test...');
    try {
      const response = await ai.generate({
        prompt: 'Write a short, friendly sentence about a cat watching birds.',
        // The model used will be the default one configured in src/ai/genkit.ts (e.g., googleai/gemini-2.0-flash)
        config: { temperature: 0.7 },
      });

      const resultText = response.text; // CORRECTED: Genkit 1.x syntax

      if (resultText === null || resultText === undefined || resultText.trim() === "") {
        console.warn('[TestBasicGenerationFlow] ai.generate() returned null, undefined, or empty text output.');
        // Log the full response object if text is not available, to see if there's other info (e.g., safety ratings, finish reason)
        console.log('[TestBasicGenerationFlow] Full response object:', JSON.stringify(response, null, 2));
        return { generatedText: "AI returned no text or empty text. Full response logged on server.", success: false };
      }
      console.log('[TestBasicGenerationFlow] ai.generate() successful. Output text:', resultText);
      return { generatedText: resultText, success: true };
    } catch (error: any) {
      console.error('[TestBasicGenerationFlow] Error during ai.generate():', error.message);
      let detailedMessage = error.message || 'Unknown error during basic generation.';
      if (error.cause) {
        detailedMessage += ` Cause: ${error.cause}`;
      }
      // Attempt to log the whole error object structure for more clues
      console.error('[TestBasicGenerationFlow] Full error object structure:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      return {
        generatedText: `Basic generation failed: ${detailedMessage}. (Check server logs for 'TestBasicGenerationFlow' details and full error object)`,
        success: false,
      };
    }
  }
);
