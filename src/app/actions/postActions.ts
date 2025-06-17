
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Timestamp } from 'firebase/firestore'; // Client SDK Timestamp
import { getAdminFirestore } from '@/app/actions/adminActions'; 
import { postFormSchema, type PostFormValues } from '@/lib/schemas';
import { addBlogPost, updateBlogPost, getPostByIdForEditing } from '@/lib/firestoreBlog';
import type { NewBlogPost, BlogPost } from '@/types';
import { slugify } from '@/lib/utils';
import { marked } from 'marked';

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

interface DeleteMultiplePostsResult {
  success: boolean;
  message: string;
  deletedCount?: number;
  errors?: { postId: string; message: string }[];
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

  let htmlContent: string;
  try {
    htmlContent = await marked.parse(content);
  } catch (parseError) {
    console.error('Error parsing Markdown to HTML:', parseError);
    return { success: false, message: 'Failed to process post content (Markdown parsing error).' };
  }


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
    content: htmlContent,
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
      return { success: false, message: 'Failed to create post in database (addBlogPost returned null).' };
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
  console.log(`[updatePostAction] Received request to update post ID: ${postId}`);
  if (!postId) {
    return { success: false, message: 'Post ID is missing. Cannot update post.' };
  }

  const validatedFields = postFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.error('[updatePostAction] Validation errors for update:', validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }

  const { title, slug, author, category, excerpt, content, imageUrl, tags, published } = validatedFields.data;

  let htmlContent: string;
  try {
    htmlContent = await marked.parse(content);
  } catch (parseError: any) {
    console.error('[updatePostAction] Error parsing Markdown to HTML during update:', parseError);
    return { success: false, message: `Failed to process post content (Markdown parsing error): ${parseError.message}` };
  }

  const processedTags = tags
    ? tags.split(',').map(tag => slugify(tag.trim())).filter(tag => tag.length > 0)
    : [];

  const categorySlug = slugify(category); 

  const postUpdateData: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'date'>> & { category: string, content: string } = {
    title,
    slug,
    author,
    category: categorySlug,
    excerpt,
    content: htmlContent,
    imageUrl,
    tags: processedTags,
    published,
  };

  console.log('[updatePostAction] Prepared data for Firestore update:', JSON.stringify(postUpdateData, null, 2));

  try {
    const updateResult = await updateBlogPost(postId, postUpdateData);

    if (updateResult.success) {
      console.log(`[updatePostAction] Post ${postId} updated successfully in Firestore.`);
      const oldPost = updateResult.oldPost;

      revalidatePath('/blog');
      revalidatePath(`/blog/${slug}`); 
      revalidatePath(`/admin/posts`);
      revalidatePath(`/admin/posts/edit/${postId}`);
      revalidatePath(`/blog/category/${categorySlug}`); 

      if (oldPost) {
        if (oldPost.slug !== slug) revalidatePath(`/blog/${oldPost.slug}`);
        if (oldPost.category !== categorySlug) revalidatePath(`/blog/category/${oldPost.category}`);
        const oldTags = oldPost.tags || [];
        const newTags = processedTags;
        const allTagsToRevalidate = new Set([...oldTags, ...newTags]);
        allTagsToRevalidate.forEach(tagSlug => revalidatePath(`/blog/tag/${tagSlug}`));
      } else {
        processedTags.forEach(tagSlug => revalidatePath(`/blog/tag/${tagSlug}`));
        console.warn(`[updatePostAction] Post ${postId} updated, but old post data not found for comprehensive revalidation. Partial revalidation applied.`);
      }
    } else {
      console.error(`[updatePostAction] updateBlogPost returned failure for post ID: ${postId}.`);
      return { success: false, message: 'Failed to update post in database (updateBlogPost reported failure).' };
    }
  } catch (error: any) { 
    console.error(`[updatePostAction] Unexpected error during update process for post ID ${postId}:`, error);
    return { success: false, message: `Unexpected error during post update: ${error.message || 'Unknown error'}` };
  }

  redirect('/admin/posts');
}


export async function deletePostAction(
  postId: string
): Promise<DeletePostResult> {
  if (!postId) {
    return { success: false, message: 'Post ID is missing. Cannot delete post.' };
  }
  const adminDb = await getAdminFirestore(); // Use await

  try {
    const postToDelete = await getPostByIdForEditing(postId); 
    
    if (!postToDelete) {
      return { success: false, message: 'Post not found, cannot delete.' };
    }
    
    const postRefAdmin = adminDb.collection('posts').doc(postId);
    await postRefAdmin.delete();

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
    console.error(`Error deleting post ${postId} with Admin SDK:`, error);
    return { 
      success: false, 
      message: error.message || `Failed to delete post ${postId}.`,
      errors: [{ message: error.message || 'Unknown error' }]
    };
  }
}

export async function deleteMultiplePostsAction(
  postIds: string[]
): Promise<DeleteMultiplePostsResult> {
  if (!postIds || postIds.length === 0) {
    return { success: false, message: 'No post IDs provided for deletion.' };
  }

  const adminDb = await getAdminFirestore(); // Use await
  const batch = adminDb.batch();
  let deletedCount = 0;
  const errors: { postId: string; message: string }[] = [];
  
  const pathsToRevalidate = {
    slugs: new Set<string>(),
    categories: new Set<string>(),
    tags: new Set<string>(),
  };

  for (const postId of postIds) {
    try {
      const postToDelete = await getPostByIdForEditing(postId); 
      if (postToDelete) {
        const postRefAdmin = adminDb.collection('posts').doc(postId);
        batch.delete(postRefAdmin);
        deletedCount++;
        
        if (postToDelete.slug) pathsToRevalidate.slugs.add(postToDelete.slug);
        if (postToDelete.category) pathsToRevalidate.categories.add(postToDelete.category);
        if (postToDelete.tags) postToDelete.tags.forEach(tag => pathsToRevalidate.tags.add(tag));

      } else {
        console.warn(`Post with ID ${postId} not found for deletion, skipping.`);
      }
    } catch (error: any) {
      console.error(`Error preparing post ${postId} for batch deletion:`, error);
      errors.push({ postId, message: error.message || 'Unknown error during pre-delete fetch' });
    }
  }

  if (deletedCount === 0 && errors.length === 0 && postIds.length > 0) {
    return { success: false, message: 'No posts found to delete (they may have already been deleted).', errors };
  }
  
  if (deletedCount === 0 && errors.length > 0) {
     return { success: false, message: 'Could not prepare any posts for deletion due to errors.', errors };
  }


  try {
    await batch.commit();
    
    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    pathsToRevalidate.slugs.forEach(slug => revalidatePath(`/blog/${slug}`));
    pathsToRevalidate.categories.forEach(categorySlug => revalidatePath(`/blog/category/${categorySlug}`));
    pathsToRevalidate.tags.forEach(tagSlug => revalidatePath(`/blog/tag/${tagSlug}`));

    let message = `${deletedCount} post(s) deleted successfully.`;
    if (errors.length > 0) {
      message += ` ${errors.length} post(s) could not be deleted.`;
    }
    return { success: true, message, deletedCount, errors: errors.length > 0 ? errors : undefined };

  } catch (error: any) {
    console.error('Error committing batch delete with Admin SDK:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to delete one or more posts during batch commit.',
      errors 
    };
  }
}
    
