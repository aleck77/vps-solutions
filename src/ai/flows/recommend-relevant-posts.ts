'use server';

/**
 * @fileOverview An AI agent that recommends relevant blog posts based on user browsing history.
 *
 * - recommendRelevantPosts - A function that recommends relevant blog posts.
 * - RecommendRelevantPostsInput - The input type for the recommendRelevantPosts function.
 * - RecommendRelevantPostsOutput - The return type for the recommendRelevantPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendRelevantPostsInputSchema = z.object({
  currentPostContent: z
    .string()
    .describe('The content of the current blog post the user is viewing.'),
  userHistory: z
    .array(z.string())
    .describe(
      'A list of URLs representing the user browsing history on the blog.'
    ),
  availablePosts: z
    .array(z.string())
    .describe('A list of available blog post titles and summaries.'),
});
export type RecommendRelevantPostsInput = z.infer<
  typeof RecommendRelevantPostsInputSchema
>;

const RecommendRelevantPostsOutputSchema = z.object({
  recommendedPosts: z
    .array(z.string())
    .describe(
      'A list of recommended blog post titles, ordered by relevance to the current post and user history.'
    ),
});
export type RecommendRelevantPostsOutput = z.infer<
  typeof RecommendRelevantPostsOutputSchema
>;

export async function recommendRelevantPosts(
  input: RecommendRelevantPostsInput
): Promise<RecommendRelevantPostsOutput> {
  return recommendRelevantPostsFlow(input);
}

const analyzeRelevanceTool = ai.defineTool({
  name: 'analyzeRelevance',
  description: 'Analyzes the relevance of a blog post to the current post and user history.',
  inputSchema: z.object({
    candidatePost: z.string().describe('The title and summary of the candidate blog post.'),
    currentPostContent: z.string().describe('The content of the current blog post.'),
    userHistory: z.array(z.string()).describe('The user browsing history.'),
  }),
  outputSchema: z.number().describe('A numerical score representing the relevance (higher is more relevant).'),
}, async (input) => {
  // Dummy implementation - replace with actual relevance calculation logic
  // This could involve calling another LLM or using a vector database
  console.log(`Calculating relevance for ${input.candidatePost}`);
  return Math.random(); // Replace with actual relevance score
});

const prompt = ai.definePrompt({
  name: 'recommendRelevantPostsPrompt',
  input: {schema: RecommendRelevantPostsInputSchema},
  output: {schema: RecommendRelevantPostsOutputSchema},
  tools: [analyzeRelevanceTool],
  prompt: `You are an AI blog post recommendation engine.

  Based on the content of the current blog post and the user's browsing history,
  recommend other relevant blog posts from the list of available posts.

  Current Post Content: {{{currentPostContent}}}
  User History: {{#each userHistory}}{{{this}}}\n{{/each}}

  Available Posts:
  {{#each availablePosts}}
  - {{{this}}}
  {{/each}}

  Use the analyzeRelevance tool to determine the relevance of each available post.
  Return only the titles of the posts that are most relevant to the user, ordered by relevance.

  Make sure the output is a valid JSON of the following type:
  {{json schema='RecommendRelevantPostsOutputSchema'}}
  `,
  system: `You are a blog post recommendation engine. Recommend blog posts based on relevance to the current post and user history, using the analyzeRelevance tool.`, // Added system prompt to guide behavior
});

const recommendRelevantPostsFlow = ai.defineFlow(
  {
    name: 'recommendRelevantPostsFlow',
    inputSchema: RecommendRelevantPostsInputSchema,
    outputSchema: RecommendRelevantPostsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
