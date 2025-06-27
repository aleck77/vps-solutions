
'use server';
import { getAdminFirestore } from '@/app/actions/adminActions'; // Admin SDK Firestore
import {FieldValue as AdminFieldValue} from 'firebase-admin/firestore'; // Admin SDK FieldValue for serverTimestamp
import type { BlogPost, Category, PageData, NavigationMenu, VPSPlan, HomepageContent, ContactInfo } from '@/types';
import { blogCategories } from '@/types';
import { slugify } from '@/lib/utils';

type MockSeedPost = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;

const mockPostsData: MockSeedPost[] = [
  {
    slug: 'getting-started-with-ai',
    title: 'Getting Started with AI in Your Projects',
    date: '2024-07-15T00:00:00.000Z',
    author: 'AI Enthusiast',
    category: 'ai',
    excerpt: 'A beginner-friendly guide to integrating AI into your applications and workflows.',
    content: '<p>Full content about getting started with AI...</p><p>More details here.</p>',
    imageUrl: 'https://source.unsplash.com/600x400/?artificial,intelligence',
    tags: ['ai', 'machine-learning', 'beginners-guide'],
    published: true,
    dataAiHint: 'artificial intelligence',
  },
  {
    slug: 'no-code-revolution',
    title: 'The No-Code Revolution: Building Apps Without Code',
    date: '2024-07-10T00:00:00.000Z',
    author: 'No-Coder Jane',
    category: 'no-code',
    excerpt: 'Explore how no-code platforms are empowering creators to build powerful applications.',
    content: '<p>Detailed exploration of no-code platforms and their impact...</p>',
    imageUrl: 'https://source.unsplash.com/600x400/?visual,programming',
    tags: ['no-code', 'app-development', 'productivity-tools'],
    published: true,
    dataAiHint: 'visual programming',
  },
   {
    slug: 'mastering-modern-vibe-coding',
    title: 'Mastering Modern Vibe Coding Techniques',
    date: '2024-07-05T00:00:00.000Z',
    author: 'Code Master Flex',
    category: 'vibe-coding',
    excerpt: 'Dive into the latest trends and best practices in vibe coding for 2024.',
    content: '<p>Comprehensive guide to modern vibe coding...</p>',
    imageUrl: 'https://source.unsplash.com/600x400/?web,development',
    tags: ['javascript', 'react-framework', 'next-js-guide', 'css-styling'],
    published: true,
    dataAiHint: 'web development',
  },
  {
    slug: 'automation-for-small-business',
    title: 'Streamlining Your Small Business with Automation',
    date: '2024-06-28T00:00:00.000Z',
    author: 'Automation Ally',
    category: 'automation',
    excerpt: 'Discover tools and strategies to automate repetitive tasks and boost efficiency.',
    content: '<p>Practical automation tips for small businesses...</p>',
    imageUrl: 'https://source.unsplash.com/600x400/?business,automation',
    tags: ['automation-software', 'small-business-tips', 'productivity-hacks'],
    published: true,
    dataAiHint: 'business automation',
  },
  {
    slug: 'essential-developer-tools',
    title: 'Top 10 Essential Tools for Developers in 2024',
    date: '2024-06-20T00:00:00.000Z',
    author: 'Tool Time Tim',
    category: 'tools',
    excerpt: 'A curated list of indispensable tools that every developer should know.',
    content: '<p>List and review of top developer tools...</p>',
    imageUrl: 'https://source.unsplash.com/600x400/?coding,tools',
    tags: ['developer-tools', 'software-development-ide', 'version-control-systems'],
    published: true,
    dataAiHint: 'coding tools',
  },
  {
    slug: 'choosing-cloud-hosting',
    title: 'Choosing the Right Cloud Hosting for Your Needs',
    date: '2024-06-15T00:00:00.000Z',
    author: 'Cloudy McCloudface',
    category: 'cloud-hosting',
    excerpt: 'A guide to navigating the options and selecting the best cloud hosting provider.',
    content: '<p>In-depth analysis of cloud hosting options...</p>',
    imageUrl: 'https://source.unsplash.com/600x400/?server,hosting',
    tags: ['cloud-hosting-services', 'vps-hosting', 'infrastructure-as-a-service', 'platform-as-a-service'],
    published: true,
    dataAiHint: 'server hosting',
  },
];

