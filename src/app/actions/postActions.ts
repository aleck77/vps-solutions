
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Timestamp, doc, deleteDoc } from 'firebase/firestore'; // Added deleteDoc
import { postFormSchema, type PostFormValues } from '@/lib/schemas';
import { addBlogPost, updateBlogPost, getPostByIdForEditing } from '@/lib/firestoreBlog'; // Added getPostByIdForEditing
import type { NewBlogPost, BlogPost } from '@/types';
import { slugify } from '@/lib/utils';
import { getDb } from '@/lib/firebase'; // Added import for getDb

interface CreatePostResult {
  success: boolean;
  message: string;
  postId?: string;
  errors?: z.ZodIssue[];
}

interface UpdatePostResult extends CreatePostResult {}

interface DeletePostResult {
  success: boolean;
  message: string;
  errors?: { message: string }[];
}

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
    ? tags.split(',').map(tag => slugify(tag.trim())).filter(tag => tag.length > 0)
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
      processedTags.forEach(tagSlug => revalidatePath(`/blog/tag/${tagSlug}`));
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
    ? tags.split(',').map(tag => slugify(tag.trim())).filter(tag => tag.length > 0)
    : [];

  const categorySlug = slugify(category); 

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
  };


  try {
    const oldPost = await updateBlogPost(postId, postUpdateData, true); 

    if (oldPost) {
      revalidatePath('/blog');
      revalidatePath(`/blog/${slug}`); 
      if (oldPost.slug !== slug) {
        revalidatePath(`/blog/${oldPost.slug}`); 
      }
      revalidatePath(`/admin/posts`);
      revalidatePath(`/admin/posts/edit/${postId}`);
      revalidatePath(`/blog/category/${categorySlug}`);
      if (oldPost.category !== categorySlug) {
        revalidatePath(`/blog/category/${oldPost.category}`);
      }

      const oldTags = oldPost.tags || [];
      const newTags = processedTags;
      const allTagsToRevalidate = new Set([...oldTags, ...newTags]);
      allTagsToRevalidate.forEach(tagSlug => revalidatePath(`/blog/tag/${tagSlug}`));

    } else {
      return { success: false, message: 'Failed to update post in database or retrieve old post data.' };
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


export async function deletePostAction(
  postId: string
): Promise<DeletePostResult> {
  if (!postId) {
    return { success: false, message: 'Post ID is missing. Cannot delete post.' };
  }

  try {
    // Fetch the post before deleting to get its slug, category, and tags for revalidation
    const postToDelete = await getPostByIdForEditing(postId);
    
    if (!postToDelete) {
      return { success: false, message: 'Post not found, cannot delete.' };
    }
    
    const db = getDb(); // Get Firestore instance
    await deleteDoc(doc(db, 'posts', postId)); // Corrected call to doc()

    // Revalidate paths
    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    if (postToDelete.slug) {
      revalidatePath(`/blog/${postToDelete.slug}`);
    }
    if (postToDelete.category) {
      revalidatePath(`/blog/category/${postToDelete.category}`);
    }
    if (postToDelete.tags && postToDelete.tags.length > 0) {
      postToDelete.tags.forEach(tagSlug => revalidatePath(`/blog/tag/${tagSlug}`));
    }

    return { success: true, message: `Post "${postToDelete.title}" deleted successfully.` };

  } catch (error: any) {
    console.error(`Error deleting post ${postId}:`, error);
    return { 
      success: false, 
      message: error.message || `Failed to delete post ${postId}.`,
      errors: [{ message: error.message || 'Unknown error' }]
    };
  }
}

