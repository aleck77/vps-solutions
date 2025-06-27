'use server';

import { z } from 'zod';
import { slugify } from '@/lib/utils';

// This schema validates the data URI and title coming into our server action.
const uploadSchema = z.object({
  imageDataUri: z.string().startsWith('data:image/', { message: 'Invalid image data URI' }),
  pageTitle: z.string().min(1, { message: 'Page title is required for filename generation.' }),
});

interface UploadResult {
  success: boolean;
  message: string;
  imageUrl?: string;
}

export async function uploadPageImageAction(
  imageDataUri: string,
  pageTitle: string
): Promise<UploadResult> {
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

  // This uses the environment variable for your n8n webhook URL.
  const webhookUrl = process.env.WORDPRESS_API_URL;
  if (!webhookUrl) {
    const errorMessage =
      'Image upload service is not configured. Please set WORDPRESS_API_URL in your .env file.';
    console.error(`[uploadPageImageAction] ${errorMessage}`);
    return {
      success: false,
      message: errorMessage,
    };
  }

  try {
    const pageTitleSlug = slugify(pageTitle) || 'untitled-page-image';
    const timestamp = Date.now();
    const filename = `${pageTitleSlug}-${timestamp}.png`;

    // Construct the JSON payload exactly as your n8n webhook expects it.
    const payload = {
      imageDataUri: validatedFields.data.imageDataUri,
      postTitle: validatedFields.data.pageTitle,
      filename: filename
    };

    console.log(`[uploadPageImageAction] Sending JSON payload to webhook: ${webhookUrl}`);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    if (!response.ok) {
        console.error(`[uploadPageImageAction] Webhook response error. Status: ${response.status}. Body: ${responseText}`);
        throw new Error(`Upload failed: Server responded with status ${response.status}. Response: ${responseText.substring(0, 500)}`);
    }

    const result = JSON.parse(responseText);

    if (result.success && result.imageUrl) {
      console.log(`[uploadPageImageAction] Webhook returned success. Image URL: ${result.imageUrl}`);
      return {
        success: true,
        message: 'Image uploaded successfully!',
        imageUrl: result.imageUrl,
      };
    } else {
      console.error(`[uploadPageImageAction] Webhook returned failure. Response:`, result);
      throw new Error(result.error || result.message || 'Upload failed: The server reported an error.');
    }
  } catch (error: any) {
    console.error('[uploadPageImageAction] An error occurred:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred during upload.',
    };
  }
}
