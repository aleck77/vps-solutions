
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { postFormSchema, type PostFormValues } from '@/lib/schemas';
import { addBlogPost, updateBlogPost } from '@/lib/firestoreBlog';
import type { NewBlogPost, BlogPost } from '@/types';
import { slugify } from '@/lib/utils';

interface CreatePostResult {
  success: boolean;
  message: string;
  postId?: string;
  errors?: z.ZodIssue[];
}

interface UpdatePostResult extends CreatePostResult {}

export async function createPostAction(
  prevState: CreatePostResult | undefined,
  formData: PostFormValues
): Promise<CreatePostResult> {
  const validatedFields = postFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.error('Validation errors:', validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }

  const { title, slug, author, category, excerpt, content, imageUrl, tags, published } = validatedFields.data;

  const processedTags = tags
    ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  const now = Timestamp.now();
  const categorySlug = slugify(category);

  const newPostData: NewBlogPost = {
    title,
    slug,
    author,
    category: categorySlug,
    excerpt,
    content,
    imageUrl,
    tags: processedTags,
    published,
    date: now, 
    createdAt: now,
    updatedAt: now,
  };

  try {
    const postId = await addBlogPost(newPostData);

    if (postId) {
      revalidatePath('/blog');
      revalidatePath(`/blog/${slug}`);
      revalidatePath('/admin/posts');
      revalidatePath(`/blog/category/${categorySlug}`);
    } else {
      return { success: false, message: 'Failed to create post in database.' };
    }
  } catch (error) {
    console.error('Error creating post:', error);
    let message = 'An unexpected error occurred while creating the post.';
    if (error instanceof Error) {
      message = error.message;
    }
    return { success: false, message };
  }
  
  redirect('/admin/posts');
}


export async function updatePostAction(
  postId: string,
  prevState: UpdatePostResult | undefined,
  formData: PostFormValues
): Promise<UpdatePostResult> {
  if (!postId) {
    return { success: false, message: 'Post ID is missing. Cannot update post.' };
  }

  const validatedFields = postFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.error('Validation errors for update:', validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }

  const { title, slug, author, category, excerpt, content, imageUrl, tags, published } = validatedFields.data;

  const processedTags = tags
    ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];
  
  const categorySlug = slugify(category);

  // We construct a Partial<BlogPost> because not all fields might be directly from form,
  // and `updatedAt` is handled by Firestore. `date` and `createdAt` are not changed on update.
  const postUpdateData: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'date'>> & { category: string } = {
    title,
    slug,
    author,
    category: categorySlug,
    excerpt,
    content,
    imageUrl,
    tags: processedTags,
    published,
    // `updatedAt` will be set by `updateBlogPost` using serverTimestamp
    // `date` (original publication date) and `createdAt` are usually not updated.
  };


  try {
    const success = await updateBlogPost(postId, postUpdateData);

    if (success) {
      revalidatePath('/blog');
      revalidatePath(`/blog/${slug}`); // Revalidate the updated post's page
      revalidatePath(`/admin/posts`); // Revalidate admin posts list
      revalidatePath(`/admin/posts/edit/${postId}`); // Revalidate the edit page itself
      revalidatePath(`/blog/category/${categorySlug}`);
    } else {
      return { success: false, message: 'Failed to update post in database.' };
    }
  } catch (error) {
    console.error('Error updating post:', error);
    let message = 'An unexpected error occurred while updating the post.';
    if (error instanceof Error) {
      message = error.message;
    }
    return { success: false, message };
  }
  
  redirect('/admin/posts');
}
