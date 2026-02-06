
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserStats, VideoLesson, LastWatched, ActivityItem } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

interface PremiumViewProps {
  userStats: UserStats;
  onAddActivity: (item: any) => void;
  onAwardPoints?: (id: string, value?: number) => void;
  onIncrementUsage?: (contentId: string) => void;
}

const BRAND_COLOR = "#00BFA6"; // Verde Médico Sanarflix
const VEST_COLOR = "#F43F5E";  // Rose para De Volta ao Vest

const EMBRIOLOGIA_LESSONS: VideoLesson[] = [
  { id: 'O9YsUhCQv64', title: 'Fecundação' },
  { id: 'tMXgjHq61wQ', title: 'Gametogênese' },
  { id: '-iuWA5CQCMI', title: 'Zigoto e Blastocisto' },
  { id: 'i29YGecX9UQ', title: 'Âmnio e Celoma' },
  { id: 'HbQ8Zpex0AA', title: 'Córion' },
  { id: 'HVVclowB9qI', title: 'Gastrulação' },
  { id: 'XUD3IUNK7Vk', title: 'Notocorda e Tubo Neural' },
  { id: '7rYQMJzQoYg', title: 'Somitos, Celoma Intra e Sistema Cardiovascular' },
  { id: 'iu5VjWLLoKU', title: 'Organogênese e Dobramento do Embrião' },
  { id: 'tSqOhvdTDnc', title: 'Embriologia da 4ª à 8ª Semana' },
  { id: 'aFEVmlbJ708', title: 'Embriologia da 9ª Semana ao Nascimento' },
  { id: 'L2IZEut6Yok', title: 'Cavidades do Corpo Embrionário' },
  { id: 'CeDWt2Qg3UE', title: 'Desenvolvimento do Diafragma' },
  { id: 'WEzfPk3OJ9o', title: 'Aparelho Faríngeo (Arcos e Derivados)' },
  { id: 'Wxo8xMksxiU', title: 'Aparelho Faríngeo (Bolsas, Sulcos e Membranas)' },
  { id: 'axyh2MK-XDU', title: 'Embriologia do Pescoço' },
  { id: 'fnJnYip6qWA', title: 'Primórdio Respiratório e Faringe' },
  { id: 'iExD4xImT24', title: 'Embriologia da Face' },
  { id: 'xQO9_OJmuCI', title: 'Embriologia do Palato' },
  { id: '7ydEZDWXWmg', title: 'Maturação Pulmonar' },
  { id: 'a3zj8iowhJ8', title: 'Membranas Fetais' },
  { id: 'f2k4ng4kLzQ', title: 'Traqueia, Brônquios e Pulmões' },
  { id: 'IqL5Icry-ZQ', title: 'Intestino Anterior (Bolsa Omental e Duodeno)' },
  { id: 'V3gyiEpoEXA', title: 'Intestino Anterior (Fígado e Sistema Biliar)' },
  { id: 'D4GpR1-IJ5M', title: 'Intestino Anterior (Pâncreas e Baço)' },
  { id: 'BbYOX4kR3vc', title: 'Placenta' },
  { id: 'kDNHoeo5Yio', title: 'Intestino Anterior (Esôfago e Estômago)' },
  { id: 'MvR0FbqGD_Y', title: 'Intestino Médio (Herniação e Rotação)' },
  { id: 'XU-voGzqC_c', title: 'Intestino Médio (Ceco e Apêndice)' },
  { id: 'kCVHiNzogbI', title: 'Intestino Posterior e Cloaca' },
  { id: 'Tow8vrGpf6A', title: 'Sistema Urinário (Bexiga e Defeitos)' },
  { id: 'Sb62GtZf0LY', title: 'Sistema Genital (Gônadas Indiferenciadas)' },
  { id: '8ivU4plbcUw', title: 'Desenvolvimento do Coração e Vasos' },
];

const REPRODUCAO_HUMANA_LESSONS: VideoLesson[] = [
  { id: 'x3PuKN0TK7Q', title: 'Gametogênese – Espermatogênese' },
  { id: '02qzFxym5wg', title: 'Gametogênese – Ovogênese' },
  { id: 'TmUPeZcs_Fo', title: 'Gametogênese – Diferenças entre Espermatogênese e Ovogênese' },
  { id: 'e_vuOHUhpYU', title: 'Gametogênese – Partenogênese' },
  { id: 'gRWG7Whisvo', title: 'Gametogênese – Tipos de Partenogênese' },
  { id: 'eidGIV69EbA', title: 'Gametogênese – Pedogênese e Neotenia' },
];

