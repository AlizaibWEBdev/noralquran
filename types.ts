
export interface SurahSummary {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: 'Mecca' | 'Madina';
  totalAyah: number;
}

export interface AudioReciter {
  reciter: string;
  url: string;
  originalUrl: string;
}

export interface SurahDetail {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo: number;
  audio: Record<string, AudioReciter>;
  english: string[];
  arabic1: string[];
  arabic2: string[];
  bengali?: string[];
  urdu?: string[];
  turkish?: string[];
  uzbek?: string[];
}

export interface AyahDetail {
  surahName: string;
  surahNo: number;
  ayahNo: number;
  audio: Record<string, AudioReciter>;
  english: string;
  arabic1: string;
  arabic2: string;
  bengali?: string;
  urdu?: string;
  [key: string]: any;
}

export interface Tafsir {
  author: string;
  groupVerse: string | null;
  content: string;
}

export interface TafsirResponse {
  surahName: string;
  surahNo: number;
  ayahNo: number;
  tafsirs: Tafsir[];
}

export type Language = 'english' | 'bengali' | 'urdu' | 'turkish' | 'uzbek';
