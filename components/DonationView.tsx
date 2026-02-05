
import React, { useState } from 'react';
import { Copy, Check, Heart, ShieldCheck, Zap, Globe } from 'lucide-react';

const DonationView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const usdtAddress = "0xb05df67a1c60f6014c64886f3d9a6eddb656c44e";

  const handleCopy = () => {
    navigator.clipboard.writeText(usdtAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-fade-in">
      <header className="mb-16 text-center space-y-6">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/20 rounded-[2.5rem] flex items-center justify-center text-rose-500 mx-auto shadow-2xl shadow-rose-500/10 transition-transform hover:scale-105">
          <Heart size={44} fill="currentColor" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Support the Mission</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">Keep the light of Quran free and accessible for everyone.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="p-10 bg-white dark:bg-slate-900/30 border border-slate-50 dark:border-slate-800 rounded-[3rem] space-y-6 shadow-xl shadow-slate-200/20">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight">Free & Forever</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Your contributions help us maintain the servers, scale our API infrastructure, and keep the application ad-free for the global Ummah.
          </p>
        </div>

        <div className="p-10 bg-white dark:bg-slate-900/30 border border-slate-50 dark:border-slate-800 rounded-[3rem] space-y-6 shadow-xl shadow-slate-200/20">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight">Sadaqah Jariyah</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Every verse read and every soul illuminated through this platform becomes a continuous charity for those who help keep it alive.
          </p>
        </div>
      </div>

      <div className="relative group p-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-[3.5rem] overflow-hidden">
        <div className="bg-white dark:bg-[#0b0f1a] rounded-[3.4rem] p-8 md:p-14 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em]">
            <ShieldCheck size={14} /> Cryptocurrency Only
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">USDT (BEP20) Address</h2>
            <p className="text-slate-400 text-sm font-medium">Please ensure you use the <strong>BNB Smart Chain (BEP20)</strong> network to avoid loss of funds.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl break-all font-mono text-sm md:text-lg text-slate-600 dark:text-slate-300 select-all tracking-tight">
              {usdtAddress}
            </div>
            
            <button 
              onClick={handleCopy}
              className={`flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${copied ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white shadow-slate-900/20'}`}
            >
              {copied ? (
                <> <Check size={18} /> Copied to Clipboard </>
              ) : (
                <> <Copy size={18} /> Copy Wallet Address </>
              )}
            </button>
          </div>

          <div className="pt-6">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">May Allah accept your generosity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationView;
