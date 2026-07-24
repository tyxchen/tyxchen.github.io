// Modified from Astro blog sample

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const isProduction = Deno.env.get('NODE_ENV') === 'production';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: ['**/*.{md,mdx}', isProduction ? '!**/_*.{md,mdx}' : ''] }),
  // Type-check frontmatter using a schema
  schema: () =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.string().optional(),
      heroAttr: z.string().optional(),
      heroInvertColours: z.boolean().optional(),
    }),
});
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: ['**/*.{md,mdx}', isProduction ? '!**/_*.{md,mdx}' : ''] }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      colour: z.string(),
      images: z.array(image()),
      link: z.string().optional(),
      summary: z.record(z.string(), z.string()),
    }),
});

export const collections = { posts, projects };
