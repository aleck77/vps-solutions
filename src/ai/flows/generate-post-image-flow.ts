
'use server';
/**
 * @fileOverview An AI agent that generates images for blog posts.
 *
 * - generatePostImage - Generates an image based on a prompt or topic.
 * - GeneratePostImageInput - The input type for the generatePostImage function.
 * - GeneratePostImageOutput - The return type for the generatePostImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostImageInputSchema = z.object({
  prompt: z.string().describe('The prompt or topic for the image to be generated.'),
});
export type GeneratePostImageInput = z.infer<typeof GeneratePostImageInputSchema>;

const GeneratePostImageOutputSchema = z.object({
  imageDataUri: z.string().optional().describe('The generated image as a data URI (e.g., data:image/png;base64,...), or undefined if generation failed.'),
  error: z.string().optional().describe('An error message if image generation failed.'),
});
export type GeneratePostImageOutput = z.infer<typeof GeneratePostImageOutputSchema>;

export async function generatePostImage(input: GeneratePostImageInput): Promise<GeneratePostImageOutput> {
  return generatePostImageFlow(input);
}

const generatePostImageFlow = ai.defineFlow(
  {
    name: 'generatePostImageFlow',
    inputSchema: GeneratePostImageInputSchema,
    outputSchema: GeneratePostImageOutputSchema,
  },
  async (input: GeneratePostImageInput): Promise<GeneratePostImageOutput> => {
    try {
      console.log(`[generatePostImageFlow] Attempting to generate image with prompt: "${input.prompt}"`);
      const {media, text} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Model must support image generation
        prompt: input.prompt,
        config: {
          responseModalities: ['IMAGE', 'TEXT'], // Must request IMAGE modality
          // Optionally add safetySettings if needed, though defaults are usually fine for general images
          // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' }] 
        },
      });

      if (media && media.url) {
        console.log('[generatePostImageFlow] Image generated successfully. Data URI (first 50 chars):', media.url.substring(0, 50) + '...');
        return { imageDataUri: media.url };
      } else {
        // Log the text part if available, it might contain useful info or error from the model
        console.warn('[generatePostImageFlow] Image generation returned no media URL. Text response:', text);
        return { error: `Image generation failed: No image data received. Model response: ${text || 'N/A'}` };
      }
    } catch (error: any) {
      console.error('[generatePostImageFlow] Error during image generation:', error);
      let errorMessage = error.message || 'Unknown error during image generation.';
      if (error.cause) {
        errorMessage += ` Cause: ${error.cause}`;
      }
      return { error: `Image generation failed: ${errorMessage}` };
    }
  }
);
