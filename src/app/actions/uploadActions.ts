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
  
  const webhookUrl = process.env.WORDPRESS_API_URL;
  if (!webhookUrl) {
    const errorMessage = 'Image upload service is not configured. Please set WORDPRESS_API_URL in your .env file.';
    console.error(`[uploadPageImageAction] ${errorMessage}`);
    return { 
        success: false, 
        message: errorMessage
    };
  }

  try {
    const pageTitleSlug = slugify(pageTitle) || 'untitled-page-image';
    const timestamp = Date.now();
    const filename = `${pageTitleSlug}-${timestamp}.png`;

    // Convert Data URI to a Buffer, which is necessary for creating a Blob on the server.
    const base64Data = imageDataUri.split(',')[1];
    if (!base64Data) {
        throw new Error('Invalid data URI format: could not extract base64 data.');
    }
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const formData = new FormData();
    // The first argument 'file' is the field name. Your n8n webhook must be set up
    // to look for binary data on a field named 'file'.
    formData.append('file', new Blob([imageBuffer]), filename);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      // Do NOT manually set the 'Content-Type' header. 
      // The 'fetch' API automatically sets it to 'multipart/form-data' with the correct boundary when using FormData.
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
    return { 
      success: false, 
      message: error.message || 'An unknown error occurred during upload.' 
    };
  }
}
