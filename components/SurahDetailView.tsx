
import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Info, Loader2, X, Bookmark, Headphones, AlertCircle, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSurahDetail, getTafsir } from '../services/quranService';
import { SurahDetail, Language, TafsirResponse } from '../types';
import { RECITER_ID } from '../constants';

interface Props {
  language: Language;
  arabicFontSize: number;
  isReadingMode: boolean;
  activeAudioId?: string;
  onPlayAudio: (url: string, title: string, subtitle: string, id: string) => void;
  onPlayPlaylist: (urls: string[], titles: string[], subtitles: string[], ids?: string[]) => void;
  onVisitSurah?: (surahNo: number, surahName: string) => void;
}

const AyahNumber = memo(({ ayahNo }: { ayahNo: number }) => (
  <span className="ayah-symbol-container select-none">
    <span className="ayah-symbol">۝</span>
    <span className="ayah-number-text">{ayahNo}</span>
  </span>
));

const AyahRowNormal = memo(({
  arabic,
  translation,
  ayahNo,
  surahNo,
  surahName,
  isActive,
  arabicFontSize,
  onPlay,
  onTafsir,
  isTafsirOpen,
  isBookmarked,
  onToggleBookmark
}: any) => {
  const ayahId = `ayah-${surahNo}-${ayahNo}`;
  
  return (
    <div
      id={ayahId}
      className={`group transition-all duration-700 rounded-[2.5rem] relative ${
        isActive 
          ? 'bg-emerald-500/[0.04] dark:bg-emerald-400/[0.04] ring-1 ring-emerald-500/10 p-6 md:p-10 z-10 shadow-lg' 
          : 'py-8 px-4 border-b border-slate-50 dark:border-slate-800/30'
      }`}
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>
            {surahNo}:{ayahNo}
          </span>

          <div className="flex items-center gap-1">
            <button onClick={() => onToggleBookmark(ayahNo)} className={`p-2 rounded-xl transition-all ${isBookmarked ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-300 hover:text-emerald-600'}`}>
              <Bookmark size={17} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button onClick={() => onTafsir(ayahNo)} className={`p-2 rounded-xl transition-all ${isTafsirOpen ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-emerald-600'}`}>
              <Info size={17} />
            </button>
            <button 
              onClick={() => onPlay(`https://the-quran-project.github.io/Quran-Audio/Data/${RECITER_ID}/${surahNo}_${ayahNo}.mp3`, surahName, `Verse ${ayahNo}`, ayahId)} 
              className={`p-2 rounded-xl transition-all ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-emerald-600'}`}
            >
              <Headphones size={17} />
            </button>
          </div>
        </div>

        <div 
          className={`font-arabic text-right transition-all duration-700 ${isActive ? 'text-emerald-900 dark:text-emerald-50' : 'text-slate-800 dark:text-slate-100'}`}
          style={{ fontSize: `clamp(${arabicFontSize * 0.75}rem, ${arabicFontSize * 1.2}vw, ${arabicFontSize}rem)` }}
          dir="rtl"
        >
          {arabic}
          <AyahNumber ayahNo={ayahNo} />
        </div>

        <div className={`transition-all duration-700 border-r-2 pr-6 text-right text-base md:text-lg leading-relaxed ${isActive ? 'border-emerald-500 text-slate-900 dark:text-white font-medium' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}>
          {translation}
        </div>
      </div>
    </div>
  );
});

const SkeletonLoader = () => (
  <div className="space-y-16 animate-pulse py-12">
    {[1, 2, 3].map(i => (
      <div key={i} className="space-y-8">
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-24 ml-auto"></div>
        <div className="h-16 bg-slate-50 dark:bg-slate-900 rounded-[2rem] w-full"></div>
        <div className="h-8 bg-slate-50 dark:bg-slate-900 rounded-full w-3/4 ml-auto"></div>
      </div>
    ))}
  </div>
);

const SurahDetailView: React.FC<Props> = ({ language, isReadingMode, arabicFontSize, activeAudioId, onPlayAudio, onPlayPlaylist, onVisitSurah }) => {
  const { id } = useParams<{ id: string }>();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAyahTafsir, setSelectedAyahTafsir] = useState<TafsirResponse | null>(null);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  
  const [activeTranslation, setActiveTranslation] = useState<{ text: string, ayahNo: number } | null>(null);
  const [arrowX, setArrowX] = useState<number>(0);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (activeAudioId) {
      const element = document.getElementById(activeAudioId);
      if (element) {
        const viewportHeight = window.innerHeight;
        const elementRect = element.getBoundingClientRect();
        const elementCenter = elementRect.top + window.scrollY + elementRect.height / 2;
        const scrollPosition = elementCenter - viewportHeight / 2;
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [activeAudioId]);

  useEffect(() => {
    const saved = localStorage.getItem('nur_quran_bookmarks');
    if (saved) try { setBookmarks(JSON.parse(saved)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('nur_quran_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    const fetchSurah = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getSurahDetail(parseInt(id));
        setSurah(data);
        if (onVisitSurah) onVisitSurah(data.surahNo, data.surahName);
      } catch (err) {
        setError("Unable to connect to the Quranic Library. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchSurah();
    window.scrollTo(0, 0);
  }, [id, onVisitSurah]);

  const toggleBookmark = useCallback((ayahNo: number) => {
    if (!surah) return;
    const key = `${surah.surahNo}:${ayahNo}`;
    setBookmarks(prev => ({ ...prev, [key]: !prev[key] }));
  }, [surah]);

  const handleTafsirClick = async (ayahNo: number) => {
    if (!id) return;
    try {
      const data = await getTafsir(parseInt(id), ayahNo);
      setSelectedAyahTafsir(data);
    } catch (e) {}
  };

  const playBackgroundAudio = (url: string) => {
    if (backgroundAudio.current) {
      backgroundAudio.current.pause();
      backgroundAudio.current.currentTime = 0;
    }
    backgroundAudio.current = new Audio(url);
    backgroundAudio.current.play().catch(e => {
        if (e.name !== 'AbortError') console.debug("Autoplay blocked", e);
    });
  };

  const handleAyahPressStart = (url: string) => {
    pressTimer.current = setTimeout(() => playBackgroundAudio(url), 500);
  };

  const handleAyahPressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current as any);
      pressTimer.current = null;
    }
  };

  const handleDoubleClick = (e: React.MouseEvent | React.TouchEvent, text: string, ayahNo: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setArrowX(rect.left + rect.width / 2);
    setActiveTranslation({ text, ayahNo });
  };

  const handlePlayFullSurah = () => {
    if (!surah) return;
    const urls: string[] = [];
    const titles: string[] = [];
    const subtitles: string[] = [];
    const ids: string[] = [];
    
    for (let i = 1; i <= surah.totalAyah; i++) {
      urls.push(`https://the-quran-project.github.io/Quran-Audio/Data/${RECITER_ID}/${surah.surahNo}_${i}.mp3`);
      titles.push(surah.surahName);
      subtitles.push(`Verse ${i} of ${surah.totalAyah}`);
      ids.push(`ayah-${surah.surahNo}-${i}`);
    }
    onPlayPlaylist(urls, titles, subtitles, ids);
  };

  if (loading) return <div className="max-w-4xl mx-auto px-6"><SkeletonLoader /></div>;
  if (error || !surah) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 py-20">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center">
        <AlertCircle size={40} />
      </div>
      <p className="text-slate-500 font-bold max-w-xs text-center leading-relaxed">{error}</p>
      <Link to="/" className="px-8 py-3 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Back to Library</Link>
    </div>
  );

  const translations = surah[language] || surah.english;

  return (
    <div className={`relative min-h-screen page-transition ${(!isReadingMode && selectedAyahTafsir) ? 'lg:pr-[480px]' : ''}`}>
      {/* Dynamic Top Translation Bar - Dark Mode Always & Full Text Display */}
      {isReadingMode && activeTranslation && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-slate-950/98 backdrop-blur-2xl border-b border-emerald-500/20 animate-slide-down shadow-2xl">
          <div className="max-w-4xl mx-auto px-5 py-6 flex items-start justify-between gap-6 relative">
            <div className="flex-1">
              <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-2">Verse {activeTranslation.ayahNo} Translation</span>
              <p className="text-base md:text-xl font-bold text-white leading-relaxed tracking-tight">
                {activeTranslation.text}
              </p>
            </div>
            <button 
              onClick={() => setActiveTranslation(null)}
              className="p-3 bg-white/10 text-white/70 hover:text-white hover:bg-white/20 rounded-2xl transition-all active:scale-90 shrink-0 mt-1"
              aria-label="Close translation"
            >
              <X size={20} />
            </button>
            <div 
              className="absolute -bottom-1.5 w-3 h-3 bg-slate-950 border-r border-b border-emerald-500/20 rotate-45 transition-all duration-500 ease-out hidden md:block"
              style={{ left: `${arrowX}px`, transform: 'translateX(-50%) rotate(45deg)' }}
            />
          </div>
        </div>
      )}

      <div className={`${isReadingMode ? 'max-w-full lg:max-w-[1400px]' : 'max-w-4xl'} mx-auto px-4 md:px-12 ${isReadingMode ? 'py-4' : 'py-12'}`}>
        
        {/* Refined Bismillah Block (More Compact) */}
        {surah.surahNo !== 9 && (
          <div className="text-center select-none mb-6 pt-2 group">
            <p className="font-arabic text-2xl md:text-4xl text-slate-900 dark:text-slate-100 block py-4 md:py-6 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] rounded-2xl border border-emerald-500/5 transition-all">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        <header className={`${isReadingMode ? 'mb-6' : 'mb-20'} text-center space-y-4`}>
          <div className="flex flex-col items-center gap-4">
            <h1 className={`${isReadingMode ? 'text-3xl md:text-5xl' : 'text-5xl md:text-7xl'} font-arabic font-bold text-slate-900 dark:text-white leading-tight drop-shadow-sm`}>
              {surah.surahNameArabicLong || surah.surahNameArabic}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <button 
                onClick={handlePlayFullSurah}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <PlayCircle size={16} /> Listen
              </button>
              {isReadingMode && (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-4 py-2.5 rounded-full border border-slate-200/50 dark:border-slate-800">
                  {surah.surahName} • {surah.totalAyah} Verses
                </span>
              )}
            </div>
          </div>

          {!isReadingMode && (
            <div className="pt-6 space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase">{surah.surahName}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{surah.surahNameTranslation} • {surah.revelationPlace} Revelation</p>
            </div>
          )}
        </header>

        {isReadingMode ? (
          <div 
            className="font-arabic dark:text-slate-100 transition-all duration-700 mushaf-layout select-none w-full pb-64"
            style={{ 
              fontSize: 'clamp(1.6rem, 7vw, 3.2rem)', 
            }} 
            dir="rtl"
          >
            {surah.arabic1.map((arabic, index) => {
              const ayahNo = index + 1;
              const ayahId = `ayah-${surah.surahNo}-${ayahNo}`;
              const audioUrl = `https://the-quran-project.github.io/Quran-Audio/Data/${RECITER_ID}/${surah.surahNo}_${ayahNo}.mp3`;
              const isActive = activeAudioId === ayahId;
              
              let cleanedArabic = arabic.trim();
              if (surah.surahNo === 1 && index === 0) {
                 cleanedArabic = cleanedArabic.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\s*/, '');
                 if (!cleanedArabic) return null;
              }

              const words = cleanedArabic.split(/\s+/);
              const lastWord = words.pop();
              const leadingWords = words.join(' ');

              return (
                <React.Fragment key={index}>
                  <span 
                    id={ayahId}
                    className={`cursor-pointer transition-all duration-300 inline rounded-xl px-1 py-0.5 align-baseline ${isActive ? 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/20' : 'hover:text-emerald-600'}`}
                    onMouseDown={() => handleAyahPressStart(audioUrl)}
                    onMouseUp={handleAyahPressEnd}
                    onMouseLeave={handleAyahPressEnd}
                    onTouchStart={() => handleAyahPressStart(audioUrl)}
                    onTouchEnd={handleAyahPressEnd}
                    onDoubleClick={(e) => handleDoubleClick(e, translations[index], ayahNo)}
                  >
                    {leadingWords}{' '}
                    <span className="inline-block whitespace-nowrap align-baseline">
                      {lastWord}
                      <AyahNumber ayahNo={ayahNo} />
                    </span>
                  </span>
                  {' '}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/40 pb-32">
            {surah.arabic1.map((arabic, index) => {
              const ayahNo = index + 1;
              return (
                <AyahRowNormal
                  key={index}
                  arabic={arabic}
                  translation={translations[index]}
                  ayahNo={ayahNo}
                  surahNo={surah.surahNo}
                  surahName={surah.surahName}
                  arabicFontSize={arabicFontSize}
                  isActive={activeAudioId === `ayah-${surah.surahNo}-${ayahNo}`}
                  onPlay={onPlayAudio}
                  onTafsir={handleTafsirClick}
                  isTafsirOpen={selectedAyahTafsir?.ayahNo === ayahNo}
                  isBookmarked={bookmarks[`${surah.surahNo}:${ayahNo}`]}
                  onToggleBookmark={toggleBookmark}
                />
              );
            })}
          </div>
        )}
      </div>

      {!isReadingMode && selectedAyahTafsir && (
        <>
          <aside className="fixed inset-y-0 right-0 w-full lg:w-[480px] bg-white dark:bg-[#080b14] z-[120] shadow-2xl transition-all flex flex-col border-l border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#080b14]">
              <div>
                <h3 className="text-lg font-black tracking-tight">{surah.surahName}</h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-0.5">Ayah {selectedAyahTafsir.ayahNo}</p>
              </div>
              <button onClick={() => setSelectedAyahTafsir(null)} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90" aria-label="Close commentary"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              {selectedAyahTafsir.tafsirs.map((t, i) => (
                <section key={i} className="prose prose-slate dark:prose-invert max-w-none">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 mb-4 border-b border-emerald-500/10 pb-1.5">{t.author}</h4>
                  <div className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium tracking-tight">
                    <ReactMarkdown>{t.content}</ReactMarkdown>
                  </div>
                </section>
              ))}
            </div>
          </aside>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[110] lg:hidden animate-fade-in" onClick={() => setSelectedAyahTafsir(null)} />
        </>
      )}
    </div>
  );
};

export default SurahDetailView;
