
'use server';

import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Subscriber } from '@/types';
import { z } from 'zod';

const emailSchema = z.string().email({ message: "Invalid email address." });

export async function subscribeToNewsletter(prevState: any, formData: FormData): Promise<{ message: string; error?: boolean }> {
  const email = formData.get('email') as string;

  const validation = emailSchema.safeParse(email);
  if (!validation.success) {
    return { message: validation.error.errors[0].message, error: true };
  }

  const validatedEmail = validation.data;

  try {
    const subscribersCollection = collection(firestore, 'subscribers');
    
    // Check if email already exists
    const q = query(subscribersCollection, where("email", "==", validatedEmail));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { message: 'This email is already subscribed.', error: true };
    }

    const newSubscriber: Omit<Subscriber, 'id'> = {
      email: validatedEmail,
      subscribedAt: Timestamp.now(),
    };
    await addDoc(subscribersCollection, newSubscriber);
    return { message: 'Successfully subscribed! Thank you.' };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { message: 'Failed to subscribe. Please try again later.', error: true };
  }
}
