
import { API_BASE } from '../constants';
import { SurahSummary, SurahDetail, AyahDetail, TafsirResponse } from '../types';

const cache: Record<string, any> = {};

const fetchWithCache = async <T>(url: string): Promise<T> => {
  if (cache[url]) return cache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  const data = await res.json();
  cache[url] = data;
  return data;
};

export const getSurahList = async (): Promise<SurahSummary[]> => {
  return fetchWithCache<SurahSummary[]>(`${API_BASE}/surah.json`);
};

export const getSurahDetail = async (surahNo: number): Promise<SurahDetail> => {
  return fetchWithCache<SurahDetail>(`${API_BASE}/${surahNo}.json`);
};

export const getAyahDetail = async (surahNo: number, ayahNo: number): Promise<AyahDetail> => {
  return fetchWithCache<AyahDetail>(`${API_BASE}/${surahNo}/${ayahNo}.json`);
};

export const getTafsir = async (surahNo: number, ayahNo: number): Promise<TafsirResponse> => {
  return fetchWithCache<TafsirResponse>(`${API_BASE}/tafsir/${surahNo}_${ayahNo}.json`);
};
