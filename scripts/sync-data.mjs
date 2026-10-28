// Downloads every dataset the static build needs into ./data.
// Safe to re-run: files that already exist are skipped unless --force is passed.
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', 'data');
const FORCE = process.argv.includes('--force');
const CLOUD = 'https://api.alquran.cloud/v1';
const QAPI = 'https://quranapi.pages.dev/api';

// alquran.cloud editions: text + per-ayah juz/page/ruku/hizb/sajda metadata.
const EDITIONS = {
  arabic: 'quran-uthmani',
  english: 'en.sahih',
  urdu: 'ur.jalandhry',
  bangla: 'bn.bengali',
  transliteration: 'en.transliteration',
};

const exists = (p) => access(p).then(() => true, () => false);

async function fetchJson(url, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i >= tries) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
}

async function save(file, url, transform = (d) => d) {
  const out = path.join(ROOT, file);
  if (!FORCE && (await exists(out))) return false;
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(transform(await fetchJson(url))));
  return true;
}

async function pool(items, size, fn) {
  let next = 0, done = 0;
  const workers = Array.from({ length: size }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
      if (++done % 250 === 0) console.log(`  ${done}/${items.length}`);
    }
  });
  await Promise.all(workers);
}

console.log('Editions + metadata');
await save('meta.json', `${CLOUD}/meta`, (d) => d.data);
for (const [name, edition] of Object.entries(EDITIONS)) {
  await save(`editions/${name}.json`, `${CLOUD}/quran/${edition}`, (d) => ({
    edition: d.data.edition,
    surahs: d.data.surahs,
  }));
}

console.log('Surah audio (114)');
const surahNos = Array.from({ length: 114 }, (_, i) => i + 1);
await pool(surahNos, 12, (n) =>
  save(`audio/${n}.json`, `${QAPI}/${n}.json`, (d) => d.audio),
);

console.log('Tafsir (6236)');
const meta = JSON.parse(await readFile(path.join(ROOT, 'meta.json'), 'utf8'));
const ayahKeys = meta.surahs.references.flatMap((s) =>
  Array.from({ length: s.numberOfAyahs }, (_, i) => `${s.number}_${i + 1}`),
);
await pool(ayahKeys, 24, (key) =>
  save(`tafsir/${key}.json`, `${QAPI}/tafsir/${key}.json`, (d) => d.tafsirs),
);

console.log('Done');
