
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

export const vpsPlanSchema = z.object({
  name: z.string().min(3, { message: 'Plan name must be at least 3 characters.' }),
  cpu: z.string().min(1, { message: 'CPU specification is required.' }),
  ram: z.string().min(1, { message: 'RAM specification is required.' }),
  storage: z.string().min(1, { message: 'Storage specification is required.' }),
  bandwidth: z.string().min(1, { message: 'Bandwidth specification is required.' }),
  priceMonthly: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  features: z.string().min(1, { message: 'At least one feature is required.' }), // Comma-separated
});

export type VpsPlanFormValues = z.infer<typeof vpsPlanSchema>;

// --- Site Settings Schemas ---

const heroBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('hero'),
  heroTitle: z.string().min(5, { message: 'Hero title is required.' }),
  heroSubtitle: z.string().min(10, { message: 'Hero subtitle is required.' }),
});

const homepageFeatureSchema = z.object({
  id: z.string().optional(),
  icon: z.string().min(1, { message: 'Icon name is required.' }),
  title: z.string().min(3, { message: 'Feature title is required.' }),
  description: z.string().min(10, { message: 'Feature description is required.' }),
});

const featuresBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('features'),
  featuresTitle: z.string().min(5, { message: 'Features title is required.' }),
  features: z.array(homepageFeatureSchema).min(1, { message: 'At least one feature card is required.' }),
});

const ctaBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('cta'),
  ctaTitle: z.string().min(5, { message: 'CTA title is required.' }),
  ctaSubtitle: z.string().min(10, { message: 'CTA subtitle is required.' }),
});


export const homepageContentSchema = z.object({
  contentBlocks: z.array(
    z.discriminatedUnion('type', [
      heroBlockSchema,
      featuresBlockSchema,
      ctaBlockSchema,
    ])
  ).min(1, { message: 'Homepage must have at least one content block.' }),
});
export type HomepageContentValues = z.infer<typeof homepageContentSchema>;


export const contactInfoSchema = z.object({
  address: z.string().min(10, { message: 'Address is required.' }),
  salesEmail: z.string().email(),
  supportEmail: z.string().email(),
  phone: z.string().min(5, { message: 'Phone number is required.' }),
  salesHours: z.string().min(5, { message: 'Sales hours are required.' }),
  supportHours: z.string().min(5, { message: 'Support hours are required.' }),
});
export type ContactInfoValues = z.infer<typeof contactInfoSchema>;

const footerTextBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('text'),
  title: z.string().min(1, { message: 'Title is required.' }),
  description: z.string().min(10, { message: 'Description is required.' }),
});

const footerMenuBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('menu'),
  title: z.string().min(1, { message: 'Title is required.' }),
  menuId: z.string().min(1, { message: 'A menu must be selected.' }),
});

export const footerContentSchema = z.object({
  contentBlocks: z.array(
    z.discriminatedUnion('type', [
      footerTextBlockSchema,
      footerMenuBlockSchema,
    ])
  ).min(1, { message: 'Footer must have at least one content block.' }),
  copyright: z.string().min(5, { message: 'Copyright text is required.' }),
  socialLinks: z.array(z.object({
    id: z.string().optional(),
    name: z.enum(['Facebook', 'Twitter', 'LinkedIn']),
    href: z.string().url({ message: 'Please enter a valid URL.' }),
  })).min(1, { message: 'At least one social link is required.' }),
});
export type FooterContentValues = z.infer<typeof footerContentSchema>;


export const generalSettingsSchema = z.object({
  siteName: z.string().min(3, { message: 'Site name must be at least 3 characters.' }),
  logoUrl: z.string()
    .min(1, { message: 'Logo path is required.' })
    .startsWith('/', { message: 'Path must start with a /' }),
});
export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
