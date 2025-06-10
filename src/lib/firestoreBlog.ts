
'use server';

import { collection, query, where, getDocs, Timestamp, orderBy, limit, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { BlogPost, Category, NewBlogPost } from '@/types'; // Added NewBlogPost
import type { PostFormValues } from '@/lib/schemas'; // Import PostFormValues

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

export async function getAllPostsForAdmin(): Promise<BlogPost[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(processPostDocument);
  } catch (error) {
    console.error("Error fetching all posts for admin:", error);
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
      // Try fetching non-published post if for admin or specific context
      const qUnpublished = query(postsCollection, where('slug', '==', slug), limit(1));
      const querySnapshotUnpublished = await getDocs(qUnpublished);
      if (querySnapshotUnpublished.empty) {
        return null;
      }
      return processPostDocument(querySnapshotUnpublished.docs[0]);
    }
    return processPostDocument(querySnapshot.docs[0]);
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export async function getPostByIdForEditing(postId: string): Promise<BlogPost | null> {
  const db = getDb();
  try {
    const postRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(postRef);
    if (!docSnap.exists()) {
      console.log(`No post found with ID: ${postId}`);
      return null;
    }
    return processPostDocument(docSnap);
  } catch (error) {
    console.error(`Error fetching post by ID ${postId}:`, error);
    return null;
  }
}


export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(
      postsCollection,
      where('category', '==', categorySlug), // Assuming category is stored as a direct string/slug
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
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Category));
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('published', '==', true)); // Only slugs of published posts for sitemap/SSG
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => docSnap.data().slug as string);
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

  return {
    id: docSnapshot.id,
    ...postData,
    category: categoryName, // This is already a slug
    date: postData.date instanceof Timestamp ? postData.date.toDate() : new Date(postData.date),
    createdAt: postData.createdAt instanceof Timestamp ? postData.createdAt.toDate() : new Date(postData.createdAt),
    updatedAt: postData.updatedAt instanceof Timestamp ? postData.updatedAt.toDate() : new Date(postData.updatedAt),
  } as BlogPost;
};

// Function to add a new blog post
export async function addBlogPost(postData: NewBlogPost): Promise<string | null> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    const docRef = await addDoc(postsCollection, postData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding new blog post:", error);
    return null;
  }
}

// Function to update an existing blog post
export async function updateBlogPost(postId: string, postData: Partial<BlogPost>): Promise<boolean> {
  const db = getDb();
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...postData,
      updatedAt: serverTimestamp(), // Use serverTimestamp for updatedAt
    });
    return true;
  } catch (error) {
    console.error(`Error updating blog post ${postId}:`, error);
    return false;
  }
}
