import { SITE } from '../lib/quran';

export const GET = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /bookmarks\n\nSitemap: ${SITE}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