const SANARFLIX_COURSES = [
  "Anatomia do Sistema Locomotor", "Anatomia dos Órgãos e Sistemas", "Antibioticoterapia",
  "Atendimento Pré-Hospitalar", "Biofísica", "Biologia Molecular e Celular",
  "Bioquímica", "Eletrocardiograma (ECG)", "Embriologia", "Exames Laboratoriais",
  "Farmacologia", "Fisiologia", "Genética", "Histologia", "Microbiologia",
  "Neuroanatomia", "Parasitologia", "Patologia", "Primeiros Socorros",
  "Radiologia", "Semiologia", "Sistema Circulatório", "Sistema Digestório",
  "Sistema Endócrino", "Sistema Hematopoiético", "Sistema Imune", "Sistema Nervoso",
  "Sistema Reprodutor", "Sistema Respiratório", "Sistema Urinário e Renal", "Trauma"
];

const VEST_COURSES = [
  "Reprodução Humana", "Embriologia Animal"
];

const PREMIUM_PLATFORMS = [
  { id: 'sanarflix', title: 'Sanarflix', description: 'Plataforma oficial Sanarflix.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600' },
  { id: 'devoltavest', title: 'De Volta ao Vest', description: 'Fundamentos do vestibular como base sólida para a medicina.', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600' },
  { id: 'medcurso', title: 'Medcurso', description: 'Preparatório para Residência Médica.', image: 'https://images.unsplash.com/photo-1581594632702-52c1138395c5?auto=format&fit=crop&q=80&w=600' },
  { id: 'eumedico', title: 'Eu Médico Residente', description: 'Especialização e Prática Clínica.', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600' },
  { id: 'estrategiamed', title: 'EstratégiaMED', description: 'Foco total em aprovação e revisões.', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600' }
];

const getCourseCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('reprodução') || n.includes('embriologia')) return { label: 'Fundamentos', color: '#F43F5E', text: 'text-rose-500', border: 'border-rose-500/30' };
  if (n.includes('anatomia') || n.includes('neuro')) return { label: 'Anatomia', color: '#3B82F6', text: 'text-blue-500', border: 'border-blue-500/30' };
  if (n.includes('bioquímica') || n.includes('genética') || n.includes('biologia')) return { label: 'Bioquímica', color: '#10B981', text: 'text-emerald-500', border: 'border-emerald-500/30' };
  if (n.includes('trauma') || n.includes('primeiros') || n.includes('atendimento')) return { label: 'Urgência', color: '#F59E0B', text: 'text-amber-500', border: 'border-amber-500/30' };
  return { label: 'Clínica', color: '#8B5CF6', text: 'text-purple-500', border: 'border-purple-500/30' };
};

const PremiumView: React.FC<PremiumViewProps> = ({ userStats, onAddActivity, onAwardPoints, onIncrementUsage }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);
  const [search, setSearch] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef<HTMLIFrameElement>(null);

  const watchedVideos = userStats.watchedLessons || [];

  const accentColor = selectedPlatform === 'devoltavest' ? VEST_COLOR : BRAND_COLOR;

  // Filtrar os 5 últimos cursos/aulas acessados (Premium)
  const premiumHistory = useMemo(() => 
    (userStats.recentActivity || [])
      .filter(a => a.type === 'aula' && a.metadata && a.metadata.platformId)
      .slice(0, 5),
  [userStats.recentActivity]);

  const markAsWatched = async (id: string, forceState?: boolean) => {
    if (!userStats.isPremium || !auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const isCurrentlyWatched = watchedVideos.includes(id);
    const targetState = forceState !== undefined ? forceState : !isCurrentlyWatched;

    if (targetState === isCurrentlyWatched) return;

    try {
      await updateDoc(userRef, {
        watchedLessons: targetState ? arrayUnion(id) : arrayRemove(id)
      });
    } catch (err) {
      console.error("Erro ao salvar progresso no Firebase:", err);
    }
  };

  const isOverLimit = (id: string) => {
    if (userStats.plan === 'premium') return false;
    if (userStats.openedContentIds?.includes(id)) return false;
    return (userStats.openedContentIds?.length || 0) >= 10;
  };

  const handleLessonSelect = async (lesson: VideoLesson) => {
    const contentId = `aula_${lesson.id}`;
    if (isOverLimit(contentId)) {
        setActiveVideo(lesson); // Permitimos selecionar para exibir o banner
        return;
    }

    setActiveVideo(lesson);
    if (!userStats.isPremium || !auth.currentUser) {
        // Se for plano básico, incrementa uso se ainda não estourou
        onIncrementUsage?.(contentId);
        return;
    }

    const platformTitle = PREMIUM_PLATFORMS.find(p => p.id === selectedPlatform)?.title || 'Nexus';

    // Marcar automaticamente como assistida ao abrir (Hotmart style)
    await markAsWatched(lesson.id, true);

    onAddActivity({
      id: contentId,
      type: 'aula',
      title: lesson.title,
      subtitle: `${selectedCourse} (${platformTitle})`,
      metadata: { 
        platformId: selectedPlatform, 
        courseName: selectedCourse, 
        lessonId: lesson.id 
      }
    });

    // Pontuação por abrir aula Premium (limitado a 1x/dia pelo handleAwardPoints)
    onAwardPoints?.(contentId, 5);

    const userRef = doc(db, "users", auth.currentUser.uid);
    const lastData: LastWatched = {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      courseName: selectedCourse || 'Embriologia',
      platformId: selectedPlatform || 'sanarflix'
    };

    try {
      await updateDoc(userRef, { lastWatched: lastData });
    } catch (err) {
      console.error("Erro ao salvar última aula no Firebase:", err);
    }
  };

  const handleResumeActivity = (act: ActivityItem) => {
    if (act.metadata && act.metadata.platformId) {
      setSelectedPlatform(act.metadata.platformId);
      setSelectedCourse(act.metadata.courseName);
      setActiveVideo({ id: act.metadata.lessonId, title: act.title });
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (videoRef.current?.contentWindow) {
      videoRef.current.contentWindow.postMessage(JSON.stringify({
        method: 'setVolume', value: newMutedState ? 0 : 1
      }), '*');
    }
  };

  const filteredPlatforms = useMemo(() => 
    PREMIUM_PLATFORMS.filter(p => p.title.toLowerCase().includes(search.toLowerCase())), 
  [search]);

  const currentCourses = selectedPlatform === 'sanarflix' ? SANARFLIX_COURSES : selectedPlatform === 'devoltavest' ? VEST_COURSES : [];

  const filteredCourses = useMemo(() => 
    currentCourses.filter(c => c.toLowerCase().includes(search.toLowerCase())), 
  [search, currentCourses]);

  const filteredLessons = useMemo(() => {
    const lessons = selectedCourse === 'Embriologia' ? EMBRIOLOGIA_LESSONS : 
                    selectedCourse === 'Reprodução Humana' ? REPRODUCAO_HUMANA_LESSONS : [];
    return lessons.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
  }, [search, selectedCourse]);

  const hasLessons = selectedCourse === 'Embriologia' || selectedCourse === 'Reprodução Humana';

  if (!userStats.isPremium) {
    return (
      <div className="max-w-[1200px] mx-auto pt-10 pb-32 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/30 px-4 py-1.5 rounded-full mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Upgrade Disponível</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
            Estude sem limites com o <span className="text-blue-600">Nexus Premium</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-2xl font-light max-w-3xl mx-auto leading-relaxed">
            A ferramenta definitiva para quem leva a medicina a sério. Vá além das questões e domine o método PBL.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { title: "Plataformas de Elite", desc: "Acesso direto ao catálogo de gigantes como Sanarflix e Medcurso.", icon: "💎" },
            { title: "Streaming Educacional", desc: "Assista onde e quando quiser com controle de progresso inteligente.", icon: "▶" },
            { title: "Foco Total em Medicina", desc: "Conteúdo estruturado por ciclos para sua aprovação.", icon: "🩺" }
          ].map((feat, i) => (
            <div key={i} className="bg-neutral-900/30 border border-neutral-800 p-10 rounded-[2.5rem] hover:border-blue-600/30 transition-all group shadow-xl">
              <div className="text-4xl text-blue-600 mb-6 font-bold opacity-50 group-hover:opacity-100 transition-opacity">{feat.icon}</div>
              <h3 className="text-xl font-black text-white mb-4 tracking-tight">{feat.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-1 rounded-[3.5rem] shadow-2xl shadow-blue-600/20">
          <div className="bg-[#0a0a0a] rounded-[3.3rem] p-10 md:p-20 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 tracking-tight">Pronto para o próximo nível?</h2>
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-12 rounded-2xl transition-all shadow-xl shadow-blue-600/30 text-lg uppercase tracking-widest active:scale-95">
              Assinar Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLessonId = activeVideo ? `aula_${activeVideo.id}` : '';
  const showOverLimitBanner = isOverLimit(currentLessonId) && activeVideo;

  return (
    <div className="animate-in fade-in duration-700 pb-20 w-full relative">
      {showOverLimitBanner && (
        <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center rounded-[2rem]">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-4">Limite Atingido</h3>
            <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
              Você atingiu o limite de <span className="text-white font-bold">10 conteúdos</span> do plano básico. Este limite não renova.
            </p>
            <button onClick={() => { setSelectedPlatform(null); setSelectedCourse(null); setActiveVideo(null); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs">Voltar ao Catálogo</button>
          </div>
        </div>
      )}

      {/* 1️⃣ Banner Principal (Hero) */}
      {!selectedPlatform && (
        <section className="relative w-full h-[60vh] md:h-[80vh] mb-12 overflow-hidden rounded-[1.5rem] md:rounded-[3rem] group mx-auto max-w-[1800px]">
          <div className="absolute inset-0 w-full h-full pointer-events-none scale-[1.35]">
            <iframe 
              ref={videoRef}
              src="https://player.vimeo.com/video/1155181147?autoplay=1&loop=1&muted=1&background=1&controls=0&badge=0&autopause=0&player_id=0&app_id=58479" 
              className="w-full h-full object-cover"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              title="Banner Video"
            ></iframe>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
          <button onClick={toggleMute} className="absolute top-10 right-10 z-20 w-12 h-12 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all shadow-2xl">
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a2 2 0 0 0-3.54-1.3l-3.32 3.32"/><path d="M3 13H5l4 4V10"/><path d="M15.54 10.76a2 2 0 0 1 0 2.48"/><path d="M19.07 14.29a5 5 0 0 0 0-4.58"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            )}
          </button>
          <div className="absolute left-6 md:left-16 bottom-10 md:bottom-20 max-w-2xl z-10">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-4 inline-block">Destaque da Semana</span>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter italic leading-none">Sanarflix</h1>
            <p className="text-neutral-300 text-lg md:text-xl font-light mb-8 leading-relaxed">
              O maior ecossistema de ensino médico do Brasil. Domine o Ciclo Básico e Clínico com aulas didáticas e objetivas.
            </p>
            <button onClick={() => setSelectedPlatform('sanarflix')} className="bg-white text-black font-black py-4 px-10 rounded-xl hover:bg-[#00BFA6] hover:text-white transition-all text-base uppercase tracking-widest flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Explorar Catálogo
            </button>
          </div>
        </section>
      )}

      {/* 2️⃣ CONTINUAR ASSISTINDO – PREMIUM (Últimos 5 conteúdos) */}
      {!selectedPlatform && premiumHistory.length > 0 && (
        <section className="max-w-[1800px] mx-auto px-4 md:px-8 mb-16 animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
            Continuar Assistindo <div className="h-px flex-grow bg-neutral-800/50"></div>
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2 scroll-smooth">
            {premiumHistory.map((act) => (
              <div 
                key={act.id} 
                onClick={() => handleResumeActivity(act)}
                className="relative min-w-[280px] md:min-w-[400px] aspect-video rounded-[2rem] overflow-hidden group cursor-pointer border border-neutral-800 hover:border-blue-600/50 transition-all shadow-2xl shrink-0"
              >
                {/* Background com Thumbnail do YouTube */}
                <img 
                  src={`https://img.youtube.com/vi/${act.metadata?.lessonId}/maxresdefault.jpg`} 
                  alt={act.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
                  onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1 block">
                    {act.metadata?.platformId === 'devoltavest' ? 'Vestibular' : 'Medicina Premium'}
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-bold text-lg leading-tight line-clamp-1 flex-grow">{act.title}</h4>
                    {watchedVideos.includes(act.metadata?.lessonId) && (
                      <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">✔ Assistida</span>
                    )}
                  </div>
                  <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider">{act.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3️⃣ Catálogo de cursos */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8">
        {/* Header de Navegação */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">
            <button onClick={() => { setSelectedPlatform(null); setSelectedCourse(null); setActiveVideo(null); }} className="hover:text-white transition-colors">Catálogo Premium</button>
            {selectedPlatform && (
              <>
                <span>/</span>
                <button onClick={() => { setSelectedCourse(null); setActiveVideo(null); }} className={`hover:text-white ${selectedPlatform === 'sanarflix' ? 'text-[#00BFA6]' : selectedPlatform === 'devoltavest' ? 'text-rose-500' : 'text-neutral-300'}`}>{PREMIUM_PLATFORMS.find(p => p.id === selectedPlatform)?.title}</button>
              </>
            )}
            {selectedCourse && (
              <>
                <span>/</span>
                <span className="text-white opacity-60">{selectedCourse}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
                {selectedCourse ? (
                  selectedCourse
                ) : (
                  selectedPlatform === 'sanarflix' ? (
                    <>Cursos: <span className="text-[#00BFA6]">SANARFLIX</span></>
                  ) : selectedPlatform === 'devoltavest' ? (
                    <>Fundamentos: <span className="text-rose-500 uppercase">Vestibular</span></>
                  ) : (
                    selectedPlatform ? `Cursos: ${selectedPlatform.toUpperCase()}` : "Plataformas Disponíveis"
                  )
                )}
              </h2>
              {selectedPlatform === 'sanarflix' && !selectedCourse && (
                <div className="h-1 w-24 bg-[#00BFA6] mt-4 rounded-full"></div>
              )}
              {selectedPlatform === 'devoltavest' && !selectedCourse && (
                <div className="h-1 w-24 bg-rose-500 mt-4 rounded-full"></div>
              )}
            </div>
            
            <div className="relative w-full md:w-96 group">
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className={`w-full bg-neutral-900 border border-neutral-800 rounded-xl py-4 px-12 text-xs text-white focus:border-[${accentColor}] focus:ring-1 focus:ring-[${accentColor}]/30 outline-none transition-all placeholder:text-neutral-700 shadow-2xl`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg 
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${search ? `text-[${accentColor}]` : 'text-neutral-600'}`} 
                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
          </div>
        </header>

        {/* NÍVEL 1: Plataformas */}
        {!selectedPlatform && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            {filteredPlatforms.map((p) => (
              <div key={p.id} onClick={() => setSelectedPlatform(p.id)} className={`group relative aspect-video rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-[${p.id === 'devoltavest' ? VEST_COLOR : BRAND_COLOR}] transition-all cursor-pointer shadow-2xl active:scale-95`}>
                <img src={p.image} alt={p.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                   <h3 className={`text-2xl font-black text-white tracking-tight mb-2 group-hover:text-[${p.id === 'devoltavest' ? VEST_COLOR : BRAND_COLOR}] transition-colors`}>{p.title}</h3>
                   <p className="text-neutral-400 text-xs font-light leading-relaxed mb-4">{p.description}</p>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${p.id === 'devoltavest' ? 'text-rose-500' : 'text-[#00BFA6]'} group-hover:translate-x-2 transition-transform inline-block`}>Acessar →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NÍVEL 2: Cursos (Sanarflix e De Volta ao Vest) */}
        {(selectedPlatform === 'sanarflix' || selectedPlatform === 'devoltavest') && !selectedCourse && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-in fade-in duration-500">
            {filteredCourses.map((course, idx) => {
              const cat = getCourseCategory(course);
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedCourse(course)}
                  className={`group relative aspect-[2/3] md:aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 to-[#0c0c0c] border border-neutral-800 hover:border-white/20 transition-all cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:-translate-y-1`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: cat.color }}></div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`text-[8px] font-black uppercase tracking-widest ${cat.text}`}>{cat.label}</span>
                       <div className="h-px flex-grow bg-white/5"></div>
                    </div>
                    <h3 className="text-white font-bold text-xs md:text-sm leading-tight group-hover:text-white transition-colors">{course}</h3>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <div className={`w-10 h-10 ${selectedPlatform === 'devoltavest' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-[#00BFA6]/10 text-[#00BFA6] border-[#00BFA6]/30'} backdrop-blur-md rounded-full flex items-center justify-center border scale-75 group-hover:scale-100 transition-transform`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* NÍVEL 3: Aulas (Exemplo com Embriologia e Reprodução Humana) */}
        {hasLessons && (
          <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in duration-500">
            <div className="flex-grow lg:w-2/3">
              <div className="sticky top-24">
                {activeVideo ? (
                  <div className="w-full bg-black aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-neutral-800">
                    <iframe src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`} className="w-full h-full" frameBorder="0" allowFullScreen title={activeVideo.title}></iframe>
                  </div>
                ) : (
                  <div className={`w-full aspect-video bg-neutral-900/40 rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 text-center p-8`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border`} style={{ backgroundColor: `${accentColor}05`, color: `${accentColor}4d`, borderColor: `${accentColor}1a` }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <h4 className="text-white font-bold mb-2">Selecione uma aula</h4>
                    <p className="text-neutral-500 text-sm">Escolha um tema na lista ao lado para iniciar seu estudo.</p>
                  </div>
                )}
                {activeVideo && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 md:p-8 bg-neutral-900/40 rounded-[2rem] border border-neutral-800 gap-4 shadow-2xl">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest block" style={{ color: accentColor }}>Aula Atual</span>
                        {watchedVideos.includes(activeVideo.id) && (
                          <span className="text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-500/10 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Assistida
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight line-clamp-1">{activeVideo.title}</h3>
                    </div>
                    <button 
                      onClick={() => markAsWatched(activeVideo.id)} 
                      className={`w-full sm:w-auto px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${watchedVideos.includes(activeVideo.id) ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20' : `text-black hover:opacity-90 shadow-xl shadow-blue-600/10`}`}
                      style={!watchedVideos.includes(activeVideo.id) ? { backgroundColor: accentColor } : {}}
                    >
                      {watchedVideos.includes(activeVideo.id) ? 'Desmarcar como Assistida' : 'Marcar como Assistida'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-1/3 max-h-[80vh] overflow-y-auto no-scrollbar space-y-3">
              <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-4 mb-4">Grade do Curso ({filteredLessons.length})</h3>
              {filteredLessons.map((lesson, idx) => (
                <div 
                  key={lesson.id} 
                  onClick={() => handleLessonSelect(lesson)} 
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${activeVideo?.id === lesson.id ? `bg-neutral-800/40` : 'bg-neutral-900/30 border-neutral-800 hover:border-neutral-700'}`}
                  style={activeVideo?.id === lesson.id ? { borderColor: `${accentColor}80` } : {}}
                >
                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                    <img src={`https://img.youtube.com/vi/${lesson.id}/default.jpg`} alt="T" className="w-full h-full object-cover opacity-50" />
                    {watchedVideos.includes(lesson.id) && (
                      <div className="absolute top-1.5 right-1.5 bg-emerald-500 rounded-full p-1 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className={`w-6 h-6 transition-colors ${activeVideo?.id === lesson.id ? '' : 'text-white/40'}`} style={activeVideo?.id === lesson.id ? { color: accentColor } : {}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className={`text-xs md:text-sm font-bold line-clamp-2 transition-colors ${activeVideo?.id === lesson.id ? '' : 'text-neutral-300'}`} style={activeVideo?.id === lesson.id ? { color: accentColor } : {}}>{idx + 1}. {lesson.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholders */}
        {selectedCourse && !hasLessons && (
          <div className="py-20 text-center border-2 border-dashed border-neutral-800 rounded-[3rem] animate-in fade-in duration-500">
             <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-700 mx-auto mb-6"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg></div>
             <h3 className="text-2xl font-black text-white mb-2">Conteúdo em Processamento</h3>
             <p className="text-neutral-500">A equipe Nexus está organizando as aulas do curso <span className="text-white">{selectedCourse}</span>.</p>
             <button onClick={() => setSelectedCourse(null)} className="mt-8 text-blue-500 font-bold uppercase tracking-widest text-xs hover:underline">Voltar ao catálogo</button>
          </div>
        )}

        {selectedPlatform && !['sanarflix', 'devoltavest', 'medcurso', 'eumedico', 'estrategiamed'].includes(selectedPlatform) && (
          <div className="py-20 text-center border-2 border-dashed border-neutral-800 rounded-[3rem] animate-in fade-in duration-500">
             <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-700 mx-auto mb-6"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
             <h3 className="text-2xl font-black text-white mb-2">Acesso Temporário Restrito</h3>
             <p className="text-neutral-500">Esta plataforma estará disponível em breve no catálogo Premium.</p>
             <button onClick={() => setSelectedPlatform(null)} className="mt-8 text-blue-500 font-bold uppercase tracking-widest text-xs hover:underline">Voltar ao Início</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumView;
