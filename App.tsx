
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Languages, BookOpen, Settings, X, Type, Bookmark, Book, ArrowLeft, ArrowUp, Clock, Heart } from 'lucide-react';
import { Language } from './types';
import { LANGUAGES } from './constants';
import SurahListView from './components/SurahListView';
import SurahDetailView from './components/SurahDetailView';
import BookmarksView from './components/BookmarksView';
import DonationView from './components/DonationView';
import AudioPlayer from './components/AudioPlayer';

const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 md:bottom-28 md:right-10 z-[90] p-4 bg-white dark:bg-slate-800 text-emerald-600 rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
};

const Header: React.FC<{
  isReadingMode: boolean;
  toggleReadingMode: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsRef: React.RefObject<HTMLDivElement>;
  darkMode: boolean;
  toggleDarkMode: () => void;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  lastRead: { surahNo: number; surahName: string } | null;
}> = ({ 
  isReadingMode, toggleReadingMode, isSettingsOpen, setIsSettingsOpen, 
  settingsRef, darkMode, toggleDarkMode, arabicFontSize, setArabicFontSize, 
  language, setLanguage, lastRead
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 10) {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out transform ${showHeader ? 'translate-y-0' : '-translate-y-full'} ${isScrolled ? 'glass-header shadow-xl shadow-slate-900/5' : 'bg-transparent'} border-b border-transparent ${isScrolled ? 'border-slate-200/50 dark:border-slate-800/50' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          {!isHome && (
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-2xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <BookOpen size={22} />
            </div>
            <span className="text-xl font-black tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Nur al-Quran</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            to="/donate"
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Heart size={14} fill="currentColor" /> Donate
          </Link>
          
          <button
            onClick={toggleReadingMode}
            className={`p-2.5 rounded-2xl transition-all ${isReadingMode ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
            title={isReadingMode ? "List View" : "Mushaf View"}
          >
            <Book size={18} />
          </button>
          <Link
            to="/bookmarks"
            className="p-2.5 rounded-2xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            title="Bookmarks"
          >
            <Bookmark size={18} />
          </Link>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2.5 rounded-2xl transition-all ${isSettingsOpen ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
            title="Settings"
            aria-expanded={isSettingsOpen}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <div 
          ref={settingsRef}
          className="absolute top-full right-6 mt-4 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-500 z-[110]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Settings</h3>
            <button onClick={() => setIsSettingsOpen(false)} className="p-1.5 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-3">
                <Moon size={16} className="text-slate-400" /> Dark Mode
              </span>
              <button 
                onClick={toggleDarkMode}
                className={`w-10 h-5 rounded-full transition-all relative ${darkMode ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${darkMode ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-3">
                  <Type size={16} className="text-slate-400" /> Arabic Size
                </span>
                <span className="text-[10px] font-black text-emerald-600">{arabicFontSize.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="1.5" 
                max="4.0" 
                step="0.1" 
                disabled={isReadingMode}
                value={isReadingMode ? 2.5 : arabicFontSize}
                onChange={(e) => setArabicFontSize(parseFloat(e.target.value))}
                className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${isReadingMode ? 'opacity-30' : 'bg-slate-200 dark:bg-slate-800'}`}
              />
            </div>

            <div className="space-y-4">
              <span className="text-sm font-bold flex items-center gap-3">
                <Languages size={16} className="text-slate-400" /> Translation
              </span>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${language === lang.value ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'english';
  });
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    return parseFloat(localStorage.getItem('arabicFontSize') || '2.5');
  });
  const [isReadingMode, setIsReadingMode] = useState<boolean>(() => {
    return localStorage.getItem('readingMode') === 'true';
  });
  const [lastRead, setLastRead] = useState<{ surahNo: number; surahName: string } | null>(() => {
    const saved = localStorage.getItem('last_read');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const [currentPlaylist, setCurrentPlaylist] = useState<{ urls: string[]; titles: string[]; subtitles: string[]; ids?: string[] } | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => localStorage.setItem('language', language), [language]);
  useEffect(() => localStorage.setItem('arabicFontSize', arabicFontSize.toString()), [arabicFontSize]);
  useEffect(() => localStorage.setItem('readingMode', isReadingMode.toString()), [isReadingMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleReadingMode = () => setIsReadingMode(!isReadingMode);

  const handlePlayAudio = useCallback((url: string, title: string, subtitle: string, id?: string) => {
    setCurrentPlaylist({ urls: [url], titles: [title], subtitles: [subtitle], ids: id ? [id] : undefined });
    setActiveAudioId(id);
  }, []);

  const handlePlayPlaylist = useCallback((urls: string[], titles: string[], subtitles: string[], ids?: string[]) => {
    setCurrentPlaylist({ urls, titles, subtitles, ids });
    setActiveAudioId(ids?.[0]);
  }, []);

  const handleTrackChange = useCallback((index: number) => {
    if (currentPlaylist?.ids) {
      setActiveAudioId(currentPlaylist.ids[index]);
    }
  }, [currentPlaylist]);

  const saveLastRead = useCallback((surahNo: number, surahName: string) => {
    const data = { surahNo, surahName };
    setLastRead(data);
    localStorage.setItem('last_read', JSON.stringify(data));
  }, []);

  return (
    <HashRouter>
      <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'dark:bg-[#0b0f1a] dark:text-slate-100' : 'bg-[#fcfcf9] text-slate-900'}`}>
        <Header 
          isReadingMode={isReadingMode}
          toggleReadingMode={toggleReadingMode}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          settingsRef={settingsRef}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          arabicFontSize={arabicFontSize}
          setArabicFontSize={setArabicFontSize}
          language={language}
          setLanguage={setLanguage}
          lastRead={lastRead}
        />

        <main className="flex-1 pt-16 md:pt-20 pb-32">
          <Routes>
            <Route path="/" element={<SurahListView language={language} />} />
            <Route path="/bookmarks" element={<BookmarksView language={language} arabicFontSize={arabicFontSize} onPlayAudio={handlePlayAudio} />} />
            <Route path="/donate" element={<DonationView />} />
            <Route 
              path="/surah/:id" 
              element={<SurahDetailView language={language} isReadingMode={isReadingMode} arabicFontSize={arabicFontSize} activeAudioId={activeAudioId} onPlayAudio={handlePlayAudio} onPlayPlaylist={handlePlayPlaylist} onVisitSurah={saveLastRead} />} 
            />
          </Routes>
        </main>

        <ScrollToTop />

        {currentPlaylist && (
          <AudioPlayer 
            playlist={currentPlaylist} 
            onClose={() => {
              setCurrentPlaylist(null);
              setActiveAudioId(undefined);
            }} 
            onTrackChange={handleTrackChange}
          />
        )}
      </div>
    </HashRouter>
  );
};

export default App;
