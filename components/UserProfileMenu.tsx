
import React, { useState } from 'react';
import { UserStats } from '../types';
import { auth, db } from '../lib/firebase';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onNavigateAdmin?: () => void;
}

const PREMIUM_EMOJIS = [
  '🜂', '🜁', '🧠✨', '🧬', '📚🔥', '🧿', '🜃', '🧠⚡', 
  '🕯️', '🧩', '🪐', '🗝️', '🧠📈', '🪄', '🏛️', '🧠🜄', 
  '📖🪶', '🧠🧭', '🧬🔬', '🌌'
];

const AVATAR_COLLECTIONS = [
  {
    category: "Times (M/F)",
    items: [
      { name: "Flamengo M", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=FlamengoM&topType=shortHair&clothingType=hoodie&clothingColor=ff0000" },
      { name: "Flamengo F", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=FlamengoF&topType=longHair&clothingType=hoodie&clothingColor=ff0000" },
      { name: "Vasco M", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=VascoM&topType=shortHair&clothingType=hoodie&clothingColor=ffffff" },
      { name: "Vasco F", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=VascoF&topType=longHair&clothingType=hoodie&clothingColor=ffffff" },
      { name: "Palmeiras M", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=PalmeirasM&topType=shortHair&clothingType=hoodie&clothingColor=008000" },
      { name: "Palmeiras F", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=PalmeirasF&topType=longHair&clothingType=hoodie&clothingColor=008000" },
      { name: "Corinthians M", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CorinthiansM&topType=shortHair&clothingType=hoodie&clothingColor=000000" },
      { name: "Corinthians F", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CorinthiansF&topType=longHair&clothingType=hoodie&clothingColor=000000" },
      { name: "São Paulo M", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=SPM&topType=shortHair&clothingType=hoodie&clothingColor=ff0000" },
      { name: "São Paulo F", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=SPF&topType=longHair&clothingType=hoodie&clothingColor=ff0000" },
    ]
  },
  {
    category: "Estilo Estudo",
    items: [
      { name: "Headphones M", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&accessories=wayfarers" },
      { name: "Coffee F", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&accessories=wayfarers" },
      { name: "Lab Coat", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Doc&clothingType=collarAndSweater" },
      { name: "Writing M", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=James&accessories=prescription01" },
      { name: "Tablet F", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vivian&accessories=prescription02" },
      { name: "Night Owl", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=George&accessories=prescription01" },
    ]
  }
];

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ isOpen, onClose, userStats, onNavigateAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(userStats.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(userStats.photoURL || '');
  const [selectedEmoji, setSelectedEmoji] = useState(userStats.premiumEmoji || PREMIUM_EMOJIS[0]);
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>(userStats.themePreference || 'dark');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => signOut(auth);

  const handleSave = async () => {
    if (!auth.currentUser || loading) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { 
        displayName: newName, 
        photoURL: selectedAvatar,
        themePreference: selectedTheme,
        premiumEmoji: userStats.isPremium ? selectedEmoji : null
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Sua Conta Nexus</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
          {!isEditing ? (
            <div className="space-y-8">
              <div className="flex items-center gap-6 bg-neutral-50 dark:bg-neutral-950/50 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 relative overflow-hidden">
                <div className="relative">
                  <img src={userStats.photoURL} alt="P" className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white dark:border-neutral-800 bg-white" />
                  {userStats.isPremium && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center text-[10px] shadow-lg">
                      {userStats.premiumEmoji || '✨'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-1">{userStats.displayName}</h3>
                  <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">{userStats.medCourse} • {userStats.semester}º Semestre</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {userStats.adm && (
                  <button onClick={() => { onNavigateAdmin?.(); onClose(); }} className="w-full flex items-center justify-between p-5 bg-blue-600 text-white hover:bg-blue-500 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
                    Área de Administração <span>⚙️</span>
                  </button>
                )}
                <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-between p-5 bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-800 transition-all text-[10px] font-bold uppercase tracking-widest">
                  Editar Identidade Visual <span>🎨</span>
                </button>
                <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-rose-50/50 dark:bg-red-500/5 hover:bg-rose-100 dark:hover:bg-red-500/10 rounded-2xl border border-rose-100 dark:border-red-500/10 transition-all text-rose-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest">
                  Sair da Sessão Nexus <span>⎋</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 px-6 text-white" value={newName} onChange={e => setNewName(e.target.value)} />
              <div className="flex gap-4">
                <button onClick={handleSave} disabled={loading} className="flex-grow bg-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase">Salvar</button>
                <button onClick={() => setIsEditing(false)} className="px-6 py-4 bg-neutral-800 text-white rounded-xl text-xs uppercase">Voltar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileMenu;
