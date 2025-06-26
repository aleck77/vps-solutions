
'use server';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { getDb } from '@/lib/firebase'; // Import getDb

export async function testFirestoreConnection(): Promise<{ success: boolean; message: string; count?: number }> {
  console.log('Attempting to test Firestore connection...');
  try {
    const db = getDb(); // Get Firestore instance by calling getDb()
    const postsCollection = collection(db, 'posts');
    // FIX: Added where('published', '==', true) to comply with Firestore security rules
    const q = query(postsCollection, where('published', '==', true), limit(1));
    const snapshot = await getDocs(q);
    console.log(`Firestore connection test successful. Found ${snapshot.size} documents in 'posts' (checked limit 1).`);
    return { success: true, message: 'Successfully connected to Firestore.', count: snapshot.size };
  } catch (error: any) {
    console.error('Firestore connection test failed:', error);
    return { success: false, message: `Failed to connect to Firestore: ${error.message}` };
  }
}
