import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import svelte from '@astrojs/svelte';

const SITE = Deno.env.get('SITE');

export default defineConfig({
  base: '/',
  site: SITE,
  server: {
    host: true,
  },
  output: 'static',
  integrations: [icon(), mdx(), svelte()],
  markdown: {
    remarkPlugins: [
      [remarkMath, { singleDollarTextMath: false }],
    ],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: {
        light: 'one-light',
        dark: 'one-dark-pro',
      },
    },
  },
  //prefetch: true,
  redirects: {
    '/archive': '/posts',
  },
  vite: {
    server: {
      watch: {
        ignored: ["vendor/**/*"],
      },
    },
  },
});
