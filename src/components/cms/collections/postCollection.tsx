'use client';

import { buildCollection } from 'firecms';
import type { BlogPost, BlogCategoryType } from '@/types';
import { blogCategories } from '@/types';
import { slugify } from '@/lib/utils';

// Create an enum mapping for FireCMS
const categoryEnum = blogCategories.reduce((acc, category) => {
    acc[slugify(category)] = category;
    return acc;
}, {} as Record<string, string>);

export const postCollection = buildCollection<BlogPost>({
  name: 'Blog Posts',
  singularName: 'Blog Post',
  path: 'posts',
  icon: 'Book',
  permissions: ({ authController }) => ({
    edit: authController.extra.admin,
    create: authController.extra.admin,
    delete: authController.extra.admin,
  }),
  properties: {
    title: {
      name: 'Title',
      validation: { required: true },
      dataType: 'string',
    },
    slug: {
      name: 'Slug',
      dataType: 'string',
      readOnly: true,
      description: 'URL-friendly version of the title. Auto-generated.',
    },
    author: {
      name: 'Author',
      dataType: 'string',
      validation: { required: true },
    },
    category: {
      name: 'Category',
      dataType: 'string',
      enumValues: categoryEnum,
      validation: { required: true },
    },
    excerpt: {
      name: 'Excerpt',
      dataType: 'string',
      multiline: true,
      validation: { required: true, maxLength: 300 },
    },
    imageUrl: {
      name: 'Image URL',
      dataType: 'string',
      validation: { url: true },
    },
    content: {
      name: 'Content (HTML)',
      dataType: 'string',
      markdown: true,
      validation: { required: true },
    },
    tags: {
      name: 'Tags',
      dataType: 'array',
      of: {
        dataType: 'string',
      },
    },
    published: {
      name: 'Published',
      dataType: 'boolean',
    },
    date: {
        name: 'Publication Date',
        dataType: 'date',
        autoValue: 'on_create'
    },
    createdAt: {
        name: 'Created At',
        dataType: 'date',
        autoValue: 'on_create',
        readOnly: true
    },
    updatedAt: {
        name: 'Last Updated',
        dataType: 'date',
        autoValue: 'on_update',
        readOnly: true
    }
  },
  callbacks: {
    onPreSave: ({ values }) => {
      // Auto-generate slug from title if it's a new document
      if (!values.slug) {
        values.slug = slugify(values.title);
      }
      return values;
    },
  },
});