
'use server';
import { getAdminFirestore } from '@/app/actions/adminActions'; // Admin SDK Firestore
import {FieldValue as AdminFieldValue} from 'firebase-admin/firestore'; // Admin SDK FieldValue for serverTimestamp
import type { BlogPost, Category, BlogCategoryType } from '@/types';
import { blogCategories } from '@/types';
import { slugify } from '@/lib/utils';

// Define mockPosts structure directly here or import if it's substantial
const mockPostsData: Omit<BlogPost, 'id' | 'date' | 'createdAt' | 'updatedAt' | 'published' | 'tags' | 'category' | 'imageUrl'> & { date: string, category: BlogCategoryType, tags: string[] }[] = [
  {
    slug: 'getting-started-with-ai',
    title: 'Getting Started with AI in Your Projects',
    date: '2024-07-15',
    author: 'AI Enthusiast',
    category: 'AI',
    excerpt: 'A beginner-friendly guide to integrating AI into your applications and workflows.',
    content: '<p>Full content about getting started with AI...</p><p>More details here.</p>',
    tags: ['AI', 'Machine Learning', 'Beginners Guide'],
    dataAiHint: 'artificial intelligence',
  },
  {
    slug: 'no-code-revolution',
    title: 'The No-Code Revolution: Building Apps Without Code',
    date: '2024-07-10',
    author: 'No-Coder Jane',
    category: 'No-code',
    excerpt: 'Explore how no-code platforms are empowering creators to build powerful applications.',
    content: '<p>Detailed exploration of no-code platforms and their impact...</p>',
    tags: ['No-code', 'App Development', 'Productivity Tools'],
    dataAiHint: 'visual programming',
  },
  {
    slug: 'mastering-modern-vibe-coding',
    title: 'Mastering Modern Vibe Coding Techniques',
    date: '2024-07-05',
    author: 'Code Master Flex',
    category: 'Vibe coding',
    excerpt: 'Dive into the latest trends and best practices in vibe coding for 2024.',
    content: '<p>Comprehensive guide to modern vibe coding...</p>',
    tags: ['JavaScript', 'React Framework', 'Next.js Guide', 'CSS Styling'],
    dataAiHint: 'web development',
  },
  {
    slug: 'automation-for-small-business',
    title: 'Streamlining Your Small Business with Automation',
    date: '2024-06-28',
    author: 'Automation Ally',
    category: 'Automation',
    excerpt: 'Discover tools and strategies to automate repetitive tasks and boost efficiency.',
    content: '<p>Practical automation tips for small businesses...</p>',
    tags: ['Automation Software', 'Small Business Tips', 'Productivity Hacks'],
    dataAiHint: 'business automation',
  },
  {
    slug: 'essential-developer-tools',
    title: 'Top 10 Essential Tools for Developers in 2024',
    date: '2024-06-20',
    author: 'Tool Time Tim',
    category: 'Tools',
    excerpt: 'A curated list of indispensable tools that every developer should know.',
    content: '<p>List and review of top developer tools...</p>',
    tags: ['Developer Tools', 'Software Development IDE', 'Version Control Systems'],
    dataAiHint: 'coding tools',
  },
  {
    slug: 'choosing-cloud-hosting',
    title: 'Choosing the Right Cloud Hosting for Your Needs',
    date: '2024-06-15',
    author: 'Cloudy McCloudface',
    category: 'Cloud Hosting',
    excerpt: 'A guide to navigating the options and selecting the best cloud hosting provider.',
    content: '<p>In-depth analysis of cloud hosting options...</p>',
    tags: ['Cloud Hosting Services', 'VPS Hosting', 'Infrastructure as a Service', 'Platform as a Service'],
    dataAiHint: 'server hosting',
  },
];


export async function seedDatabase() {
  const adminDb = await getAdminFirestore();
  const postsCollection = adminDb.collection('posts');
  const categoriesCollection = adminDb.collection('categories');
  
  const nowJSDate = new Date();

  const postsQuery = postsCollection.limit(1);
  const postsSnapshot = await postsQuery.get();
  if (!postsSnapshot.empty) {
    console.log('[seedDatabase] Posts collection is not empty. Skipping posts seeding.');
  } else {
    const postsBatch = adminDb.batch();
    mockPostsData.forEach((postData) => {
      const postRef = postsCollection.doc(); 
      const processedTags = postData.tags.map(tag => slugify(tag.trim())).filter(tag => tag.length > 0);
      
      // Generate a dynamic Unsplash URL based on the data-ai-hint
      const imageUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(postData.dataAiHint || 'technology')}`;

      const postToSeed = {
        ...postData,
        imageUrl: imageUrl, // Use the generated Unsplash URL
        category: slugify(postData.category),
        tags: processedTags,
        date: new Date(postData.date),
        published: true,
        createdAt: nowJSDate,
        updatedAt: nowJSDate,
      };
      postsBatch.set(postRef, postToSeed);
    });
    await postsBatch.commit();
    console.log(`[seedDatabase] ${mockPostsData.length} posts have been seeded with Unsplash images.`);
  }

  const categoriesQuery = categoriesCollection.limit(1);
  const categoriesSnapshot = await categoriesQuery.get();
  if (!categoriesSnapshot.empty) {
    console.log('[seedDatabase] Categories collection is not empty. Skipping categories seeding.');
  } else {
    const categoriesBatch = adminDb.batch();
    const uniqueCategoryNames = new Set(blogCategories);
    uniqueCategoryNames.forEach((categoryName) => {
      const categoryRef = categoriesCollection.doc(); 
      const categoryToSeed = {
        name: categoryName,
        slug: slugify(categoryName),
      };
      categoriesBatch.set(categoryRef, categoryToSeed);
    });
    await categoriesBatch.commit();
    console.log(`[seedDatabase] ${uniqueCategoryNames.size} categories have been seeded.`);
  }
}
