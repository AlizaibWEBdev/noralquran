// Regenerates vercel.json from src/lib/names.ts. Run after editing slugs or aliases:
//   npm run redirects
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = readFileSync(path.join(root, 'src/lib/names.ts'), 'utf8');

// Pull every S('slug', 'Name', ...aliases) call out of names.ts, in order.
const surahs = [...src.matchAll(/^\s*S\(([^)]*)\),?$/gm)].map((m) => {
  const args = [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'|"([^"]*)"/g)].map((a) => a[1] ?? a[2]);
  const [slug, , ...aliases] = args;
  return { slug, aliases };
});
if (surahs.length !== 114) throw new Error(`Expected 114 surahs in names.ts, found ${surahs.length}`);

const owners = new Map();
surahs.forEach(({ slug, aliases }, i) => {
  for (const key of [slug, ...aliases, String(i + 1)]) {
    if (owners.has(key)) throw new Error(`"${key}" is used by both ${owners.get(key)} and ${slug}`);
    owners.set(key, slug);
  }
});

const redirects = surahs.flatMap(({ slug, aliases }, i) => {
  const from = [String(i + 1), ...aliases].join('|');
  return [
    { source: `/surah/:old(${from})`, destination: `/surah/${slug}`, permanent: true },
    { source: `/surah/:old(${from})/:rest+`, destination: `/surah/${slug}/:rest+`, permanent: true },
  ];
});

redirects.push(
  { source: '/surah', destination: '/#surahs', permanent: true },
  { source: '/:kind(juz|sipara|parah)/:n(\\d+)', destination: '/para/:n', permanent: true },
  { source: '/:kind(juz|sipara|parah)', destination: '/para', permanent: true },
  { source: '/index.html', destination: '/', permanent: true },
);

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: 'astro',
  cleanUrls: true,
  trailingSlash: false,
  headers: [{ source: '/_astro/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }],
  redirects,
};

writeFileSync(path.join(root, 'vercel.json'), JSON.stringify(config, null, 2) + '\n');
console.log(`vercel.json: ${redirects.length} redirects`);
