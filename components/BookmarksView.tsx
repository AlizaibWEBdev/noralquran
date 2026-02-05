
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Loader2, Headphones, ArrowRight, Trash2 } from 'lucide-react';
import { getAyahDetail } from '../services/quranService';
import { AyahDetail, Language } from '../types';
import { RECITER_ID } from '../constants';

interface Props {
  language: Language;
  arabicFontSize: number;
  onPlayAudio: (url: string, title: string, subtitle: string, id: string) => void;
}

const BookmarksView: React.FC<Props> = ({ language, arabicFontSize, onPlayAudio }) => {
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<AyahDetail[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      const saved = localStorage.getItem('nur_quran_bookmarks');
      if (!saved) {
        setBookmarkedAyahs([]);
        setLoading(false);
        return;
      }

      try {
        const bookmarks = JSON.parse(saved);
        const keys = Object.keys(bookmarks).filter(k => bookmarks[k]);
        
        const details = await Promise.all(
          keys.map(async (key) => {
            const [surahNo, ayahNo] = key.split(':').map(Number);
            return await getAyahDetail(surahNo, ayahNo);
          })
        );
        
        details.sort((a, b) => {
          if (a.surahNo !== b.surahNo) return a.surahNo - b.surahNo;
          return a.ayahNo - b.ayahNo;
        });

        setBookmarkedAyahs(details);
      } catch (error) {
        console.error("Failed to fetch bookmarks details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const removeBookmark = (surahNo: number, ayahNo: number) => {
    const key = `${surahNo}:${ayahNo}`;
    const saved = localStorage.getItem('nur_quran_bookmarks');
    if (saved) {
      const bookmarks = JSON.parse(saved);
      bookmarks[key] = false;
      localStorage.setItem('nur_quran_bookmarks', JSON.stringify(bookmarks));
      setBookmarkedAyahs(prev => prev.filter(a => !(a.surahNo === surahNo && a.ayahNo === ayahNo)));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Sacred Verses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-fade-in">
      <header className="mb-20 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto mb-8 shadow-2xl shadow-emerald-500/10 transition-transform hover:scale-105">
          <Bookmark size={36} fill="currentColor" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Your Bookmarks</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{bookmarkedAyahs.length} verses saved for reflection</p>
      </header>

      {bookmarkedAyahs.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] space-y-8 animate-slide-up">
          <p className="text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">Your bookmark collection is currently empty. Revisit your favorite Surahs to save verses.</p>
          <Link to="/" className="inline-flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-[10px] py-4 px-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-600/5 active:scale-95">
            Explore the Quran <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarkedAyahs.map((ayah) => (
            <div 
              key={`${ayah.surahNo}:${ayah.ayahNo}`}
              className="group bg-white dark:bg-slate-900/30 border border-slate-50 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-10 hover:border-emerald-500/30 hover:shadow-2xl transition-all duration-500 animate-slide-up"
            >
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-5">
                  <div className="flex items-center gap-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full">
                      {ayah.surahNo}:{ayah.ayahNo}
                    </span>
                    <Link to={`/surah/${ayah.surahNo}`} className="font-black text-slate-900 dark:text-white hover:text-emerald-600 transition-colors uppercase tracking-tight text-lg">
                      {ayah.surahName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => removeBookmark(ayah.surahNo, ayah.ayahNo)}
                      className="p-3 text-slate-300 hover:text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl active:scale-90"
                      title="Remove Bookmark"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={() => onPlayAudio(`https://the-quran-project.github.io/Quran-Audio/Data/${RECITER_ID}/${ayah.surahNo}_${ayah.ayahNo}.mp3`, ayah.surahName, `Verse ${ayah.ayahNo}`, `ayah-${ayah.surahNo}-${ayah.ayahNo}`)}
                      className="p-3 text-slate-300 hover:text-emerald-600 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-2xl active:scale-90"
                      title="Listen"
                    >
                      <Headphones size={18} />
                    </button>
                    <Link 
                      to={`/surah/${ayah.surahNo}`}
                      className="p-3 text-slate-300 hover:text-emerald-600 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-2xl active:scale-90"
                      title="View in Context"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>

                <div 
                  className="font-arabic text-right dark:text-slate-100 py-4 leading-relaxed [word-spacing:0.6rem] drop-shadow-sm"
                  style={{ 
                    fontSize: `clamp(1.6rem, 5vw, 2.2rem)`,
                    lineHeight: `3.6rem`
                  }}
                  dir="rtl"
                >
                  {ayah.arabic1}
                  <span className="inline-flex items-center justify-center text-emerald-600/30 dark:text-emerald-400/20 select-none mr-10 align-middle" style={{ fontSize: '1.8rem' }}>۝</span>
                </div>

                <div className="text-slate-600 dark:text-slate-400 font-medium italic border-r-4 border-emerald-500/10 pr-8 text-right leading-relaxed text-lg">
                  {ayah[language] || ayah.english}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksView;