const mockVpsPlans: Omit<VPSPlan, 'id'>[] = [
  {
    name: 'Micro VPS',
    cpu: '1 vCPU',
    ram: '512 MiB',
    storage: '20GB SSD',
    bandwidth: '500GB Bandwidth',
    priceMonthly: 4.00,
    features: ['Basic Support', 'DDoS Protection'],
  },
  {
    name: 'Small VPS',
    cpu: '1 vCPU',
    ram: '1 GiB',
    storage: '30GB SSD',
    bandwidth: '1TB Bandwidth',
    priceMonthly: 6.00,
    features: ['Basic Support', 'DDoS Protection', 'Weekly Backups'],
  },
  {
    name: 'Medium VPS',
    cpu: '1 vCPU',
    ram: '2 GiB',
    storage: '50GB SSD',
    bandwidth: '2TB Bandwidth',
    priceMonthly: 12.00,
    features: ['Standard Support', 'DDoS Protection', 'Daily Backups'],
  },
  {
    name: 'Large VPS',
    cpu: '2 vCPUs',
    ram: '2 GiB',
    storage: '80GB SSD',
    bandwidth: '3TB Bandwidth',
    priceMonthly: 18.00,
    features: ['Standard Support', 'DDoS Protection', 'Daily Backups', 'Free SSL'],
  },
  {
    name: 'XL VPS',
    cpu: '2 vCPUs',
    ram: '4 GiB',
    storage: '120GB SSD',
    bandwidth: '4TB Bandwidth',
    priceMonthly: 24.00,
    features: ['Priority Support', 'DDoS Protection', 'Daily Backups', 'Free SSL', '1 Dedicated IP'],
  },
  {
    name: 'XXL VPS',
    cpu: '4 vCPUs',
    ram: '8 GiB',
    storage: '200GB SSD',
    bandwidth: '8TB Bandwidth',
    priceMonthly: 48.00,
    features: ['Priority Support', 'Advanced DDoS Protection', 'Daily Backups', 'Free SSL', '2 Dedicated IPs'],
  },
  {
    name: 'Ultimate VPS',
    cpu: '8 vCPUs',
    ram: '16 GiB',
    storage: '320GB SSD',
    bandwidth: '15TB Bandwidth',
    priceMonthly: 96.00,
    features: ['Premium Support', 'Advanced DDoS Protection', 'Daily Backups with Replication', 'Free SSL', 'Multiple Dedicated IPs'],
  },
];


