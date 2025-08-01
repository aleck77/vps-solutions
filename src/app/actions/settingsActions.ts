
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/app/actions/adminActions';
import { homepageContentSchema, contactInfoSchema, footerContentSchema, generalSettingsSchema } from '@/lib/schemas';
import type { HomepageContentValues, ContactInfoValues, FooterContentValues, GeneralSettingsValues } from '@/lib/schemas';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';

interface ActionResult {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

// Helper to remove temporary 'id' fields from nested objects before saving to Firestore
function stripTemporaryIds(blocks: any[]): any[] {
    return blocks.map(block => {
        const { id, ...restOfBlock } = block;
        if (restOfBlock.features && Array.isArray(restOfBlock.features)) {
            restOfBlock.features = restOfBlock.features.map((feature: any) => {
                const { id, ...restOfFeature } = feature;
                return restOfFeature;
            });
        }
        return restOfBlock;
    });
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
    
    // Remove temporary IDs before saving
    const sanitizedBlocks = stripTemporaryIds(validatedFields.data.contentBlocks);

    await docRef.set({
      contentBlocks: sanitizedBlocks,
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


export async function updateFooterContentAction(
  prevState: ActionResult | undefined,
  formData: FooterContentValues
): Promise<ActionResult> {
  const validatedFields = footerContentSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }
  
  try {
    const adminDb = await getAdminFirestore();
    const docRef = adminDb.collection('site_content').doc('footer');

    // Create a sanitized version of the data to save, removing temporary IDs
    const sanitizedData = {
      ...validatedFields.data,
      contentBlocks: stripTemporaryIds(validatedFields.data.contentBlocks),
      socialLinks: stripTemporaryIds(validatedFields.data.socialLinks || []),
    };

    await docRef.set({
      ...sanitizedData,
      updatedAt: AdminFieldValue.serverTimestamp(),
    }, { merge: true });

    revalidatePath('/', 'layout'); // Revalidate the whole layout to update footer everywhere

    return { success: true, message: 'Footer content updated successfully.' };

  } catch (error: any) {
    console.error('Error updating footer content:', error);
    return { success: false, message: `Failed to update footer: ${error.message}` };
  }
}

export async function updateGeneralSettingsAction(
  prevState: ActionResult | undefined,
  formData: GeneralSettingsValues
): Promise<ActionResult> {
  const validatedFields = generalSettingsSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }
  
  try {
    const adminDb = await getAdminFirestore();
    const docRef = adminDb.collection('site_content').doc('general');
    await docRef.set({
      ...validatedFields.data,
      updatedAt: AdminFieldValue.serverTimestamp(),
    }, { merge: true });

    revalidatePath('/', 'layout'); // Revalidate the whole layout to update header everywhere

    return { success: true, message: 'General settings updated successfully.' };

  } catch (error: any) {
    console.error('Error updating general settings:', error);
    return { success: false, message: `Failed to update settings: ${error.message}` };
  }
}
