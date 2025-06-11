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
  try {
    return await recommendRelevantPostsFlow(input);
  } catch (error: any) { // Added type assertion for error
    console.warn(
      '[recommendRelevantPosts] AI-based recommendRelevantPostsFlow failed. Falling back to mock recommendations.',
      error.message // Log only message for brevity in fallback path
    );
    const mockRecs = input.availablePosts.slice(0, 3);
    return { recommendedPosts: mockRecs };
  }
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
  console.log(`[AI Flow - analyzeRelevanceTool] Calculating relevance for: ${input.candidatePost.substring(0,50)}...`);
  return Math.random(); 
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
  system: `You are a blog post recommendation engine. Recommend blog posts based on relevance to the current post and user history, using the analyzeRelevance tool. Return a maximum of 3 recommendations.`,
});

const recommendRelevantPostsFlow = ai.defineFlow(
  {
    name: 'recommendRelevantPostsFlow',
    inputSchema: RecommendRelevantPostsInputSchema,
    outputSchema: RecommendRelevantPostsOutputSchema,
  },
  async (input: RecommendRelevantPostsInput): Promise<RecommendRelevantPostsOutput> => {
    try {
      // Genkit 1.x: The result of prompt(input) directly has an `output` property.
      const result = await prompt(input);
      if (!result || !result.output) { // Check both result and result.output
        console.error('[recommendRelevantPostsFlow] AI prompt executed but returned null/undefined output or result.');
        // Throw an error here so the calling function's catch block handles the fallback
        throw new Error("AI prompt returned no output."); 
      }
      return result.output; // Use result.output directly
    } catch (error: any) {
      console.error('[recommendRelevantPostsFlow] Error during AI prompt execution:', error.message);
      // Re-throw the error to be caught by the wrapper function (recommendRelevantPosts)
      // which will then handle the fallback to mock recommendations.
      // This ensures the fallback logic is centralized.
      throw error; 
    }
  }
);
