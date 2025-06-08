
'use server';

import { collection, query, where, getDocs, Timestamp, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase'; // Import getDb
import type { BlogPost, Category } from '@/types';
// import { slugify } from '@/lib/utils'; // slugify is in seed.ts for now, ensure utils if used here

// Helper to convert Firestore Timestamps to JS Date objects or ISO strings in the post objects
const processPostDocument = (documentSnapshot: any): BlogPost => {
  const data = documentSnapshot.data();
  return {
    ...data,
    id: documentSnapshot.id,
    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date), 
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  } as BlogPost; 
};


export async function getAllPublishedPosts(count?: number): Promise<BlogPost[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    let q = query(postsCollection, where('published', '==', true), orderBy('date', 'desc'));
    if (count) {
      q = query(postsCollection, where('published', '==', true), orderBy('date', 'desc'), limit(count));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(processPostDocument);
  } catch (error) {
    console.error("Error fetching all published posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('slug', '==', slug), where('published', '==', true), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    return processPostDocument(querySnapshot.docs[0]);
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    // Firestore slugs are usually lowercase. Ensure comparison is consistent.
    // If categorySlug in DB is 'AI' but param is 'ai', this might fail.
    // For now, assuming exact match or that slugs are consistently cased.
    const q = query(
      postsCollection,
      where('category', '==', categorySlug), 
      where('published', '==', true),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(processPostDocument);
  } catch (error) {
    console.error(`Error fetching posts by category ${categorySlug}:`, error);
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const db = getDb();
  try {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('published', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().slug as string);
  } catch (error) {
    console.error("Error fetching all post slugs:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = getDb();
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log(`No category found with slug: ${slug}`);
      return null;
    }
    const categoryDoc = querySnapshot.docs[0];
    return { id: categoryDoc.id, ...categoryDoc.data() } as Category;
  } catch (error) {
    console.error(`Error fetching category by slug ${slug}:`, error);
    return null;
  }
}

export async function getRecommendedPosts(currentPostId: string | null, count: number = 3): Promise<BlogPost[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    let q;

    if (currentPostId) {
      q = query(postsCollection, where('published', '==', true), orderBy('date', 'desc'), limit(count + 1));
    } else {
      q = query(postsCollection, where('published', '==', true), orderBy('date', 'desc'), limit(count));
    }
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(processPostDocument);
    
    if (currentPostId) {
      return posts.filter(post => post.id !== currentPostId).slice(0, count);
    }
    return posts.slice(0, count);

  } catch (error) {
    console.error("Error fetching recommended posts:", error);
    return [];
  }
}

export const processPostDocWithCategory = async (docSnapshot: any): Promise<BlogPost> => {
  const db = getDb();
  const postData = docSnapshot.data();
  let categoryName = postData.category; 

  if (postData.category) {
    // Assuming postData.category stores the category ID or SLUG that matches the category document ID or SLUG
    // If it's an ID: const categoryRef = doc(db, "categories", postData.category);
    // If it's a slug, we need to query by slug. For simplicity, let's assume it's a name/slug stored directly for now
    // Or better, the category field on a post should be a reference or a slug that we can use to look up
    // For this function, it seems it's trying to fetch category details, but `postData.category` is already a string (name/slug)
    // So, the lookup might be redundant if the category name is already what we want.
    // Let's assume 'category' field in postData is the slug. We'd need getCategoryBySlug if we want the full Category object.
    // For now, this function just processes dates and returns the category string as is.
    // If a full category object is needed, this function needs to be async and call getCategoryBySlug.
    // The original function assumed category was an ID:
    // const categoryDoc = await getDoc(doc(db, "categories", postData.category));
    // if (categoryDoc.exists()) {
    //   categoryName = categoryDoc.data()?.name || postData.category;
    // }
    // Let's keep it simple: category is already the slug string.
  }

  return {
    id: docSnapshot.id,
    ...postData,
    category: categoryName, 
    date: postData.date instanceof Timestamp ? postData.date.toDate() : new Date(postData.date),
    createdAt: postData.createdAt instanceof Timestamp ? postData.createdAt.toDate() : new Date(postData.createdAt),
    updatedAt: postData.updatedAt instanceof Timestamp ? postData.updatedAt.toDate() : new Date(postData.updatedAt),
  } as BlogPost;
};
