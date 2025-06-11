'use server';
/**
 * @fileOverview An AI agent that generates blog post titles.
 *
 * - generatePostTitle - Generates blog post titles based on a topic or keywords.
 * - GeneratePostTitleInput - The input type for the generatePostTitle function.
 * - GeneratePostTitleOutput - The return type for the generatePostTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostTitleInputSchema = z.object({
  topic: z.string().describe('The main topic or subject for the blog post.'),
  keywords: z.array(z.string()).optional().describe('A list of keywords to incorporate or focus on.'),
  count: z.number().optional().default(3).describe('Number of title suggestions to generate.'),
});
export type GeneratePostTitleInput = z.infer<typeof GeneratePostTitleInputSchema>;

const GeneratePostTitleOutputSchema = z.object({
  titles: z.array(z.string()).describe('A list of generated blog post titles.'),
});
export type GeneratePostTitleOutput = z.infer<typeof GeneratePostTitleOutputSchema>;

export async function generatePostTitle(input: GeneratePostTitleInput): Promise<GeneratePostTitleOutput> {
  return generatePostTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePostTitlePrompt',
  input: {schema: GeneratePostTitleInputSchema},
  output: {schema: GeneratePostTitleOutputSchema},
  prompt: `You are an expert blog post title generator.
Given the following topic and optional keywords, generate {{count}} compelling and SEO-friendly blog post titles.

Topic: {{{topic}}}
{{#if keywords}}
Keywords:
{{#each keywords}}
- {{{this}}}
{{/each}}
{{/if}}

Return the titles as a list of strings.
Ensure the output is a valid JSON of the following type:
{{json schema='GeneratePostTitleOutputSchema'}}
`,
});

const generatePostTitleFlow = ai.defineFlow(
  {
    name: 'generatePostTitleFlow',
    inputSchema: GeneratePostTitleInputSchema,
    outputSchema: GeneratePostTitleOutputSchema,
  },
  async (input: GeneratePostTitleInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
