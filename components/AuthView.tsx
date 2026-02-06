
import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const AuthView: React.FC = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/wrong-password': return 'Senha incorreta. Tente novamente.';
      case 'auth/user-not-found': return 'Usuário não encontrado.';
      case 'auth/invalid-email': return 'Email inválido.';
      case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/email-already-in-use': return 'Este email já está cadastrado.';
      default: return 'Erro ao processar. Verifique seus dados.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha email e senha para entrar.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpMode) {
      setIsSignUpMode(true);
      setError('');
      return;
    }

    if (!email || !password || !name || !confirmPassword) {
      setError('Preencha todos os campos para criar sua conta.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: name.trim(),
        email: email.trim(),
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`,
        setupComplete: false,
        isPremium: false,
        plan: 'basic',
        totalAnswered: 0,
        totalCorrect: 0,
        totalErrors: 0,
        points: 0,
        streak: 0,
        themePreference: 'dark'
      });
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu email para recuperar a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError("Erro ao enviar email de recuperação.");
    }
  };

  const featureCards = [
    { title: "PBL (Tutoria)", desc: "Casos organizados por módulo, objetivos de aprendizado e apostilas integradas. Ideal para estudo ativo.", icon: "🧠", color: "text-emerald-500" },
    { title: "Morfo", desc: "Anatomia, Histologia e Embriologia organizadas por MED e módulos, com PDFs e aulas integradas.", icon: "🧬", color: "text-purple-500" },
    { title: "Questões", desc: "Milhares de questões do site e extras premium com filtros inteligentes por módulo.", icon: "📝", color: "text-blue-500" },
    { title: "Área Premium", desc: "Conteúdos que fazem você estudar menos e entender mais. Quando estiver pronto, você vai saber.", icon: "✨", color: "text-rose-500" },
    { title: "Ranking e Progresso", desc: "Pontuação por atividades e ranking por ciclo (básico, clínico e internato).", icon: "🏆", color: "text-amber-500" },
    { title: "Estudo e Organização", desc: "Cronômetro de estudo, histórico de atividades e progresso multiplataforma via Firebase.", icon: "⏱️", color: "text-orange-500" },
    { title: "Básico vs Premium", desc: "Plano básico com essencial e Premium com OSCE, HP e estatísticas avançadas.", icon: "🔒", color: "text-cyan-500" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-500">
      
      {/* SEÇÃO HERO + LOGIN */}
      <section className="min-h-screen flex flex-col lg:flex-row border-b border-neutral-200 dark:border-neutral-900">
        
        {/* Lado Esquerdo: Marca e Intro */}
        <div className="lg:flex-1 flex flex-col justify-center px-6 py-16 md:px-12 lg:px-24">
          <div className="max-w-xl">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-3xl text-white mb-8 shadow-xl shadow-blue-600/20">N</div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-6">
              Nexus<span className="text-blue-600">BQ</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
              A plataforma de medicina definitiva para quem estuda por <span className="text-blue-600 font-bold">PBL</span>. 
              Organização, questões e conteúdo de elite em um só lugar.
            </p>
            <div className="mt-12 flex gap-4">
              <div className="px-4 py-2 bg-neutral-200 dark:bg-neutral-900 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-800">
                #EstudoAtivo
              </div>
              <div className="px-4 py-2 bg-neutral-200 dark:bg-neutral-900 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-800">
                #MedicinaPBL
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário de Autenticação */}
        <div className="lg:w-[500px] flex flex-col justify-center p-6 md:p-12 bg-white dark:bg-neutral-950/50 lg:border-l border-neutral-100 dark:border-neutral-900">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-black tracking-tight mb-2">
                {isSignUpMode ? "Crie sua conta" : "Bem-vindo"}
              </h2>
              <p className="text-neutral-400 text-sm font-medium">Acesse a plataforma para continuar seus estudos.</p>
            </div>

            <form className="space-y-4">
              {isSignUpMode && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Seu Nome Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Dr. Marcelo Silva"
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 px-6 text-sm outline-none focus:border-blue-600 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Email</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 px-6 text-sm outline-none focus:border-blue-600 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Senha</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 px-6 text-sm outline-none focus:border-blue-600 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isSignUpMode && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Confirme a Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 px-6 text-sm outline-none focus:border-blue-600 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {error && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider px-1 animate-pulse">{error}</p>}
              {resetSent && <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider px-1">Link enviado para seu email!</p>}

              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleLogin}
                  disabled={loading || isSignUpMode}
                  className={`w-full font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 ${isSignUpMode ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500'}`}
                >
                  {loading && !isSignUpMode ? "..." : "Entrar"}
                </button>

                <button 
                  onClick={handleSignUp}
                  disabled={loading}
                  className={`w-full font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 border ${isSignUpMode ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' : 'bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:text-blue-600 hover:border-blue-600'}`}
                >
                  {loading && isSignUpMode ? "..." : "Criar Conta"}
                </button>

                {isSignUpMode && (
                  <button 
                    type="button" 
                    onClick={() => setIsSignUpMode(false)}
                    className="w-full text-[10px] font-black text-neutral-400 hover:text-blue-600 transition-colors uppercase tracking-widest mt-2"
                  >
                    Já tenho conta. Voltar para o Login.
                  </button>
                )}

                {!isSignUpMode && (
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="w-full text-[10px] font-black text-neutral-400 hover:text-blue-600 transition-colors uppercase tracking-widest mt-2"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SEÇÃO: O QUE VOCÊ ENCONTRA NO NEXUSBQ */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-20">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Plataforma</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter italic">O que você encontra <br/> no <span className="text-blue-600">NexusBQ</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featureCards.map((card, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 rounded-[2.5rem] shadow-sm hover:border-blue-500/30 transition-all group">
                <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h4 className="text-xl font-black mb-4 tracking-tight uppercase italic group-hover:text-blue-600 transition-colors">{card.title}</h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER: EM CONSTRUÇÃO */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-600 p-12 md:p-20 rounded-[3.5rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8 border border-white/20">🚧</div>
              <h3 className="text-3xl md:text-4xl font-black tracking-tighter italic mb-6">Em constante evolução.</h3>
              <p className="text-white/80 text-lg font-light leading-relaxed max-w-xl">
                O NexusBQ está sendo construído para ser a melhor experiência acadêmica da medicina. Novos conteúdos, questões e ferramentas são adicionados todas as semanas.
              </p>
              <div className="mt-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Atualizado Recentemente
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-neutral-200 dark:border-neutral-900">
        <div className="max-w-[1400px] mx-auto px-8 text-center text-neutral-400 text-[10px] font-black uppercase tracking-widest">
          &copy; {new Date().getFullYear()} NexusBQ &bull; Medicina PBL &bull; Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
};

export default AuthView;
