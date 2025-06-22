
'use server';

import { collection, query, where, getDocs, Timestamp, orderBy, limit, doc, getDoc, addDoc, updateDoc, serverTimestamp as clientServerTimestamp } from 'firebase/firestore'; // Renamed client's serverTimestamp
import { getDb } from '@/lib/firebase'; // Client SDK Firestore instance for reads
import { getAdminFirestore } from '@/app/actions/adminActions'; // Admin SDK Firestore instance for writes
import type { BlogPost, Category, NewBlogPost } from '@/types';
// import type { PostFormValues } from '@/lib/schemas'; // Not used directly in this file
import { slugify } from '@/lib/utils';
import {FieldValue as AdminFieldValue} from 'firebase-admin/firestore'; // Admin SDK FieldValue for serverTimestamp

// Helper to convert Firestore Timestamps to JS Date objects or ISO strings in the post objects
const processPostDocument = (documentSnapshot: any): BlogPost => {
  const data = documentSnapshot.data();
  return {
    ...data,
    id: documentSnapshot.id,
    date: data.date instanceof Timestamp ? data.date.toDate() : (data.date?._seconds ? new Timestamp(data.date._seconds, data.date._nanoseconds).toDate() : new Date(data.date)),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt?._seconds ? new Timestamp(data.createdAt._seconds, data.createdAt._nanoseconds).toDate() : new Date(data.createdAt)),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt?._seconds ? new Timestamp(data.updatedAt._seconds, data.updatedAt._nanoseconds).toDate() : new Date(data.updatedAt)),
    tags: data.tags || [],
  } as BlogPost;
};


export async function getAllPublishedPosts(count?: number): Promise<BlogPost[]> {
  const db = getDb(); // Use client SDK for public reads
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
  const db = getDb(); // Use client SDK, admin page might have specific auth checks on client
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

// Reverted to accept a simple string slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  console.log(`[firestoreBlog/getPostBySlug] Received slug: ${slug}`);
  const db = getDb(); // Use client SDK for public reads
  try {
    const postsCollection = collection(db, 'posts');
    const qPublished = query(postsCollection, where('slug', '==', slug), where('published', '==', true), limit(1));
    const querySnapshotPublished = await getDocs(qPublished);
    if (!querySnapshotPublished.empty) {
      return processPostDocument(querySnapshotPublished.docs[0]);
    }

    const qAny = query(postsCollection, where('slug', '==', slug), limit(1));
    const querySnapshotAny = await getDocs(qAny);
    if (querySnapshotAny.empty) {
      console.log(`[firestoreBlog/getPostBySlug] No post found with slug: ${slug}`);
      return null;
    }
    console.log(`[firestoreBlog/getPostBySlug] Found a post (possibly not published) with slug: ${slug}`);
    return processPostDocument(querySnapshotAny.docs[0]);
  } catch (error) {
    console.error(`[firestoreBlog/getPostBySlug] Error fetching post by slug ${slug}:`, error);
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

export async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(
      postsCollection,
      where('tags', 'array-contains', tagSlug),
      where('published', '==', true),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(processPostDocument);
  } catch (error) {
    console.error(`Error fetching posts by tag ${tagSlug}:`, error);
    return [];
  }
}

export async function getAllUniqueTagSlugs(): Promise<string[]> {
  const db = getDb();
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('published', '==', true));
    const querySnapshot = await getDocs(q);
    const allTags = new Set<string>();
    querySnapshot.docs.forEach(docSnap => {
      const post = docSnap.data() as BlogPost;
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  } catch (error) {
    console.error("Error fetching all unique tag slugs:", error);
    return [];
  }
}


export async function getAllCategories(): Promise<Category[]> {
  const db = getDb();
  try {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      name: docSnap.data().name,
      slug: docSnap.data().slug || slugify(docSnap.data().name),
    } as Category));
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

export async function addBlogPost(postData: NewBlogPost): Promise<string | null> {
  const adminDb = await getAdminFirestore();
  try {
    const postsCollection = adminDb.collection('posts');
    const docRef = await postsCollection.add({
      ...postData,
      date: postData.date instanceof Timestamp ? postData.date.toDate() : postData.date,
      createdAt: postData.createdAt instanceof Timestamp ? postData.createdAt.toDate() : postData.createdAt,
      updatedAt: postData.updatedAt instanceof Timestamp ? postData.updatedAt.toDate() : postData.updatedAt,
      tags: postData.tags || []
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding new blog post with Admin SDK:", error);
    return null;
  }
}

export async function updateBlogPost(
  postId: string,
  postData: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'date'>>
): Promise<{ success: boolean; oldPost?: BlogPost | null }> {
  const adminDb = await getAdminFirestore();
  const clientDb = getDb();

  const postRefAdmin = adminDb.collection('posts').doc(postId);
  const postRefClient = doc(clientDb, 'posts', postId);

  let oldPostForRevalidation: BlogPost | null = null;

  try {
    const oldDocSnap = await getDoc(postRefClient);
    if (oldDocSnap.exists()) {
      oldPostForRevalidation = processPostDocument(oldDocSnap);
    }

    await postRefAdmin.update({
      ...postData,
      tags: postData.tags || [],
      updatedAt: AdminFieldValue.serverTimestamp(),
    });

    return { success: true, oldPost: oldPostForRevalidation };
  } catch (error: any) {
    console.error(`Error updating blog post ${postId} with Admin SDK:`, error);
    return { success: false, oldPost: null };
  }
}
