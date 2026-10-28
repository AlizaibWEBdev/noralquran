import { SITE, getSurahs, isAyahIndexable, surahUrl, ayahUrl, paraUrl, type Lang } from './quran';
import { COLLECTIONS, CANONICAL_OVERRIDES } from './collections';

export const SITEMAPS: Record<string, () => string[]> = {
  pages: () => ['/', '/para', '/about', ...COLLECTIONS.map((c) => `/${c.slug}`), ...Array.from({ length: 30 }, (_, i) => paraUrl(i + 1))],
  surahs: () => getSurahs().map((s) => surahUrl(s)),
  translations: () => getSurahs().flatMap((s) => (['urdu', 'bangla'] as Lang[]).map((l) => surahUrl(s, l))),
  // Only ayah pages that pass the thin-content gate, and are their own canonical.
  ayat: () =>
    getSurahs().flatMap((s) =>
      s.ayahs
        .filter((a) => !CANONICAL_OVERRIDES[`${s.number}:${a.number}`] && isAyahIndexable(s.number, a.number))
        .map((a) => ayahUrl(s, a.number)),
    ),
};

const xml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });

export const urlset = (paths: string[]) =>
  xml(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
      .map((p) => `<url><loc>${SITE}${p === '/' ? '/' : p}</loc></url>`)
      .join('\n')}\n</urlset>`,
  );

export const sitemapIndex = () =>
  xml(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(SITEMAPS)
      .map((name) => `<sitemap><loc>${SITE}/sitemap-${name}.xml</loc></sitemap>`)
      .join('\n')}\n</sitemapindex>`,
  );
