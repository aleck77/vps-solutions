'use server';

import { z } from 'zod';
import { slugify } from '@/lib/utils';

const uploadSchema = z.object({
  imageDataUri: z.string().startsWith('data:image/', { message: 'Invalid image data URI' }),
  pageTitle: z.string().min(1, { message: 'Page title is required for filename generation.' }),
});

interface UploadResult {
  success: boolean;
  message: string;
  imageUrl?: string;
}

export async function uploadPageImageAction(imageDataUri: string, pageTitle: string): Promise<UploadResult> {
  const validatedFields = uploadSchema.safeParse({
    imageDataUri,
    pageTitle,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.errors.map(e => e.message).join(', '),
    };
  }

  const pageTitleSlug = slugify(pageTitle) || 'untitled-page-image';
  const timestamp = Date.now();
  const filename = `${pageTitleSlug}-${timestamp}.png`;
  
  const webhookUrl = 'https://n8n.artelegis.com.ua/webhook/wp';
  const payload = {
      imageDataUri,
      postTitle: pageTitle, // n8n workflow might be expecting 'postTitle'
      filename,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(`Upload failed: Server responded with status ${response.status}. Response: ${responseText.substring(0, 500)}`);
    }

    const result = JSON.parse(responseText);

    if (result.success && result.imageUrl) {
      return {
        success: true,
        message: 'Image uploaded successfully!',
        imageUrl: result.imageUrl,
      };
    } else {
      throw new Error(result.error || result.message || 'Upload failed: The server reported an error.');
    }
  } catch (error: any) {
    console.error('[uploadPageImageAction] Error:', error);
    return { success: false, message: error.message || 'An unknown error occurred during upload.' };
  }
}
