
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, X, SkipBack, SkipForward, Headphones, Loader2 } from 'lucide-react';

interface Playlist {
  urls: string[];
  titles: string[];
  subtitles: string[];
  ids?: string[];
}

interface Props {
  playlist: Playlist;
  onClose: () => void;
  onTrackChange?: (index: number) => void;
}

const AudioPlayer: React.FC<Props> = ({ playlist, onClose, onTrackChange }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const nextAudioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isFullSurah = playlist.urls.length > 5 && new Set(playlist.titles).size === 1;
  const displayTitle = isFullSurah ? playlist.titles[0] : playlist.titles[currentIndex];
  const displaySubtitle = isFullSurah 
    ? `${currentIndex + 1}/${playlist.urls.length}`
    : playlist.subtitles[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    if (onTrackChange) onTrackChange(0);
  }, [playlist.urls[0]]);

  useEffect(() => {
    let isSubscribed = true;
    const audio = audioRef.current;
    
    if (audio) {
      setIsLoading(true);

      const startPlayback = async () => {
        try {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
            if (isSubscribed) {
              setIsPlaying(true);
              setIsLoading(false);
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') return;
          if (isSubscribed) {
            console.debug("Playback interrupted:", error.message);
            setIsPlaying(false);
            setIsLoading(false);
          }
        }
      };

      startPlayback();
      
      if (currentIndex < playlist.urls.length - 1 && nextAudioRef.current) {
        nextAudioRef.current.src = playlist.urls[currentIndex + 1];
        nextAudioRef.current.load();
      }

      if (onTrackChange) onTrackChange(currentIndex);
    }

    return () => {
      isSubscribed = false;
    };
  }, [currentIndex, playlist.urls[currentIndex]]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => {
          if (e.name !== 'AbortError') console.debug(e);
        });
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    if (currentIndex < playlist.urls.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkipForward = () => {
    if (currentIndex < playlist.urls.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handleSkipBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[110] px-4 pb-6 md:pb-8 animate-in slide-in-from-bottom-10 duration-500 ease-out">
      <div className="max-w-3xl mx-auto bg-white/98 dark:bg-slate-900/98 backdrop-blur-3xl border border-slate-200/50 dark:border-slate-800/80 rounded-[2.5rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden relative">
        
        {/* Mobile-visible Close Button (High Contrast) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 hover:text-rose-500 border border-slate-200 dark:border-slate-700 rounded-full transition-all z-20 md:hidden shadow-sm"
          aria-label="Close player"
        >
          <X size={20} />
        </button>

        <audio
          ref={audioRef}
          src={playlist.urls[currentIndex]}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
        />
        <audio ref={nextAudioRef} hidden />
        
        <div className="flex flex-col">
          <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 overflow-hidden group">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Seek bar"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-200 ease-linear shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
          </div>

          <div className="p-4 md:p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className={`w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/30`}>
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Headphones size={22} />}
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-sm md:text-base text-slate-900 dark:text-white leading-tight truncate tracking-tight pr-10 md:pr-0">
                  {displayTitle}
                </h4>
                <p className="text-[10px] md:text-xs text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest truncate mt-1">
                  {displaySubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={handleSkipBack}
                disabled={currentIndex === 0 && currentTime < 3}
                className={`p-2 transition-all ${currentIndex === 0 && currentTime < 3 ? 'text-slate-200 dark:text-slate-800' : 'text-slate-400 hover:text-emerald-600 active:scale-90'}`}
                aria-label="Previous track"
              >
                <SkipBack size={22} fill="currentColor" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl shadow-emerald-600/40 transition-all active:scale-95"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>

              <button 
                onClick={handleSkipForward}
                disabled={currentIndex === playlist.urls.length - 1}
                className={`p-2 transition-all ${currentIndex === playlist.urls.length - 1 ? 'text-slate-200 dark:text-slate-800' : 'text-slate-400 hover:text-emerald-600 active:scale-90'}`}
                aria-label="Next track"
              >
                <SkipForward size={22} fill="currentColor" />
              </button>
            </div>

            <div className="flex items-center gap-6 justify-end">
              <div className="hidden lg:flex items-center gap-3 text-[11px] font-black font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-emerald-600">{formatTime(currentTime)}</span>
                <span className="opacity-20">/</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <button 
                onClick={onClose}
                className="hidden md:flex p-3 text-slate-300 hover:text-rose-500 transition-all active:scale-90"
                aria-label="Close player"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
