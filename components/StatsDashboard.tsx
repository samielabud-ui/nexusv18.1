
import React, { useMemo } from 'react';
import { UserStats } from '../types';

interface StatsDashboardProps {
  stats: UserStats;
  allUsers: any[];
  onNavigate: (view: any) => void;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, allUsers, onNavigate }) => {
  // Regra Obrigatória: O usuário só vê o ranking do seu ciclo
  const rankingCycle = stats.ciclo;

  const filteredRanking = useMemo(() => {
    return allUsers
      .filter(u => u.ciclo === rankingCycle)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  }, [allUsers, rankingCycle]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}min`;
  };

  const quickActions = [
    { id: 'questoes', label: 'Questões', icon: '❓', color: 'bg-blue-500' },
    { id: 'pbl', label: 'PBL', icon: '📄', color: 'bg-emerald-500' },
    { id: 'morfo', label: 'Morfo', icon: '🧠', color: 'bg-purple-500' },
    { id: 'hp', label: 'HP', icon: '🩺', color: 'bg-rose-500' },
    { id: 'foco', label: 'Foco', icon: '⏱️', color: 'bg-orange-500' },
    { id: 'manuais', label: 'Manuais', icon: '📚', color: 'bg-indigo-600' },
  ];

  return (
    <div className="animate-in fade-in duration-700 py-6 space-y-8">
      {/* 1. Header Minimalista */}
      <section className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-6">
        <div>
          <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.3em] mb-1">Status do Estudante</p>
          <h1 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">
            Bem-vindo de volta, <span className="text-blue-600">{stats.displayName.split(' ')[0]}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-neutral-500">
            {stats.ciclo}
          </div>
          {stats.isPremium && (
            <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
              Premium {stats.premiumEmoji}
            </div>
          )}
        </div>
      </section>

      {/* 2. Seção de Acesso Rápido */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {quickActions.map(action => (
          <button 
            key={action.id}
            onClick={() => onNavigate(action.id as any)}
            className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-blue-500 transition-all group shadow-sm"
          >
            <div className={`w-8 h-8 ${action.color} rounded-xl flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform shrink-0`}>
              {action.icon}
            </div>
            <div className="text-left min-w-0">
              <p className="text-[9px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-widest leading-none mb-0.5">Ir para</p>
              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{action.label}</p>
            </div>
          </button>
        ))}
      </section>

      {/* 3. Progresso Resumido */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] flex flex-col justify-center items-center shadow-sm">
          <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-700 uppercase tracking-widest mb-2">Questões</span>
          <p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.totalAnswered}</p>
          <div className="mt-2 flex gap-3 text-[9px] font-bold">
            <span className="text-emerald-500">+{stats.totalCorrect}</span>
            <span className="text-rose-500">-{stats.totalErrors}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] flex flex-col justify-center items-center shadow-sm">
          <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-700 uppercase tracking-widest mb-2">Foco Hoje</span>
          <p className="text-3xl font-black text-neutral-900 dark:text-white">{formatTime(stats.dailyStudyTime)}</p>
          <div className="mt-1 flex items-center gap-1">
             <span className="text-[9px] text-orange-500 font-black uppercase tracking-widest">Nexus Foco</span>
             {stats.studyActive && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] flex flex-col justify-center items-center shadow-sm">
          <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-700 uppercase tracking-widest mb-2">Streak</span>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.streak}</p>
            <div className={`text-orange-500 ${stats.streak > 0 ? 'animate-bounce' : 'opacity-20'}`}>🔥</div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] flex flex-col justify-center items-center shadow-sm">
          <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-700 uppercase tracking-widest mb-2">Nexus Points</span>
          <p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.points.toLocaleString()}</p>
          <span className="text-[8px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1">Nível {Math.floor(stats.points / 500) + 1}</span>
        </div>
      </section>

      {/* 4. Ranking Fixo por Ciclo */}
      <section className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-black text-neutral-900 dark:text-white text-sm uppercase tracking-widest italic">
            Ranking de Performance — {rankingCycle}
          </h3>
          <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Apenas estudantes do seu ciclo</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-neutral-400 dark:text-neutral-600 border-b border-neutral-50 dark:border-neutral-900">
                <th className="px-8 py-4 font-black uppercase text-[8px] tracking-[0.2em]">Pos</th>
                <th className="px-8 py-4 font-black uppercase text-[8px] tracking-[0.2em]">Estudante</th>
                <th className="px-8 py-4 font-black uppercase text-[8px] tracking-[0.2em] text-right">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900/50">
              {filteredRanking.length > 0 ? filteredRanking.map((user) => (
                <tr 
                  key={user.id} 
                  className={`transition-all ${user.isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-600/5' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/20'}`}
                >
                  <td className="px-8 py-4 font-mono text-neutral-400 text-[10px]">
                    #{user.rank.toString().padStart(2, '0')}
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                       <img src={user.photoURL} className="w-6 h-6 rounded-lg opacity-80" alt="" />
                       <span className={`text-xs font-bold flex items-center gap-2 ${user.isCurrentUser ? 'text-blue-600 font-black' : 'text-neutral-700 dark:text-neutral-300'}`}>
                         {user.isCurrentUser ? 'Você' : user.displayName || 'Estudante'}
                         {user.isPremium && (
                           <span className="text-[11px]" title="Premium Member">{user.premiumEmoji || '✨'}</span>
                         )}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right font-mono text-[10px] font-black text-neutral-500 dark:text-neutral-400">
                    {user.points?.toLocaleString() || 0}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-neutral-400 text-[10px] uppercase font-bold tracking-widest">
                    Nenhum estudante no ranking do seu ciclo ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StatsDashboard;
