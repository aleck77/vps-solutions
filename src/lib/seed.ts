
'use server';
import { getAdminFirestore } from '@/app/actions/adminActions'; // Admin SDK Firestore
import {FieldValue as AdminFieldValue} from 'firebase-admin/firestore'; // Admin SDK FieldValue for serverTimestamp
import type { BlogPost, Category, BlogCategoryType, PageData } from '@/types';
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

const pagesToSeed: { [slug: string]: Omit<PageData, 'id'> } = {
  'about': {
    title: "About VHost Solutions",
    metaDescription: "Empowering innovation with reliable and high-performance hosting.",
    contentBlocks: [
      { type: "paragraph", text: "At VHost Solutions, our mission is to provide cutting-edge VPS hosting services that are powerful, reliable, and accessible. We strive to empower developers, entrepreneurs, and businesses of all sizes to achieve their online goals by offering top-tier infrastructure, exceptional customer support, and a commitment to continuous innovation." },
      { type: "paragraph", text: "We believe that great hosting is the foundation of online success, and we are dedicated to building that foundation for our clients with integrity and expertise." },
      { type: "image", url: "https://source.unsplash.com/600x400/?team,office", alt: "VHost Solutions Team", dataAiHint: "team office" },
      { type: "heading", level: 2, text: "Our Values" },
      { type: "value_card", icon: "Zap", title: "Innovation", text: "We embrace new technologies to provide cutting-edge solutions." },
      { type: "value_card", icon: "Users", title: "Customer Focus", text: "Our customers are at the heart of everything we do." },
      { type: "value_card", icon: "ShieldCheck", title: "Reliability", text: "We deliver consistent and dependable hosting services." }
    ]
  },
  'privacy-policy': {
    title: "Privacy Policy",
    metaDescription: "Read the VHost Solutions privacy policy.",
    contentBlocks: [
        { type: "paragraph", text: "Welcome to VHost Solutions. We are committed to protecting your personal information and your right to privacy. This privacy policy applies to all information collected through our website and/or any related services." },
        { type: "heading", level: 2, text: "Information We Collect" },
        { type: "paragraph", text: "We collect personal information that you voluntarily provide to us when registering, expressing an interest in obtaining information about us or our products and services, or otherwise contacting us." }
    ]
  },
  'terms-of-service': {
    title: "Terms of Service",
    metaDescription: "Read the VHost Solutions terms of service.",
    contentBlocks: [
        { type: "paragraph", text: "These Terms of Service constitute a legally binding agreement made between you and VHost Solutions concerning your access to and use of the website." },
        { type: "heading", level: 2, text: "Agreement to Terms" },
        { type: "paragraph", text: "By accessing the Site, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree, you are expressly prohibited from using the Site and must discontinue use immediately." }
    ]
  }
};


export async function seedDatabase() {
  const adminDb = await getAdminFirestore();
  const postsCollection = adminDb.collection('posts');
  const categoriesCollection = adminDb.collection('categories');
  const pagesCollection = adminDb.collection('pages');
  
  const nowJSDate = new Date();

  // Seed Posts
  const postsQuery = postsCollection.limit(1);
  const postsSnapshot = await postsQuery.get();
  if (!postsSnapshot.empty) {
    console.log('[seedDatabase] Posts collection is not empty. Skipping posts seeding.');
  } else {
    const postsBatch = adminDb.batch();
    mockPostsData.forEach((postData) => {
      const postRef = postsCollection.doc(); 
      const processedTags = postData.tags.map(tag => slugify(tag.trim())).filter(tag => tag.length > 0);
      
      const imageUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(postData.dataAiHint || 'technology')}`;

      const postToSeed = {
        ...postData,
        imageUrl: imageUrl,
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

  // Seed Categories
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

  // Seed Pages
  const pagesBatch = adminDb.batch();
  let pagesSeededCount = 0;
  for (const slug in pagesToSeed) {
    const pageRef = pagesCollection.doc(slug);
    const doc = await pageRef.get();
    if (!doc.exists) {
      pagesBatch.set(pageRef, {
        ...pagesToSeed[slug],
        updatedAt: AdminFieldValue.serverTimestamp(),
        createdAt: AdminFieldValue.serverTimestamp(),
      });
      pagesSeededCount++;
      console.log(`[seedDatabase] Queued page "${slug}" for seeding.`);
    } else {
       console.log(`[seedDatabase] Page "${slug}" already exists. Skipping.`);
    }
  }
  if (pagesSeededCount > 0) {
    await pagesBatch.commit();
    console.log(`[seedDatabase] ${pagesSeededCount} new page(s) have been seeded.`);
  } else {
    console.log('[seedDatabase] All pages already exist. No new pages were seeded.');
  }
}
