import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nural-quran.com',
  trailingSlash: 'never',
  build: {
    // /surah/yaseen.html served as /surah/yaseen (vercel.json cleanUrls)
    format: 'file',
    inlineStylesheets: 'never',
  },
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
});
