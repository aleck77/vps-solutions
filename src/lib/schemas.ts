
import { z } from 'zod';
import { blogCategories } from '@/types';

// Zod enum expects a non-empty array of strings.
// We cast blogCategories to satisfy this if it's a const array or a union type array.
const categoryEnumValidation = blogCategories as [string, ...string[]];

export const postFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(150, { message: 'Title must be 150 characters or less.' }),
  slug: z.string()
    .min(3, { message: 'Slug must be at least 3 characters.' })
    .max(100, { message: 'Slug must be 100 characters or less.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase and contain only letters, numbers, and hyphens.' }),
  author: z.string().min(2, { message: 'Author name must be at least 2 characters.' }).max(50, { message: 'Author name must be 50 characters or less.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
  category: z.enum(categoryEnumValidation, {
    required_error: "You need to select a blog category.",
    invalid_type_error: "Invalid category selected."
  }),
  excerpt: z.string().min(10, { message: 'Excerpt must be at least 10 characters.' }).max(300, { message: 'Excerpt must be 300 characters or less.' }),
  content: z.string().min(20, { message: 'Content must be at least 20 characters.' }),
  tags: z.string().optional(), // Comma-separated string, will be processed into string[]
  published: z.boolean().default(false),
});

export type PostFormValues = z.infer<typeof postFormSchema>;


const contentBlockSchema = z.object({
    id: z.string().optional(), // Added for drag-and-drop keying
    type: z.enum(['heading', 'paragraph', 'image', 'value_card']),
    level: z.coerce.number().optional(),
    text: z.string().optional(),
    url: z.string().optional(),
    alt: z.string().optional(),
    dataAiHint: z.string().optional(),
    icon: z.string().optional(),
    title: z.string().optional(),
});


export const pageFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(150, { message: 'Title must be 150 characters or less.' }),
  metaDescription: z.string().min(10, { message: 'Meta description must be at least 10 characters.' }).max(300, { message: 'Meta description must be 300 characters or less.' }),
  contentBlocks: z.array(contentBlockSchema).optional(),
});

export type PageFormValues = z.infer<typeof pageFormSchema>;

export const createPageFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(150, { message: 'Title must be 150 characters or less.' }),
  slug: z.string()
    .min(3, { message: 'Slug must be at least 3 characters.' })
    .max(100, { message: 'Slug must be 100 characters or less.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase and contain only letters, numbers, and hyphens.' }),
});

export type CreatePageFormValues = z.infer<typeof createPageFormSchema>;
