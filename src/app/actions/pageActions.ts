
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/app/actions/adminActions';
import { pageFormSchema, createPageFormSchema, type PageFormValues, type CreatePageFormValues } from '@/lib/schemas';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import type { PageData, ContentBlock } from '@/types';

interface ActionResult {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

export async function createPageAction(
  prevState: ActionResult | undefined,
  formData: CreatePageFormValues
): Promise<ActionResult> {
  const validatedFields = createPageFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }

  const { title, slug } = validatedFields.data;

  try {
    const adminDb = await getAdminFirestore();
    const pageRef = adminDb.collection('pages').doc(slug);
    
    const doc = await pageRef.get();
    if (doc.exists) {
      return { success: false, message: `A page with the slug "${slug}" already exists.` };
    }

    const newPageData: Omit<PageData, 'id'> = {
      title,
      metaDescription: `This is the ${title} page.`,
      contentBlocks: [],
      updatedAt: new Date().toISOString(), // set initial date
    };

    await pageRef.set({
      ...newPageData,
      updatedAt: AdminFieldValue.serverTimestamp(),
      createdAt: AdminFieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/pages');
    revalidatePath(`/${slug}`);

  } catch (error: any) {
    console.error(`Error creating page ${slug}:`, error);
    return { success: false, message: `Failed to create page: ${error.message}` };
  }

  return { success: true, message: `Page "${title}" created successfully.` };
}


export async function updatePageAction(
  pageId: string,
  prevState: ActionResult | undefined,
  formData: PageFormValues
): Promise<ActionResult> {
  if (!pageId) {
    return { success: false, message: 'Page ID is missing. Cannot update page.' };
  }

  const validatedFields = pageFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }

  const { title, metaDescription, contentBlocks } = validatedFields.data;

  const pageUpdateData: Partial<PageData> = {
    title,
    metaDescription,
    contentBlocks: (contentBlocks?.map(({id, ...rest}) => rest) ?? []) as ContentBlock[],
  };

  try {
    const adminDb = await getAdminFirestore();
    const pageRef = adminDb.collection('pages').doc(pageId);

    await pageRef.update({
      ...pageUpdateData,
      updatedAt: AdminFieldValue.serverTimestamp(),
    });

    // Revalidate the public-facing page path. The pageId is the slug.
    revalidatePath(`/${pageId}`);
    revalidatePath('/admin/pages');
    revalidatePath(`/admin/pages/edit/${pageId}`);

  } catch (error: any) {
    console.error(`Error updating page ${pageId}:`, error);
    return { success: false, message: `Failed to update page: ${error.message}` };
  }

  return { success: true, message: `Page "${title}" updated successfully.` };
}
