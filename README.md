# Nur al-Quran

Static Quran reader at [nural-quran.com](https://nural-quran.com), built with Astro and deployed on Vercel.
Every page is pre-rendered HTML with the full Arabic text, translation and metadata, so search engines can index it without running JavaScript.

## Commands

| Command | What it does |
| --- | --- |
| `npm run sync-data` | Downloads Quran text, translations, audio links and tafsir into `data/` (skips files already present; `--force` re-downloads) |
| `npm run dev` | Local dev server |
| `npm run build` | Runs `sync-data`, then builds `dist/` (~6,600 pages, ~1.5 min) |
| `npm run redirects` | Regenerates `vercel.json` after editing slugs or aliases in `src/lib/names.ts` |
| `python -I scripts/audit-dist.py` | SEO audit of `dist/`: broken links, duplicate titles/descriptions, H1s, sitemap vs. noindex |

Requires Node 22.12+.

## Pages

| URL | Count | Content |
| --- | --- | --- |
| `/` | 1 | All surahs, paras, collections |
| `/surah/yaseen` | 114 | Arabic, transliteration, English (Saheeh International), facts, FAQ, audio |
| `/surah/yaseen/urdu`, `/surah/yaseen/bangla` | 228 | Arabic with Urdu (Jalandhry) or Bangla (Muhiuddin Khan) translation |
| `/surah/yaseen/ayat-1` | 6,236 | One verse in all three translations + tafsir (Ibn Kathir, Ma'ariful Qur'an, Tazkirul Quran) |
| `/para`, `/para/1`–`/para/30` | 31 | Each juz with Urdu + English translation |
| `/ayatul-kursi`, `/panj-surah`, `/manzil`, `/4-qul`, `/last-10-surahs`, `/last-2-ayat-baqarah` | 6 | Curated collections (`src/lib/collections.ts`) |

Slugs use the spelling people search for most (`yaseen`, `rahman`, `juma`). Other spellings and surah numbers 301-redirect to the canonical URL (`/surah/yasin`, `/surah/36` → `/surah/yaseen`), and `/juz/N` → `/para/N`.

## Thin-content rule for ayah pages

Neighbouring ayahs often share one block of tafsir (e.g. Ibn Kathir explains 36:1–7 together). That commentary is shown in full only on the first ayah of its group; the others link to it.

An ayah page is **indexed** only if it carries at least 250 words of commentary that appears on no other page (`MIN_OWNED_TAFSIR_WORDS` in `src/lib/quran.ts`). Pages below that are still live for readers but are `noindex, follow` and left out of the sitemap. The same function drives both the robots tag and the sitemap, so they cannot disagree.

The source API sometimes returns a neighbouring group's tafsir for a verse it does not cover; those entries are dropped at build time.

## After deploying

1. In Google Search Console, submit `https://nural-quran.com/sitemap.xml`.
2. Use URL Inspection → Request indexing for the homepage and the highest-value pages (e.g. `/surah/yaseen`, `/surah/mulk`, `/ayatul-kursi`, `/panj-surah`, `/para/1`).
3. Watch Pages → "Why pages aren't indexed". "Excluded by noindex" for ayah pages is expected.
