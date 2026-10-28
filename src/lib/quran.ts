// Build-time data layer. Reads the JSON that scripts/sync-data.mjs downloads
// into ./data and shapes it for the page templates. Never shipped to the browser.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { SURAH_NAMES, PARA_NAMES } from './names';

const DATA = path.resolve(process.cwd(), 'data');
const readJson = (file: string) => JSON.parse(readFileSync(path.join(DATA, file), 'utf8'));

export const SITE = 'https://nural-quran.com';
export const SITE_NAME = 'Nur al-Quran';

export type Lang = 'english' | 'urdu' | 'bangla';

export const TRANSLATIONS: Record<Lang, { label: string; native: string; translator: string; code: string; dir: 'ltr' | 'rtl' }> = {
  english: { label: 'English', native: 'English', translator: 'Saheeh International', code: 'en', dir: 'ltr' },
  urdu: { label: 'Urdu', native: 'اردو', translator: 'Fateh Muhammad Jalandhry', code: 'ur', dir: 'rtl' },
  bangla: { label: 'Bangla', native: 'বাংলা', translator: 'Muhiuddin Khan', code: 'bn', dir: 'ltr' },
};

export interface Ayah {
  surah: number;
  number: number; // in surah
  global: number;
  arabic: string;
  transliteration: string;
  english: string;
  urdu: string;
  bangla: string;
  juz: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  manzil: number;
  sajda: false | { recommended: boolean; obligatory: boolean };
}

export interface Surah {
  number: number;
  slug: string;
  name: string; // common transliterated name, e.g. "Ya-Sin"
  aliases: string[];
  arabicName: string;
  meaning: string | null; // null when the usual translation just repeats the name
  revelation: 'Makki' | 'Madani';
  ayahCount: number;
  rukuCount: number;
  juz: number[];
  pages: [number, number];
  sajdaAyahs: number[];
  ayahs: Ayah[];
  audio: { id: string; reciter: string; url: string }[];
}

// "Yaseen" -> "Yaseen", "Quraish" -> "Quraysh": a translation that only repeats the name.
const sameName = (a: string, b: string) => {
  const n = (x: string) => x.toLowerCase().replace(/[^a-z]/g, '').replace(/y/g, 'i').replace(/(.)\1+/g, '$1');
  return n(a) === n(b);
};

const BISMILLAH =/^﻿?بِّ?سْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/;

let cache: Surah[] | null = null;

export function getSurahs(): Surah[] {
  if (cache) return cache;
  const ed = Object.fromEntries(
    ['arabic', 'english', 'urdu', 'bangla', 'transliteration'].map((k) => [k, readJson(`editions/${k}.json`).surahs]),
  );

  const surahs: Surah[] = ed.arabic.map((s: any, i: number): Surah => {
    const number = s.number as number;
    const ayahs: Ayah[] = s.ayahs.map((a: any, j: number) => {
      let arabic: string = a.text.replace(/^﻿/, '');
      if (number !== 1 && number !== 9 && j === 0) arabic = arabic.replace(BISMILLAH, '');
      return {
        surah: number,
        number: a.numberInSurah,
        global: a.number,
        arabic,
        transliteration: ed.transliteration[i].ayahs[j].text,
        english: ed.english[i].ayahs[j].text,
        urdu: ed.urdu[i].ayahs[j].text,
        bangla: ed.bangla[i].ayahs[j].text,
        juz: a.juz,
        page: a.page,
        ruku: a.ruku,
        hizbQuarter: a.hizbQuarter,
        manzil: a.manzil,
        sajda: a.sajda ? { recommended: a.sajda.recommended, obligatory: a.sajda.obligatory } : false,
      };
    });
    const audio = Object.entries(readJson(`audio/${number}.json`)).map(([id, v]: [string, any]) => ({
      id,
      reciter: v.reciter,
      url: v.url,
    }));
    const names = SURAH_NAMES[i];
    return {
      number,
      slug: names.slug,
      name: names.name,
      aliases: names.aliases,
      arabicName: s.name.replace(/^سُورَةُ\s*/, ''),
      meaning: sameName(s.englishNameTranslation, s.englishName) ? null : s.englishNameTranslation,
      revelation: s.revelationType === 'Meccan' ? 'Makki' : 'Madani',
      ayahCount: ayahs.length,
      rukuCount: new Set(ayahs.map((a) => a.ruku)).size,
      juz: [...new Set(ayahs.map((a) => a.juz))],
      pages: [ayahs[0].page, ayahs[ayahs.length - 1].page],
      sajdaAyahs: ayahs.filter((a) => a.sajda).map((a) => a.number),
      ayahs,
      audio,
    };
  });
  cache = surahs;
  return surahs;
}

export const getSurah = (n: number) => getSurahs()[n - 1];
export const getAyah = (s: number, a: number) => getSurah(s).ayahs[a - 1];

// ---- Paras (juz) ---------------------------------------------------------

