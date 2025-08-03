import { defineCollection, z } from 'astro:content';

const notesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    date: z.string(),
    readTime: z.string().optional(),
    category: z.enum(['frontend', 'backend', 'devops', 'database', 'tools', 'algorithms', 'design', 'ai', 'other']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
  }),
});

const tilCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.string(),
    category: z.enum(['frontend', 'backend', 'devops', 'database', 'tools', 'algorithms', 'design', 'ai', 'other']),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  'notes': notesCollection,
  'til': tilCollection,
}; 