import type { APIRoute } from 'astro';
import { SITEMAPS, urlset } from '../lib/sitemap';

export function getStaticPaths() {
  return Object.keys(SITEMAPS).map((name) => ({ params: { name } }));
}

export const GET: APIRoute = ({ params }) => urlset(SITEMAPS[params.name!]());
