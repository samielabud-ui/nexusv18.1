
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ChatMessage, UserStats } from '../types';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose, userStats }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userStats.groupId || !isOpen) return;

    const q = query(
      collection(db, "groups", userStats.groupId, "messages"),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    });

    return () => unsubscribe();
  }, [userStats.groupId, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userStats.groupId || loading) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "groups", userStats.groupId, "messages"), {
        text: newMessage,
        senderId: userStats.uid,
        senderName: userStats.displayName,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!userStats.adm || !userStats.groupId) return;
    if (confirm("Deseja apagar esta mensagem?")) {
      await deleteDoc(doc(db, "groups", userStats.groupId, "messages", msgId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[200] w-full sm:w-[400px] bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Chat do Grupo</h3>
          <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Nexus Social v1.0</p>
        </div>
        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {!userStats.groupId ? (
        <div className="flex-grow flex flex-col items-center justify-center p-12 text-center text-neutral-500">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center text-2xl mb-4 opacity-20">💬</div>
          <p className="text-xs font-bold uppercase tracking-widest">Você não está em um grupo.</p>
          <p className="text-[10px] mt-2 leading-relaxed">Crie ou entre em um grupo na aba Nexus Foco para liberar o chat.</p>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.senderId === userStats.uid ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{msg.senderName}</span>
                  {userStats.adm && (
                    <button onClick={() => handleDeleteMessage(msg.id)} className="text-[8px] text-rose-500 font-bold uppercase hover:underline opacity-0 group-hover:opacity-100">Excluir</button>
                  )}
                </div>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.senderId === userStats.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-neutral-800 text-neutral-200 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-6 border-t border-neutral-800 bg-neutral-950/30">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Escreva sua mensagem..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 px-6 pr-16 text-sm text-white focus:border-blue-600 outline-none transition-all placeholder:text-neutral-700"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || loading}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14-7-3 14-4-5-4 5z"/></svg>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