const pagesToSeed: { [slug: string]: Omit<PageData, 'id' | 'updatedAt' | 'createdAt'> } = {
  'about': {
    title: "About VHost Solutions",
    metaDescription: "Empowering innovation with reliable and high-performance hosting.",
    contentBlocks: [
      { type: "paragraph", text: "At VHost Solutions, our mission is to provide cutting-edge VPS hosting services that are powerful, reliable, and accessible. We strive to empower developers, entrepreneurs, and businesses of all sizes to achieve their online goals by offering top-tier infrastructure, exceptional customer support, and a commitment to continuous innovation." },
      { type: "paragraph", text: "We believe that great hosting is the foundation of online success, and we are dedicated to building that foundation for our clients with integrity and expertise." },
      { type: "image", url: "https://source.unsplash.com/800x450/?team,office", alt: "VHost Solutions Team", dataAiHint: "team office" },
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

const navigationToSeed: { [id: string]: Omit<NavigationMenu, 'id'> } = {
  'header-nav': {
    items: [
      { href: '/', label: 'Home' },
      { href: '/blog', label: 'Blog' },
      { href: '/order', label: 'Order VPS' },
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
    ]
  },
  'footer-col-1': {
    items: [
      { href: '/about', label: 'About Us' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Contact' },
    ]
  },
  'footer-col-2': {
    items: [
      { href: '/order', label: 'VPS Plans' },
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms-of-service', label: 'Terms of Service' },
    ]
  }
};

const siteContentToSeed: {
  homepage: Omit<HomepageContent, 'id'>,
  contact_info: Omit<ContactInfo, 'id'>
} = {
  homepage: {
    heroTitle: "Power Your Ambitions with VHost Solutions",
    heroSubtitle: "Experience blazing fast, reliable, and scalable VPS hosting tailored for your success. Get started today and unleash your project's full potential.",
    featuresTitle: "Why Choose VHost Solutions?",
    features: [
      { icon: "Zap", title: "Blazing Fast Performance", description: "Our NVMe SSD-powered servers ensure lightning-fast load times and optimal performance for your applications." },
      { icon: "Cpu", title: "Scalable Resources", description: "Easily upgrade your CPU, RAM, and storage as your needs grow. Scale effortlessly with VHost Solutions." },
      { icon: "HardDrive", title: "99.9% Uptime Guarantee", description: "We guarantee high availability for your websites and applications, ensuring they are always accessible." }
    ],
    ctaTitle: "Ready to Elevate Your Hosting?",
    ctaSubtitle: "Join thousands of satisfied customers and experience the VHost Solutions difference."
  },
  contact_info: {
    address: "123 Tech Avenue, Silicon Valley, CA 94000",
    salesEmail: "sales@vhost.solutions",
    supportEmail: "support@vhost.solutions",
    phone: "+1 (555) 123-4567",
    salesHours: "Monday - Friday, 9 AM - 6 PM (PST)",
    supportHours: "24/7 via email and ticketing system"
  }
};


export async function seedDatabase(): Promise<{ status: string; details: string[] }> {
  const adminDb = await getAdminFirestore();
  const postsCollection = adminDb.collection('posts');
  const categoriesCollection = adminDb.collection('categories');
  const pagesCollection = adminDb.collection('pages');
  const navigationCollection = adminDb.collection('navigation');
  const plansCollection = adminDb.collection('vps_plans');
  const siteContentCollection = adminDb.collection('site_content');
  
  const summaryDetails: string[] = [];

  // Seed Site Content
  const homepageDoc = await siteContentCollection.doc('homepage').get();
  if (!homepageDoc.exists) {
    await siteContentCollection.doc('homepage').set(siteContentToSeed.homepage);
    summaryDetails.push('Site Content: Seeded homepage content.');
  } else {
    summaryDetails.push('Site Content: Skipped homepage (already exists).');
  }

  const contactInfoDoc = await siteContentCollection.doc('contact_info').get();
  if (!contactInfoDoc.exists) {
    await siteContentCollection.doc('contact_info').set(siteContentToSeed.contact_info);
    summaryDetails.push('Site Content: Seeded contact info.');
  } else {
     summaryDetails.push('Site Content: Skipped contact info (already exists).');
  }


  // Seed VPS Plans
  const plansQuery = plansCollection.limit(1);
  const plansSnapshot = await plansQuery.get();
  if (!plansSnapshot.empty) {
    summaryDetails.push('VPS Plans: Skipped (already exist).');
  } else {
    const plansBatch = adminDb.batch();
    mockVpsPlans.forEach((planData) => {
      const planRef = plansCollection.doc();
      plansBatch.set(planRef, planData);
    });
    await plansBatch.commit();
    summaryDetails.push(`VPS Plans: Seeded ${mockVpsPlans.length} items.`);
  }

  // Seed Posts
  const postsQuery = postsCollection.limit(1);
  const postsSnapshot = await postsQuery.get();
  if (!postsSnapshot.empty) {
    summaryDetails.push('Posts: Skipped (already exist).');
  } else {
    const postsBatch = adminDb.batch();
    mockPostsData.forEach((postData) => {
      const postRef = postsCollection.doc(); 
      const postToSeed = {
        ...postData,
        createdAt: AdminFieldValue.serverTimestamp(),
        updatedAt: AdminFieldValue.serverTimestamp(),
      };
      postsBatch.set(postRef, postToSeed);
    });
    await postsBatch.commit();
    summaryDetails.push(`Posts: Seeded ${mockPostsData.length} items.`);
  }

  // Seed Categories
  const categoriesQuery = categoriesCollection.limit(1);
  const categoriesSnapshot = await categoriesQuery.get();
  if (!categoriesSnapshot.empty) {
    summaryDetails.push('Categories: Skipped (already exist).');
  } else {
    const categoriesBatch = adminDb.batch();
    const uniqueCategoryNames = new Set(blogCategories);
    uniqueCategoryNames.forEach((categoryName) => {
      const categoryRef = categoriesCollection.doc(); 
      const categoryToSeed: Omit<Category, 'id'> = {
        name: categoryName,
        slug: slugify(categoryName),
      };
      categoriesBatch.set(categoryRef, categoryToSeed);
    });
    await categoriesBatch.commit();
    summaryDetails.push(`Categories: Seeded ${uniqueCategoryNames.size} items.`);
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
    }
  }
  if (pagesSeededCount > 0) {
    await pagesBatch.commit();
    summaryDetails.push(`Pages: Seeded ${pagesSeededCount} new item(s).`);
  } else {
    summaryDetails.push('Pages: Skipped (all exist).');
  }

  // Seed Navigation
  const navBatch = adminDb.batch();
  let navsSeededCount = 0;
  for (const navId in navigationToSeed) {
      const navRef = navigationCollection.doc(navId);
      const doc = await navRef.get();
      if (!doc.exists) {
          navBatch.set(navRef, navigationToSeed[navId]);
          navsSeededCount++;
      }
  }
  if (navsSeededCount > 0) {
      await navBatch.commit();
      summaryDetails.push(`Navigation: Seeded ${navsSeededCount} new menu(s).`);
  } else {
      summaryDetails.push('Navigation: Skipped (all exist).');
  }
  
  return { status: 'Seeding process completed.', details: summaryDetails };
}
