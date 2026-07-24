import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { satteri } from '@astrojs/markdown-satteri';
import svelte from '@astrojs/svelte';

const SITE = Deno.env.get('SITE') ?? 'https://localhost:4321';

const slangGrammar = (await fetch("https://raw.githubusercontent.com/shader-slang/slang-vscode-extension/refs/heads/main/syntaxes/slang.tmLanguage.json")).json();

export default defineConfig({
  base: '/',
  site: SITE,
  server: {
    host: true,
  },
  output: 'static',
  image: {
    layout: "constrained"
  },
  integrations: [icon(), mdx(), svelte()],
  markdown: {
    processor: satteri({
      features: {
        math: { singleDollarTextMath: false },
        smartPunctuation: true,
      }
    }),
    shikiConfig: {
      langs: [slangGrammar],
      langAlias: { slang: 'Slang' },
      themes: {
        light: 'one-light',
        dark: 'one-dark-pro',
      },
      defaultColor: false,
    },
  },
  //prefetch: true,
  redirects: {
    '/archive': '/posts',
    '/portfolio': '/projects',
  },
  vite: {
    server: {
      watch: {
        ignored: ["vendor/**/*"],
      },
    },
    resolve: {
      tsconfigPaths: true,
    },
  },
});