export interface Para {
  number: number;
  name: string;
  arabic: string;
  ayahs: Ayah[];
  surahs: number[];
  pages: [number, number];
}

export function getParas(): Para[] {
  const all = getSurahs().flatMap((s) => s.ayahs);
  return PARA_NAMES.map((p, i) => {
    const ayahs = all.filter((a) => a.juz === i + 1);
    return {
      number: i + 1,
      ...p,
      ayahs,
      surahs: [...new Set(ayahs.map((a) => a.surah))],
      pages: [ayahs[0].page, ayahs[ayahs.length - 1].page] as [number, number],
    };
  });
}

// ---- Tafsir --------------------------------------------------------------

export interface VerseRef {
  surah: number;
  ayah: number;
}

export interface TafsirEntry {
  author: string;
  html: string;
  words: number;
  // Verse range this commentary covers (may cross into the next surah); null when it is for this ayah alone.
  group: { from: VerseRef; to: VerseRef } | null;
  // True when this ayah is where the commentary "lives" (ungrouped, or first of its group).
  owned: boolean;
}

const GROUP = /(\d+):(\d+) to (\d+):(\d+)/;
const cmp = (a: VerseRef, b: VerseRef) => a.surah - b.surah || a.ayah - b.ayah;

// Tafsir is third-party markdown; render it without allowing raw HTML through,
// and push its headings below the page's own h1/h2/h3.
const md = new Marked({
  renderer: {
    html: ({ text }) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    heading({ tokens, depth }) {
      const level = Math.min(depth + 3, 6);
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
    },
  },
});

export function getTafsir(surah: number, ayah: number): TafsirEntry[] {
  const raw = readJson(`tafsir/${surah}_${ayah}.json`) as { author: string; groupVerse: string | null; content: string }[];
  const here = { surah, ayah };
  return raw.flatMap((t) => {
    const m = t.groupVerse ? GROUP.exec(t.groupVerse) : null;
    const group = m
      ? { from: { surah: Number(m[1]), ayah: Number(m[2]) }, to: { surah: Number(m[3]), ayah: Number(m[4]) } }
      : null;
    // The source API sometimes returns a neighbouring group's commentary for a
    // verse it does not cover (e.g. 10:42 -> "10:32 to 10:41"). Drop those.
    if (group && (cmp(here, group.from) < 0 || cmp(here, group.to) > 0)) return [];
    return [{
      author: t.author,
      html: md.parse(t.content, { async: false }) as string,
      words: t.content.split(/\s+/).length,
      group,
      owned: !group || cmp(group.from, here) === 0,
    }];
  });
}

// An ayah page is worth indexing only when it carries enough commentary that
// appears on no other ayah page. Otherwise it stays live but noindex.
export const MIN_OWNED_TAFSIR_WORDS = 250;

export function ownedTafsirWords(tafsir: TafsirEntry[]) {
  return tafsir.filter((t) => t.owned).reduce((n, t) => n + t.words, 0);
}

const indexable = new Map<string, boolean>();

// Used by both the ayah page (robots meta) and the sitemap, so they always agree.
export function isAyahIndexable(surah: number, ayah: number) {
  const key = `${surah}:${ayah}`;
  if (!indexable.has(key)) {
    indexable.set(key, ownedTafsirWords(getTafsir(surah, ayah)) >= MIN_OWNED_TAFSIR_WORDS);
  }
  return indexable.get(key)!;
}

// ---- Helpers -------------------------------------------------------------

export const surahUrl = (s: Surah, lang: Lang = 'english') =>
  lang === 'english' ? `/surah/${s.slug}` : `/surah/${s.slug}/${lang}`;
export const ayahUrl = (s: Surah, a: number) => `/surah/${s.slug}/ayat-${a}`;
export const paraUrl = (n: number) => `/para/${n}`;
export const ayahAudio = (s: number, a: number) =>
  `https://the-quran-project.github.io/Quran-Audio/Data/1/${s}_${a}.mp3`;

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
// The popular spelling (from the slug) is what people type into Google:
// "Surah Yaseen", "Surah Rahman", "Surah Juma".
export const popularName = (s: Surah) =>
  s.slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('-');
export const surahTitle = (s: Surah) => `Surah ${popularName(s)}`;
// "Surah Yaseen (Ya-Sin)" when the formal name differs, else "Surah Mulk".
const normalizeName = (n: string) =>
  n.toLowerCase().replace(/^(al|an|ar|as|at|ash|az|ad|adh)-/, '').replace(/['’\-]/g, '');
export const surahTitleFull = (s: Surah) =>
  normalizeName(s.name) === normalizeName(s.slug) ? surahTitle(s) : `${surahTitle(s)} (${s.name})`;

// Google shows ~60-65 title characters; use the longest suffix that still fits.
export const fitTitle = (main: string, suffixes: string[], max = 65) =>
  suffixes.map((x) => `${main} – ${x}`).find((t) => t.length <= max) ?? main;

export const truncate =(text: string, max: number) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
};
