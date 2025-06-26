'use client';

import { buildCollection } from 'firecms';
import type { Category } from '@/types';
import { slugify } from '@/lib/utils';

export const categoryCollection = buildCollection<Category>({
  name: 'Categories',
  singularName: 'Category',
  path: 'categories',
  icon: 'Category',
  permissions: ({ authController }) => ({
    edit: authController.extra.admin,
    create: authController.extra.admin,
    delete: authController.extra.admin,
  }),
  properties: {
    name: {
      name: 'Name',
      validation: { required: true },
      dataType: 'string',
    },
    slug: {
      name: 'Slug',
      validation: { required: true },
      dataType: 'string',
      description: 'URL-friendly version of the name, auto-generated on creation.',
      readOnly: true,
    },
  },
  callbacks: {
    onPreSave: ({ values }) => {
      if (!values.slug) {
        values.slug = slugify(values.name);
      }
      return values;
    },
  },
});