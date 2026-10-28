// Data-driven copy for surah pages. Every sentence is built from facts that
// differ per surah (position, length, paras, pages, sajda, neighbours), so no
// two pages share boilerplate paragraphs.
import { ORDINAL, PARA_NAMES } from './names';
import { TRANSLATIONS, getSurah, paraUrl, plural, popularName, surahTitle, surahUrl, type Lang, type Surah } from './quran';

const paraLabel = (n: number) => `Para ${n} (${PARA_NAMES[n - 1].name})`;
const list = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export function aliasText(s: Surah) {
  const seen = new Set([popularName(s).toLowerCase().replace(/[-']/g, '')]);
  return [s.name, ...s.aliases]
    .map((a) => a.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('-'))
    .filter((a) => {
      const k = a.toLowerCase().replace(/[-']/g, '');
      return !seen.has(k) && seen.add(k);
    })
    .slice(0, 4);
}

export function paraText(s: Surah) {
  return s.juz.length === 1
    ? `It is in ${paraLabel(s.juz[0])}`
    : `It begins in ${paraLabel(s.juz[0])} and continues to ${paraLabel(s.juz[s.juz.length - 1])}`;
}

export function surahDescription(s: Surah, lang: Lang) {
  const t = TRANSLATIONS[lang];
  const base = `${surahTitle(s)} (${s.arabicName}) is the ${ORDINAL(s.number)} surah of the Quran, a ${s.revelation} surah with ${s.ayahCount} ayat.`;
  return lang === 'english'
    ? `Read ${surahTitle(s)} online in Arabic with English translation, transliteration and audio. ${base}`
    : `Read ${surahTitle(s)} with ${t.label} translation (${t.translator}) online, with Arabic text and audio. ${base}`;
}

export function aboutSurah(s: Surah): string[] {
  const prev = s.number > 1 ? getSurah(s.number - 1) : null;
  const next = s.number < 114 ? getSurah(s.number + 1) : null;
  const aliases = aliasText(s);
  const pageRange = s.pages[0] === s.pages[1] ? `page ${s.pages[0]}` : `pages ${s.pages[0]}–${s.pages[1]}`;

  const p1 =
    `${surahTitle(s)} (${s.arabicName}) is the ${ORDINAL(s.number)} surah of the Holy Quran. ` +
    (s.meaning ? `Its name means "${s.meaning}". ` : '') +
    `It is a ${s.revelation} surah, ` +
    `${s.revelation === 'Makki' ? 'revealed in Makkah before the Hijrah' : 'revealed in Madinah after the Hijrah'}, ` +
    `and has ${plural(s.ayahCount, 'ayah')} in ${plural(s.rukuCount, 'ruku')}.` +
    (aliases.length ? ` It is also written as ${list(aliases.map((a) => `Surah ${a}`))}.` : '');

  const p2 =
    `${paraText(s)}, and covers ${pageRange} of the standard 604-page Madani mushaf. ` +
    (prev ? `It comes after Surah ${popularName(prev)}` : 'It opens the Quran') +
    (next ? ` and before Surah ${popularName(next)}.` : ' and is the final surah of the Quran.') +
    (s.sajdaAyahs.length
      ? ` It contains ${s.sajdaAyahs.length === 1 ? 'a verse of prostration (sajdah) at ayah' : 'verses of prostration at ayat'} ${list(s.sajdaAyahs.map(String))}.`
      : '');

  return [p1, p2];
}

export function surahFaq(s: Surah, lang: Lang) {
  const t = surahTitle(s);
  const items = [
    { q: `How many ayat are in ${t}?`, a: `${t} has ${plural(s.ayahCount, 'ayah')} (verses) and ${plural(s.rukuCount, 'ruku')}.` },
    { q: `Is ${t} Makki or Madani?`, a: `${t} is a ${s.revelation} surah, ${s.revelation === 'Makki' ? 'revealed in Makkah' : 'revealed in Madinah'}.` },
    { q: `In which para is ${t}?`, a: `${paraText(s)}. ${t} is the ${ORDINAL(s.number)} surah of the Quran.` },
  ];
  if (s.meaning) {
    items.push({ q: `What does the name "${popularName(s)}" mean?`, a: `"${popularName(s)}" (${s.arabicName}) is usually translated as "${s.meaning}".` });
  }
  if (s.sajdaAyahs.length) {
    items.push({
      q: `Is there a sajdah in ${t}?`,
      a: `Yes. The verse of prostration is at ayah ${list(s.sajdaAyahs.map(String))}.`,
    });
  }
  items.push({
    q: `Can I listen to ${t} online?`,
    a: `Yes. Press "Listen" to play the full surah verse by verse in the voice of Mishary Rashid Alafasy, or tap Play on any ayah to start from there. The current verse is highlighted as it plays.`,
  });
  if (lang !== 'english') {
    const tr = TRANSLATIONS[lang];
    items.push({
      q: `Whose ${tr.label} translation of ${t} is this?`,
      a: `The ${tr.label} translation on this page is by ${tr.translator}, shown under the Arabic text of every ayah.`,
    });
  }
  return items;
}

export function surahFacts(s: Surah) {
  return [
    ['Surah number', String(s.number)],
    ['Arabic name', s.arabicName],
    ...(s.meaning ? [['Meaning', s.meaning]] : []),
    ['Revelation', s.revelation],
    ['Ayat', String(s.ayahCount)],
    ['Rukus', String(s.rukuCount)],
    ['Para (juz)', s.juz.map((j) => ({ text: `Para ${j}`, href: paraUrl(j) }))],
    ['Mushaf pages', s.pages[0] === s.pages[1] ? String(s.pages[0]) : `${s.pages[0]}–${s.pages[1]}`],
    ['Sajdah', s.sajdaAyahs.length ? `Ayah ${s.sajdaAyahs.join(', ')}` : 'None'],
  ] as [string, string | { text: string; href: string }[]][];
}

export { surahUrl };
