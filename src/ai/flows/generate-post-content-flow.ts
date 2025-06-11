'use server';
/**
 * @fileOverview An AI agent that generates blog post content.
 *
 * - generatePostContent - Generates blog post content based on a title or topic.
 * - GeneratePostContentInput - The input type for the generatePostContent function.
 * - GeneratePostContentOutput - The return type for the generatePostContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostContentInputSchema = z.object({
  title: z.string().describe('The title of the blog post for which to generate content.'),
  topic: z.string().optional().describe('The main topic or subject, if different or more detailed than the title.'),
  keywords: z.array(z.string()).optional().describe('A list of keywords to incorporate or focus on.'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium').describe('Desired length of the content (e.g., short paragraph, medium article, long detailed post).'),
  outputFormat: z.enum(['plaintext', 'markdown_basic']).default('plaintext').describe('Desired output format for the content.'),
});
export type GeneratePostContentInput = z.infer<typeof GeneratePostContentInputSchema>;

const GeneratePostContentOutputSchema = z.object({
  content: z.string().describe('The generated blog post content.'),
});
export type GeneratePostContentOutput = z.infer<typeof GeneratePostContentOutputSchema>;

export async function generatePostContent(input: GeneratePostContentInput): Promise<GeneratePostContentOutput> {
  return generatePostContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePostContentPrompt',
  input: {schema: GeneratePostContentInputSchema},
  output: {schema: GeneratePostContentOutputSchema},
  prompt: `You are an expert blog content writer.
Given the blog post title, and optional topic, keywords, and desired length, generate engaging and informative content.

Title: {{{title}}}
{{#if topic}}
Topic: {{{topic}}}
{{/if}}
{{#if keywords}}
Keywords:
{{#each keywords}}
- {{{this}}}
{{/each}}
{{/if}}
Desired Length: {{{length}}}

{{#ifEquals outputFormat "markdown_basic"}}
Please format the output using basic Markdown (headings, paragraphs, lists, bold, italics).
{{else}}
Please provide the content as plain text.
{{/ifEquals}}

Focus on clarity, good structure, and providing value to the reader.
Ensure the output is a valid JSON of the following type:
{{json schema='GeneratePostContentOutputSchema'}}
`,
});

const generatePostContentFlow = ai.defineFlow(
  {
    name: 'generatePostContentFlow',
    inputSchema: GeneratePostContentInputSchema,
    outputSchema: GeneratePostContentOutputSchema,
  },
  async (input: GeneratePostContentInput): Promise<GeneratePostContentOutput> => {
    try {
      // Genkit 1.x: The result of prompt(input) directly has an `output` property.
      const result = await prompt(input);
      if (!result || !result.output) { // Check both result and result.output
        console.error('[generatePostContentFlow] AI prompt executed but returned null/undefined output or result.');
        return { content: "AI content generation failed: No output from model. Check API key and server logs." };
      }
      return result.output; // Use result.output directly
    } catch (error: any) {
      console.error('[generatePostContentFlow] Error during AI prompt execution:', error.message);
      if (error.message && error.message.includes("reading 'hash'")) {
        console.error('[generatePostContentFlow] This specific error often indicates a missing or invalid API key for the AI service, or a deeper initialization issue.');
      }
      return { content: `AI content generation failed. Please check server logs. Error: ${error.message}` };
    }
  }
);
