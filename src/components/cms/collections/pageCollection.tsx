'use client';

import { buildCollection, buildProperty } from 'firecms';
import type { PageData, ContentBlock } from '@/types';
import { pageFormSchema } from '@/lib/schemas'; // Assuming you have Zod schemas

const contentBlockProperty = buildProperty({
  name: 'Content Block',
  dataType: 'map',
  properties: {
    type: {
      name: 'Type',
      dataType: 'string',
      enumValues: {
        heading: 'Heading',
        paragraph: 'Paragraph',
        image: 'Image',
        value_card: 'Value Card',
      },
    },
    level: {
      name: 'Level',
      dataType: 'number',
      description: 'Heading level (1-6)',
      validation: { min: 1, max: 6 },
      hide: ({ values }) => values.type !== 'heading',
    },
    text: {
      name: 'Text/Content',
      dataType: 'string',
      markdown: true,
      hide: ({ values }) => values.type === 'image',
    },
    url: {
      name: 'Image URL',
      dataType: 'string',
      validation: { url: true },
      hide: ({ values }) => values.type !== 'image',
    },
    alt: {
      name: 'Image Alt Text',
      dataType: 'string',
      hide: ({ values }) => values.type !== 'image',
    },
    dataAiHint: {
      name: 'AI Hint',
      dataType: 'string',
      description: 'Hint for AI image search (e.g., "team office")',
      hide: ({ values }) => values.type !== 'image',
    },
    icon: {
      name: 'Icon',
      dataType: 'string',
      enumValues: {
        zap: 'Zap (Innovation)',
        users: 'Users (Customer Focus)',
        shield_check: 'Shield (Reliability)',
      },
      hide: ({ values }) => values.type !== 'value_card',
    },
    title: {
      name: 'Card Title',
      dataType: 'string',
      hide: ({ values }) => values.type !== 'value_card',
    },
  },
});

export const pageCollection = buildCollection<PageData>({
  name: 'Pages',
  singularName: 'Page',
  path: 'pages',
  icon: 'Article',
  customId: true, // "about", "contact", etc.
  permissions: ({ authController }) => ({
    edit: authController.extra.admin,
    create: authController.extra.admin,
    delete: false, // Generally don't want to delete core pages
  }),
  properties: {
    title: {
      name: 'Title',
      validation: { required: true },
      dataType: 'string',
    },
    metaDescription: {
      name: 'Meta Description',
      validation: { required: true, maxLength: 300 },
      dataType: 'string',
      multiline: true,
    },
    contentBlocks: {
      name: 'Content Blocks',
      description: 'The building blocks of the page content',
      dataType: 'array',
      of: contentBlockProperty,
    },
    updatedAt: {
        name: 'Last Updated',
        dataType: 'date',
        autoValue: 'on_update',
        readOnly: true,
    }
  },
});