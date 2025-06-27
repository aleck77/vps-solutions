
'use server';

import { collection, query, where, getDocs, Timestamp, orderBy, limit, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore'; 
import { getDb } from '@/lib/firebase'; // Client SDK Firestore instance for reads
import { getAdminFirestore } from '@/app/actions/adminActions'; // Admin SDK Firestore instance for writes
import type { BlogPost, Category, NewBlogPost, PageData, NavigationMenu, VPSPlan, HomepageContent, ContactInfo, FooterContent, GeneralSettings } from '@/types';
import { slugify } from '@/lib/utils';
import {FieldValue as AdminFieldValue} from 'firebase-admin/firestore'; // Admin SDK FieldValue for serverTimestamp

// Helper to convert Firestore document to a plain, serializable object
const toSerializable = <T extends { id?: string }>(documentSnapshot: any): T => {
  const data = documentSnapshot.data();
  const id = documentSnapshot.id;
  const serializableData: { [key: string]: any } = { id, ...data };

  // Convert all Timestamp fields to ISO strings
  for (const key in serializableData) {
    const value = serializableData[key];
    if (value && typeof value.toDate === 'function') {
      serializableData[key] = value.toDate().toISOString();
    }
  }
  return serializableData as T;
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
    return querySnapshot.docs.map(doc => toSerializable<BlogPost>(doc));
  } catch (error) {
    console.error("Error fetching all published posts:", error);
    return [];
  }
}

export async function getAllPostsForAdmin(): Promise<BlogPost[]> {
  const adminDb = await getAdminFirestore(); // Use Admin SDK to bypass client-side rules
  try {
    const postsCollection = adminDb.collection('posts');
    const q = postsCollection.orderBy('date', 'desc');
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => toSerializable<BlogPost>(doc));
  } catch (error) {
    console.error("Error fetching all posts for admin with Admin SDK:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  console.log(`[firestoreBlog/getPostBySlug] Received slug: ${slug}`);
  const db = getDb(); // Use client SDK for public reads
  try {
    const postsCollection = collection(db, 'posts');
    const qPublished = query(postsCollection, where('slug', '==', slug), where('published', '==', true), limit(1));
    const querySnapshotPublished = await getDocs(qPublished);
    if (!querySnapshotPublished.empty) {
      return toSerializable<BlogPost>(querySnapshotPublished.docs[0]);
    }

    const qAny = query(postsCollection, where('slug', '==', slug), limit(1));
    const querySnapshotAny = await getDocs(qAny);
    if (querySnapshotAny.empty) {
      console.log(`[firestoreBlog/getPostBySlug] No post found with slug: ${slug}`);
      return null;
    }
    console.log(`[firestoreBlog/getPostBySlug] Found a post (possibly not published) with slug: ${slug}`);
    return toSerializable<BlogPost>(querySnapshotAny.docs[0]);
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
    return toSerializable<BlogPost>(docSnap);
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
    return querySnapshot.docs.map(doc => toSerializable<BlogPost>(doc));
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
    return querySnapshot.docs.map(doc => toSerializable<BlogPost>(doc));
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
    return querySnapshot.docs.map(docSnap => (toSerializable<Category>(docSnap)));
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
    return toSerializable<Category>(categoryDoc);
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
    const posts = querySnapshot.docs.map(doc => toSerializable<BlogPost>(doc));

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
      oldPostForRevalidation = toSerializable<BlogPost>(oldDocSnap);
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

// --- Page Content Functions ---
export async function getPageBySlug(slug: string): Promise<PageData | null> {
  const db = getDb();
  try {
    const pageRef = doc(db, 'pages', slug);
    const docSnap = await getDoc(pageRef);
    if (docSnap.exists()) {
      return toSerializable<PageData>(docSnap);
    } else {
      console.log(`[getPageBySlug] No page document found with slug: ${slug}`);
      return null;
    }
  } catch (error) {
    console.error(`[getPageBySlug] Error fetching page by slug ${slug}:`, error);
    return null;
  }
}

export async function getAllPagesForAdmin(): Promise<PageData[]> {
    const db = getDb();
    try {
        const pagesCollection = collection(db, 'pages');
        const q = query(pagesCollection, orderBy('title', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => toSerializable<PageData>(docSnap));
    } catch (error) {
        console.error("Error fetching all pages for admin:", error);
        return [];
    }
}

// --- Navigation Functions ---
export async function getNavigationMenu(name: string): Promise<NavigationMenu | null> {
  const db = getDb();
  try {
    const navRef = doc(db, 'navigation', name);
    const docSnap = await getDoc(navRef);
    if (docSnap.exists()) {
      return toSerializable<NavigationMenu>(docSnap);
    }
    console.warn(`[getNavigationMenu] No navigation menu found with name: ${name}`);
    return null;
  } catch (error) {
    console.error(`[getNavigationMenu] Error fetching navigation menu "${name}":`, error);
    return null;
  }
}

// --- VPS Plan Functions ---
export async function getVpsPlans(): Promise<VPSPlan[]> {
  const db = getDb();
  try {
    const plansCollection = collection(db, 'vps_plans');
    const q = query(plansCollection, orderBy('priceMonthly', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toSerializable<VPSPlan>(doc));
  } catch (error) {
    console.error("Error fetching VPS plans:", error);
    return [];
  }
}

export async function getVpsPlanById(planId: string): Promise<VPSPlan | null> {
  const db = getDb();
  try {
    const planRef = doc(db, 'vps_plans', planId);
    const docSnap = await getDoc(planRef);
    if (!docSnap.exists()) {
      console.log(`No VPS plan found with ID: ${planId}`);
      return null;
    }
    return toSerializable<VPSPlan>(docSnap);
  } catch (error) {
    console.error(`Error fetching VPS plan by ID ${planId}:`, error);
    return null;
  }
}

// --- Site Content Functions ---

export async function getHomepageContent(): Promise<HomepageContent | null> {
    const db = getDb();
    try {
        const docRef = doc(db, 'site_content', 'homepage');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return toSerializable<HomepageContent>(docSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching homepage content:", error);
        return null;
    }
}

export async function getContactInfo(): Promise<ContactInfo | null> {
    const db = getDb();
    try {
        const docRef = doc(db, 'site_content', 'contact_info');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return toSerializable<ContactInfo>(docSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching contact info:", error);
        return null;
    }
}

export async function getFooterContent(): Promise<FooterContent | null> {
    const db = getDb();
    try {
        const docRef = doc(db, 'site_content', 'footer');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return toSerializable<FooterContent>(docSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching footer content:", error);
        return null;
    }
}

export async function getGeneralSettings(): Promise<GeneralSettings | null> {
    const db = getDb();
    try {
        const docRef = doc(db, 'site_content', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return toSerializable<GeneralSettings>(docSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching general settings:", error);
        return null;
    }
}
