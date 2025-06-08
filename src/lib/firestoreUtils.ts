
'use server';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { firestore } from '@/lib/firebase'; // Ensure your firebase init is correct

export async function testFirestoreConnection(): Promise<{ success: boolean; message: string; count?: number }> {
  console.log('Attempting to test Firestore connection...');
  try {
    const postsCollection = collection(firestore, 'posts');
    // Try to fetch a very small number of documents (e.g., 1 or even 0 if using count (not directly available in client SDK like this))
    // A simple query to check if the collection can be accessed.
    const q = query(postsCollection, limit(1));
    const snapshot = await getDocs(q);
    console.log(`Firestore connection test successful. Found ${snapshot.size} documents in 'posts' (checked limit 1).`);
    return { success: true, message: 'Successfully connected to Firestore.', count: snapshot.size };
  } catch (error: any) {
    console.error('Firestore connection test failed:', error);
    return { success: false, message: `Failed to connect to Firestore: ${error.message}` };
  }
}
