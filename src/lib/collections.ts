// Curated reading collections. Each is a well-known devotional grouping that
// people search for by name ("panj surah", "manzil", "4 qul", "ayatul kursi").

export interface Passage {
  surah: number;
  from: number;
  to: number;
}

export interface Collection {
  slug: string;
  short: string;
  title: string;
  h1: string;
  arabicTitle?: string;
  description: string;
  intro: string[];
  passages: Passage[];
}

const whole = (...surahs: number[]): Passage[] => surahs.map((surah) => ({ surah, from: 1, to: Infinity }));

export const COLLECTIONS: Collection[] = [
  {
    slug: 'ayatul-kursi',
    short: 'Ayatul Kursi',
    title: 'Ayatul Kursi – Read Online with Translation & Audio',
    h1: 'Ayatul Kursi (Al-Baqarah 2:255)',
    arabicTitle: 'آيَةُ ٱلْكُرْسِيّ',
    description:
      'Read Ayatul Kursi (Surah Al-Baqarah 2:255), the Verse of the Throne, in Arabic with English, Urdu and Bangla translation, transliteration, audio and tafsir.',
    intro: [
      'Ayatul Kursi, "the Verse of the Throne", is ayah 255 of Surah Al-Baqarah. It sits in the third para (Tilkal Rusul) and describes the knowledge, power and sovereignty of Allah.',
    ],
    passages: [{ surah: 2, from: 255, to: 255 }],
  },
  {
    slug: 'last-2-ayat-baqarah',
    short: 'Last 2 Ayat of Baqarah',
    title: 'Last 2 Ayat of Surah Baqarah – Read Online (2:285-286)',
    h1: 'Last Two Ayat of Surah Al-Baqarah (2:285–286)',
    arabicTitle: 'آمَنَ ٱلرَّسُولُ',
    description:
      'Read the last two ayat of Surah Al-Baqarah (2:285-286, "Amanar Rasool") in Arabic with transliteration, English, Urdu and Bangla translation and audio.',
    intro: [
      'The closing two verses of Surah Al-Baqarah, beginning "Amanar Rasool", are ayat 285 and 286 of the second surah. They are in the third para and end with the well-known supplication "Rabbana la tu\'akhidhna".',
    ],
    passages: [{ surah: 2, from: 285, to: 286 }],
  },
  {
    slug: '4-qul',
    short: '4 Qul',
    title: '4 Qul – Read the Four Quls Online with Translation',
    h1: '4 Qul: The Four Quls of the Quran',
    arabicTitle: 'چار قل',
    description:
      'Read the 4 Qul – Surah Al-Kafirun, Al-Ikhlas, Al-Falaq and An-Nas – online in Arabic with transliteration, English, Urdu and Bangla translation and audio.',
    intro: [
      'The "4 Qul" (Char Qul) are the four short surahs that begin with the word "Qul" (Say): Al-Kafirun (109), Al-Ikhlas (112), Al-Falaq (113) and An-Nas (114). All four are in the 30th para.',
    ],
    passages: [
      { surah: 109, from: 1, to: 6 },
      { surah: 112, from: 1, to: 4 },
      { surah: 113, from: 1, to: 5 },
      { surah: 114, from: 1, to: 6 },
    ],
  },
  {
    slug: 'last-10-surahs',
    short: 'Last 10 Surahs',
    title: 'Last 10 Surahs of the Quran – Read Online with Translation',
    h1: 'Last 10 Surahs of the Quran (105–114)',
    description:
      'Read the last 10 surahs of the Quran (Al-Fil to An-Nas) online in Arabic with transliteration, English, Urdu and Bangla translation – the surahs most often memorised for salah.',
    intro: [
      'The last ten surahs, from Al-Fil (105) to An-Nas (114), are short Makki and Madani surahs at the end of the 30th para. They are usually the first surahs memorised for daily prayers.',
    ],
    passages: [105, 106, 107, 108, 109, 110, 111, 112, 113, 114].map((surah) => ({ surah, from: 1, to: Infinity })),
  },
  {
    slug: 'manzil',
    short: 'Manzil',
    title: 'Manzil Dua – Read Online in Arabic with Translation',
    h1: 'Manzil: Verses for Protection',
    arabicTitle: 'منزل',
    description:
      'Read the complete Manzil online – 33 ayat from Al-Fatiha, Al-Baqarah, Al-Imran, Al-Araf and more – in Arabic with transliteration, English, Urdu and Bangla translation.',
    intro: [
      'The Manzil is a compilation of verses from across the Quran that is widely printed as a single booklet and recited for protection. The selection below follows the standard printed Manzil.',
      'Each passage is shown with its surah and ayah numbers so you can open it in context.',
    ],
    passages: [
      { surah: 1, from: 1, to: 7 },
      { surah: 2, from: 1, to: 5 },
      { surah: 2, from: 163, to: 164 },
      { surah: 2, from: 255, to: 257 },
      { surah: 2, from: 284, to: 286 },
      { surah: 3, from: 18, to: 18 },
      { surah: 3, from: 26, to: 27 },
      { surah: 7, from: 54, to: 56 },
      { surah: 17, from: 110, to: 111 },
      { surah: 23, from: 115, to: 118 },
      { surah: 37, from: 1, to: 11 },
      { surah: 55, from: 33, to: 40 },
      { surah: 59, from: 21, to: 24 },
      { surah: 72, from: 1, to: 4 },
      { surah: 109, from: 1, to: 6 },
      { surah: 112, from: 1, to: 4 },
      { surah: 113, from: 1, to: 5 },
      { surah: 114, from: 1, to: 6 },
    ],
  },
  {
    slug: 'panj-surah',
    short: 'Panj Surah',
    title: 'Panj Surah – Read Online with Urdu & English Translation',
    h1: 'Panj Surah: The Five Surahs',
    arabicTitle: 'پنج سورہ',
    description:
      'Read Panj Surah online – Surah Yaseen, Ar-Rahman, Al-Waqiah, Al-Mulk and Al-Muzzammil – with Arabic text, Urdu and English translation and audio.',
    intro: [
      'Panj Surah ("five surahs") is a popular devotional booklet in Pakistan and India. The most common edition contains Surah Yaseen, Ar-Rahman, Al-Waqi\'ah, Al-Mulk and Al-Muzzammil.',
      'Some publishers add other surahs (such as Al-Fath, Al-Kahf or the four Quls), so your printed copy may differ. Open any surah below to read it in full with translation and audio.',
    ],
    passages: whole(36, 55, 56, 67, 73),
  },
];

// Ayahs whose dedicated collection page should be the canonical URL.
export const CANONICAL_OVERRIDES: Record<string, string> = {
  '2:255': '/ayatul-kursi',
};
