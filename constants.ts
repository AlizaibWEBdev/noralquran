
import { Language } from './types';

export const LANGUAGES: { label: string; value: Language }[] = [
  { label: 'English', value: 'english' },
  { label: 'Bengali', value: 'bengali' },
  { label: 'Urdu', value: 'urdu' },
  { label: 'Turkish', value: 'turkish' },
  { label: 'Uzbek', value: 'uzbek' },
];

export const RECITER_ID = "1"; // Default to Mishary Rashid Al Afasy

export const API_BASE = "https://quranapi.pages.dev/api";
