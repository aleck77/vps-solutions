
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/app/actions/adminActions';
import { homepageContentSchema, contactInfoSchema } from '@/lib/schemas';
import type { HomepageContentValues, ContactInfoValues } from '@/lib/schemas';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';

interface ActionResult {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

export async function updateHomepageContentAction(
  prevState: ActionResult | undefined,
  formData: HomepageContentValues
): Promise<ActionResult> {
  const validatedFields = homepageContentSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }
  
  try {
    const adminDb = await getAdminFirestore();
    const docRef = adminDb.collection('site_content').doc('homepage');
    await docRef.set({
      ...validatedFields.data,
      updatedAt: AdminFieldValue.serverTimestamp(),
    }, { merge: true });

    revalidatePath('/'); // Revalidate homepage

    return { success: true, message: 'Homepage content updated successfully.' };

  } catch (error: any) {
    console.error('Error updating homepage content:', error);
    return { success: false, message: `Failed to update content: ${error.message}` };
  }
}

export async function updateContactInfoAction(
  prevState: ActionResult | undefined,
  formData: ContactInfoValues
): Promise<ActionResult> {
  const validatedFields = contactInfoSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }
  
  try {
    const adminDb = await getAdminFirestore();
    const docRef = adminDb.collection('site_content').doc('contact_info');
    await docRef.set({
      ...validatedFields.data,
      updatedAt: AdminFieldValue.serverTimestamp(),
    }, { merge: true });

    revalidatePath('/contact'); // Revalidate contact page

    return { success: true, message: 'Contact information updated successfully.' };

  } catch (error: any) {
    console.error('Error updating contact information:', error);
    return { success: false, message: `Failed to update info: ${error.message}` };
  }
}
