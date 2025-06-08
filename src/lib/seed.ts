
'use server';
import { collection, doc, writeBatch, Timestamp, getDocs, query, limit } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase'; // Corrected import: db as firestore
import type { BlogPost, Category, BlogCategoryType } from '@/types';
import { blogCategories } from '@/types'; // Import the actual array

// Define mockPosts structure directly here or import if it's substantial
const mockPostsData: Omit<BlogPost, 'id' | 'date' | 'createdAt' | 'updatedAt' | 'published'> & { date: string, category: BlogCategoryType }[] = [
  {
    slug: 'getting-started-with-ai',
    title: 'Getting Started with AI in Your Projects',
    date: '2024-07-15',
    author: 'AI Enthusiast',
    category: 'AI',
    excerpt: 'A beginner-friendly guide to integrating AI into your applications and workflows.',
    content: '<p>Full content about getting started with AI...</p><p>More details here.</p>',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Machine Learning', 'Beginners'],
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
    tags: ['No-code', 'App Development', 'Productivity'],
  },
  {
    slug: 'mastering-modern-webcode',
    title: 'Mastering Modern Web Development Techniques',
    date: '2024-07-05',
    author: 'Code Master Flex',
    category: 'Webcode',
    excerpt: 'Dive into the latest trends and best practices in web development for 2024.',
    content: '<p>Comprehensive guide to modern web development...</p>',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['JavaScript', 'React', 'Next.js', 'CSS'],
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
    tags: ['Automation', 'Small Business', 'Productivity Tools'],
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
    tags: ['Developer Tools', 'IDE', 'Version Control'],
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
    tags: ['Cloud Hosting', 'VPS', 'IaaS', 'PaaS'],
  },
];


function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

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
      const postToSeed: BlogPost = {
        ...postData,
        category: slugify(postData.category), // Store category as slug
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
    blogCategories.forEach((categoryName) => {
      const categoryRef = doc(categoriesCollection); // Auto-generate ID
      const categoryToSeed: Category = {
        name: categoryName,
        slug: slugify(categoryName),
        id: categoryRef.id, // Store the auto-generated ID if needed, or let Firestore handle it
      };
      categoriesBatch.set(categoryRef, categoryToSeed);
    });
    await categoriesBatch.commit();
    console.log(`[seedDatabase] ${blogCategories.length} categories have been seeded.`);
  }
}

// Example of how you might call this.
// You'll need to trigger this manually once, e.g., from a temporary route or script.
// seedDatabase().catch(console.error);
