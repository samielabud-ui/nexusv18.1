
import React, { useState } from 'react';
import { Question } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

interface QuestionCardProps {
  question: Question;
  onAnswer?: (status: 'correct' | 'incorrect') => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async (index: number) => {
    if (isAnswered || !auth.currentUser || loading) return;
    
    setLoading(true);
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === question.gabarito;
    const userId = auth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];

    if (onAnswer) {
      onAnswer(isCorrect ? 'correct' : 'incorrect');
    }

    try {
      const responseRef = doc(db, "responses", `${userId}_${question.id}`);
      const responseDoc = await getDoc(responseRef);
      
      if (!responseDoc.exists()) {
        await setDoc(responseRef, {
          userId,
          questionId: question.id,
          correct: isCorrect,
          theme: question.tema,
          modulo: question.modulo,
          timestamp: new Date()
        });

        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        let newStreak = userData?.streak || 0;
        const lastActiveDate = userData?.lastActiveDate;

        if (!lastActiveDate) {
          newStreak = 1;
        } else {
          const lastDate = new Date(lastActiveDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }

        const lastDailyReset = userData?.lastDailyReset;
        const shouldResetDaily = lastDailyReset !== today;

        await updateDoc(userRef, {
          totalAnswered: increment(1),
          totalCorrect: isCorrect ? increment(1) : increment(0),
          totalErrors: !isCorrect ? increment(1) : increment(0),
          lastActiveDate: today,
          lastDailyReset: today,
          questionsToday: shouldResetDaily ? 1 : increment(1),
          streak: newStreak,
          points: increment(isCorrect ? 10 : 2)
        });
      }
    } catch (err) {
      console.error("Erro ao salvar resposta:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id={`q-${question.id}`}
      className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-6 hover:border-blue-500/30 transition-all duration-300 scroll-mt-24 shadow-sm"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
          {question.ciclo}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
          {question.modalidade === 'PBL' ? 'Tutoria / PBL' : question.modalidade}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
          Prob. {question.problema}
        </span>
      </div>
      
      <div className="mb-2">
        <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest">{question.modulo}</span>
        <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-200 mt-1 tracking-tight">{question.tema}</h3>
      </div>
      
      <div className="bg-neutral-50 dark:bg-neutral-950/40 p-5 rounded-xl mb-6 border-l-4 border-blue-600 transition-colors">
        <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {question.enunciado}
        </p>
      </div>

      <div className="space-y-2.5">
        {question.alternativas.map((option, idx) => {
          let buttonClass = "w-full text-left p-4 rounded-xl border transition-all text-sm flex items-start ";
          
          if (!isAnswered) {
            buttonClass += "border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-blue-500/30 text-neutral-600 dark:text-neutral-400 group";
          } else {
            if (idx === question.gabarito) {
              buttonClass += "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/5";
            } else if (idx === selectedOption) {
              buttonClass += "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/5";
            } else {
              buttonClass += "border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 text-neutral-400 dark:text-neutral-600 opacity-50";
            }
          }

          return (
            <button 
              key={idx}
              disabled={isAnswered || loading}
              onClick={() => handleAnswer(idx)}
              className={buttonClass}
            >
              <span className={`mr-3 font-mono font-black ${!isAnswered ? 'text-neutral-400 group-hover:text-blue-500' : ''}`}>
                {String.fromCharCode(65 + idx)})
              </span>
              <span className="font-medium">{option}</span>
            </button>
          );
        })}
      </div>
      
      {isAnswered && (
        <div className="mt-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-700/50 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 animate-in fade-in slide-in-from-top-2 tracking-wide transition-colors">
          {selectedOption === question.gabarito ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-500 text-lg">✓</span>
              <span className="uppercase">Excelente! Resposta correta e fundamentada.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-red-600 dark:text-red-500 text-lg">✗</span>
              <span className="uppercase">A resposta correta era a alternativa <span className="text-emerald-600 dark:text-emerald-500 font-black">{String.fromCharCode(65 + question.gabarito)}</span>.</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800/50 transition-colors">
        <span className="text-[9px] text-neutral-400 dark:text-neutral-600 font-mono font-black uppercase tracking-widest">NexusID: {question.id}</span>
        <button className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-blue-600 flex items-center gap-2 transition-all">
          Explicação Detalhada
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
