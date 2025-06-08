
'use server';

import { collection, query, where, getDocs, Timestamp, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { BlogPost, Category } from '@/types';
import {นั่งสมาธิ } from '@/lib/utils'; // Assuming slugify is here

// Helper to convert Firestore Timestamps to JS Date objects or ISO strings in the post objects
const processPostDocument = (documentSnapshot: any): BlogPost => {
  const data = documentSnapshot.data();
  return {
    ...data,
    id: documentSnapshot.id,
    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date), // Ensure date is a Date object
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  } as BlogPost; // Type assertion might be needed if date types are tricky
};


export async function getAllPublishedPosts(count?: number): Promise<BlogPost[]> {
  try {
    const postsCollection = collection(firestore, 'posts');
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
  try {
    const postsCollection = collection(firestore, 'posts');
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
  try {
    const postsCollection = collection(firestore, 'posts');
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
  try {
    const categoriesCollection = collection(firestore, 'categories');
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
}


// You might also need a function to get posts for sitemap or static generation
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const postsCollection = collection(firestore, 'posts');
    const q = query(postsCollection, where('published', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().slug as string);
  } catch (error) {
    console.error("Error fetching all post slugs:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const categoriesRef = collection(firestore, 'categories');
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

// If you had mockPosts for RecommendedPosts, you'll need a Firestore equivalent
export async function getRecommendedPosts(currentPostId: string | null, count: number = 3): Promise<BlogPost[]> {
  try {
    const postsCollection = collection(firestore, 'posts');
    let q;

    if (currentPostId) {
       // Fetch posts other than the current one, ordered by date.
       // Firestore doesn't support a direct "not equal" query combined with orderBy on a different field easily in all scenarios.
       // A common workaround is to fetch more and filter, or to add a "random" field for more diverse recommendations.
       // For simplicity, we'll just fetch recent posts and exclude the current one in code.
       // This is not ideal for true "recommendations" but works for "other/recent posts".
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

// Helper for converting Firestore Timestamps and getting category details for BlogPost objects
export const processPostDocWithCategory = async (docSnapshot: any): Promise<BlogPost> => {
  const postData = docSnapshot.data();
  let categoryName = postData.category; // Assume it's a slug

  if (postData.category) {
    const categoryDoc = await getDoc(doc(firestore, "categories", postData.category)); // Assuming category field stores category ID
    if (categoryDoc.exists()) {
      categoryName = categoryDoc.data()?.name || postData.category;
    }
  }

  return {
    id: docSnapshot.id,
    ...postData,
    category: categoryName, // Now it's the name or original slug if lookup failed
    date: postData.date instanceof Timestamp ? postData.date.toDate() : new Date(postData.date),
    createdAt: postData.createdAt instanceof Timestamp ? postData.createdAt.toDate() : new Date(postData.createdAt),
    updatedAt: postData.updatedAt instanceof Timestamp ? postData.updatedAt.toDate() : new Date(postData.updatedAt),
  } as BlogPost;
};
