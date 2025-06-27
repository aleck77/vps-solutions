'use server';

import { z } from 'zod';
import { slugify } from '@/lib/utils';
import { Buffer } from 'buffer';

const uploadSchema = z.object({
  imageDataUri: z.string().startsWith('data:image/', { message: 'Invalid image data URI' }),
  targetFilename: z.string().min(1, { message: 'Filename is required.' }),
  pathPrefix: z.string().optional(), // Kept for compatibility, but ignored
});

interface UploadResult {
  success: boolean;
  message: string;
  imageUrl?: string;
}

export async function uploadImageAction(
  imageDataUri: string,
  targetFilename: string,
  pathPrefix?: string // Kept for compatibility, but ignored
): Promise<UploadResult> {
  const validatedFields = uploadSchema.safeParse({ imageDataUri, targetFilename, pathPrefix });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.errors.map(e => e.message).join(', '),
    };
  }
  
  const { WORDPRESS_API_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD } = process.env;

  if (!WORDPRESS_API_URL || !WORDPRESS_USERNAME || !WORDPRESS_APP_PASSWORD) {
    const errorMessage = "Image upload service is not configured. Please set WORDPRESS_API_URL, WORDPRESS_USERNAME, and WORDPRESS_APP_PASSWORD in your .env file.";
    console.error(`[uploadImageAction] ${errorMessage}`);
    return {
      success: false,
      message: errorMessage,
    };
  }

  try {
    const { imageDataUri, targetFilename } = validatedFields.data;

    // 1. Extract data and mime type from Data URI
    const matches = imageDataUri.match(/^data:(.+);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid data URI format.");
    }
    const mimeType = matches[1];
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // 2. Prepare for upload
    const fileExtension = mimeType.split('/')[1] || 'jpg';
    const finalFilename = `${slugify(targetFilename)}.${fileExtension}`;
    
    // FIX: Use WORDPRESS_API_URL directly as the endpoint, without appending anything.
    const wpApiEndpoint = WORDPRESS_API_URL;

    // 3. Prepare headers
    const credentials = Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_APP_PASSWORD}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${finalFilename}"`,
    };

    // 4. Make the request to the webhook/API
    const response = await fetch(wpApiEndpoint, {
      method: 'POST',
      headers: headers,
      body: imageBuffer,
      cache: 'no-store'
    });

    const responseBody = await response.json();

    if (!response.ok) {
      console.error('Webhook/API Error Response:', responseBody);
      throw new Error(responseBody.message || `Webhook responded with status ${response.status}`);
    }

    if (!responseBody.source_url) {
      console.error('Webhook/API Success Response without URL:', responseBody);
      throw new Error("The API returned a success response but did not provide an image URL.");
    }
    
    console.log(`[uploadImageAction] Image uploaded successfully via webhook. Public URL: ${responseBody.source_url}`);
    
    return {
      success: true,
      message: 'Image uploaded successfully!',
      imageUrl: responseBody.source_url,
    };

  } catch (error: any) {
    console.error('[uploadImageAction] Webhook Upload Action Error:', error);
    return { success: false, message: error.message || 'An unknown error occurred during upload to the webhook.' };
  }
}
