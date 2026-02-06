
import React from 'react';
import { UserStats } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: any) => void;
  userStats: UserStats;
  onOpenProfile: () => void;
  onToggleChat: () => void;
  activeStudyTime: number;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, userStats, onOpenProfile, onToggleChat, activeStudyTime }) => {
  const isBasic = userStats.plan === 'basic';
  const usage = userStats.openedContentIds?.length || 0;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* LADO ESQUERDO */}
        <div className="flex items-center gap-4 shrink-0">
          <div onClick={() => onNavigate('inicio')} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">N</div>
            <span className="text-lg font-black tracking-tighter text-neutral-900 dark:text-white hidden sm:inline">NexusBQ</span>
          </div>

          <button 
            onClick={() => onNavigate('inicio')}
            className={`p-2 rounded-xl transition-all ${currentView === 'inicio' ? 'text-blue-600 bg-blue-600/5' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
        </div>

        {/* CENTRO */}
        <div className="flex-grow flex justify-center">
          {userStats.studyActive && (
            <div onClick={() => onNavigate('foco')} className="flex items-center gap-3 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full cursor-pointer group">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-[11px] font-black font-mono text-orange-600 tracking-wider">{formatTime(activeStudyTime)}</span>
            </div>
          )}
        </div>

        {/* LADO DIREITO */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Botão de Chat */}
          <button 
            onClick={onToggleChat}
            className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 hover:text-blue-500 transition-all active:scale-90"
            title="Chat do Grupo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </button>

          <button 
            onClick={() => onNavigate('premium')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'premium' ? 'bg-blue-600 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <span className="hidden sm:inline">Premium</span>
          </button>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1"></div>

          <button onClick={onOpenProfile} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 group-hover:border-blue-600 transition-all shadow-sm bg-white">
               <img src={userStats.photoURL} alt="P" className="w-full h-full object-cover" />
            </div>
            <span className="hidden md:block text-[10px] font-black uppercase tracking-tight text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white">{userStats.displayName.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
