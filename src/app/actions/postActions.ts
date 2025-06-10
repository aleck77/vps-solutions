
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { postFormSchema, type PostFormValues } from '@/lib/schemas';
import { addBlogPost } from '@/lib/firestoreBlog';
import type { NewBlogPost } from '@/types';
import { slugify } from '@/lib/utils'; // Импортируем slugify

interface CreatePostResult {
  success: boolean;
  message: string;
  postId?: string;
  errors?: z.ZodIssue[];
}

export async function createPostAction(
  prevState: CreatePostResult | undefined,
  formData: PostFormValues
): Promise<CreatePostResult> {
  // Validate form data against the Zod schema
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

  // Process tags: split string by comma, trim whitespace, filter out empty strings
  const processedTags = tags
    ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  const now = Timestamp.now();
  const categorySlug = slugify(category); // Преобразуем имя категории в слаг

  const newPostData: NewBlogPost = {
    title,
    slug,
    author,
    category: categorySlug, // Сохраняем слаг категории
    excerpt,
    content,
    imageUrl,
    tags: processedTags,
    published,
    date: now, // Use current date for new posts
    createdAt: now,
    updatedAt: now,
  };

  try {
    const postId = await addBlogPost(newPostData);

    if (postId) {
      revalidatePath('/blog'); // Revalidate blog listing page
      revalidatePath(`/blog/${slug}`); // Revalidate the new post's page
      revalidatePath('/admin/posts'); // Revalidate admin posts list
      // Optionally, revalidate category pages if you have them dynamic based on posts
      revalidatePath(`/blog/category/${categorySlug}`); // Revalidate category page with slug
      
      // Redirect after successful creation
      // Note: redirect needs to be called outside of try/catch as it throws an error.
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
  
  // Redirect must be called outside try/catch
  redirect('/admin/posts');
  // The redirect will prevent this return from being reached, but it's good for type safety.
  // return { success: true, message: 'Post created successfully!', postId: 'some-id' }; 
}

