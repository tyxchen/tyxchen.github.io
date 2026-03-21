import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

const SITE = Deno.env.get('SITE');

export default defineConfig({
  base: '/',
  site: SITE,
  server: {
    host: true,
  },
  output: 'static',
  integrations: [icon()],
  //prefetch: true,
  redirects: {
    '/archive': '/posts',
  }
});
