
'use server';
import { collection, doc, writeBatch, Timestamp, getDocs, query, limit } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase'; // Corrected import: db as firestore
import type { BlogPost, Category, BlogCategoryType } from '@/types';
import { blogCategories } from '@/types'; // Import the actual array
import { slugify } from '@/lib/utils'; // Import slugify

// Define mockPosts structure directly here or import if it's substantial
const mockPostsData: Omit<BlogPost, 'id' | 'date' | 'createdAt' | 'updatedAt' | 'published' | 'tags' | 'category'> & { date: string, category: BlogCategoryType, tags: string[] }[] = [
  {
    slug: 'getting-started-with-ai',
    title: 'Getting Started with AI in Your Projects',
    date: '2024-07-15',
    author: 'AI Enthusiast',
    category: 'AI',
    excerpt: 'A beginner-friendly guide to integrating AI into your applications and workflows.',
    content: '<p>Full content about getting started with AI...</p><p>More details here.</p>',
    imageUrl: 'https://placehold.co/600x400.png',
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
    imageUrl: 'https://placehold.co/600x400.png',
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
    imageUrl: 'https://placehold.co/600x400.png',
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
    imageUrl: 'https://placehold.co/600x400.png',
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
    imageUrl: 'https://placehold.co/600x400.png',
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
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Cloud Hosting Services', 'VPS Hosting', 'Infrastructure as a Service', 'Platform as a Service'],
    dataAiHint: 'server hosting',
  },
];


export async function seedDatabase() {
  const postsCollection = collection(firestore, 'posts');
  const categoriesCollection = collection(firestore, 'categories');
  const now = Timestamp.now();

  // Check if posts collection is empty before seeding
  const postsQuery = query(postsCollection, limit(1));
  const postsSnapshot = await getDocs(postsQuery);
  if (!postsSnapshot.empty) {
    console.log('[seedDatabase] Posts collection is not empty. Skipping posts seeding.');
  } else {
    const postsBatch = writeBatch(firestore);
    mockPostsData.forEach((postData) => {
      const postRef = doc(postsCollection); // Auto-generate ID
      const processedTags = postData.tags.map(tag => slugify(tag.trim())).filter(tag => tag.length > 0);
      const postToSeed: BlogPost = {
        ...postData,
        slug: slugify(postData.title), // Ensure slug is consistent if title changes
        category: slugify(postData.category), // Store category as slug
        tags: processedTags,
        date: Timestamp.fromDate(new Date(postData.date)),
        published: true,
        createdAt: now,
        updatedAt: now,
      };
      postsBatch.set(postRef, postToSeed);
    });
    await postsBatch.commit();
    console.log(`[seedDatabase] ${mockPostsData.length} posts have been seeded.`);
  }

  // Check if categories collection is empty before seeding
  const categoriesQuery = query(categoriesCollection, limit(1));
  const categoriesSnapshot = await getDocs(categoriesQuery);
  if (!categoriesSnapshot.empty) {
    console.log('[seedDatabase] Categories collection is not empty. Skipping categories seeding.');
  } else {
    const categoriesBatch = writeBatch(firestore);
    // Create a Set to ensure unique category names before slugifying and seeding
    const uniqueCategoryNames = new Set(blogCategories);
    uniqueCategoryNames.forEach((categoryName) => {
      const categoryRef = doc(categoriesCollection); // Auto-generate ID
      const categoryToSeed: Category = {
        name: categoryName, // Store original name
        slug: slugify(categoryName), // Store slugified name
        id: categoryRef.id,
      };
      categoriesBatch.set(categoryRef, categoryToSeed);
    });
    await categoriesBatch.commit();
    console.log(`[seedDatabase] ${uniqueCategoryNames.size} categories have been seeded.`);
  }
}
