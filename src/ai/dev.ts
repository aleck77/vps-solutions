import { config } from 'dotenv';
config();

import '@/ai/flows/recommend-relevant-posts.ts';
import '@/ai/flows/generate-post-title-flow.ts';
import '@/ai/flows/generate-post-content-flow.ts';
import '@/ai/flows/test-basic-generation-flow.ts'; // Added new test flow
