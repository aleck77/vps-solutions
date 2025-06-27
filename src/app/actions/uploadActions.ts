
'use server';

import { z } from 'zod';
import { getAdminStorage } from '@/app/actions/adminActions';
import { slugify } from '@/lib/utils';

const uploadSchema = z.object({
  imageDataUri: z.string().startsWith('data:image/', { message: 'Invalid image data URI' }),
  targetFilename: z.string().min(1, { message: 'Filename is required.' }),
  pathPrefix: z.string().optional(),
});

interface UploadResult {
  success: boolean;
  message: string;
  imageUrl?: string;
}

export async function uploadImageAction(
  imageDataUri: string,
  targetFilename: string,
  pathPrefix: string = 'uploads/'
): Promise<UploadResult> {
  const validatedFields = uploadSchema.safeParse({ imageDataUri, targetFilename, pathPrefix });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.errors.map(e => e.message).join(', '),
    };
  }

  try {
    const storage = await getAdminStorage();
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        throw new Error("Firebase Storage bucket name is not configured in environment variables.");
    }
    const bucket = storage.bucket(bucketName);

    // Decode the data URI to get the buffer and mime type
    const imageParts = imageDataUri.split(',');
    const mimeType = imageParts[0].split(':')[1].split(';')[0];
    const imageBuffer = Buffer.from(imageParts[1], 'base64');
    
    // Create a unique, sanitized filename
    const sanitizedFilename = slugify(targetFilename).replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');
    const extension = mimeType.split('/')[1] || 'png';
    const uniqueFilename = `${sanitizedFilename}-${Date.now()}.${extension}`;
    const filePath = `${pathPrefix}${uniqueFilename}`;
    const file = bucket.file(filePath);

    // Upload the file to Firebase Storage
    await file.save(imageBuffer, {
      metadata: { contentType: mimeType },
    });
    
    // The public URL for files in Firebase Storage with uniform bucket-level access
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    console.log(`[uploadImageAction] Image uploaded successfully. Public URL: ${publicUrl}`);

    return {
      success: true,
      message: 'Image uploaded successfully!',
      imageUrl: publicUrl,
    };
  } catch (error: any) {
    console.error('[uploadImageAction] Firebase Storage Error:', error);
    return { success: false, message: error.message || 'An unknown error occurred during upload.' };
  }
}
