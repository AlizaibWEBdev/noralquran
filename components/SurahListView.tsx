
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, BookOpen, Star } from 'lucide-react';
import { getSurahList } from '../services/quranService';
import { SurahSummary, Language } from '../types';

interface Props {
  language: Language;
}

const SurahListView: React.FC<Props> = ({ language }) => {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const data = await getSurahList();
        setSurahs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => 
      s.surahName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.surahNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (surahs.indexOf(s) + 1).toString() === searchQuery
    );
  }, [surahs, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Illuminating Verses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16 animate-fade-in">
      <div className="text-center space-y-10">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
            Nur <span className="text-emerald-600">al-Quran</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">The Noble Word, illuminated.</p>
        </div>
        
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by name, number, or meaning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 md:py-6 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-200/20 dark:shadow-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all text-lg placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurahs.map((surah) => {
          const num = surahs.indexOf(surah) + 1;
          const isMeccan = surah.revelationPlace === 'Mecca';
          return (
            <Link 
              key={num}
              to={`/surah/${num}`}
              className="group relative p-6 bg-white dark:bg-slate-900/30 border border-slate-50 dark:border-slate-800 rounded-[2rem] hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen size={120} className="text-emerald-600 rotate-12" />
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <span className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                    {num}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{surah.surahName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-300">{surah.totalAyah} Ayahs</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                      <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600/60">{surah.revelationPlace}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-arabic text-2xl text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors">
                    {surah.surahNameArabic}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {filteredSurahs.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Search size={32} />
          </div>
          <p className="text-slate-400 font-medium">No Surahs match your search. Try another term.</p>
        </div>
      )}
    </div>
  );
};

export default SurahListView;
