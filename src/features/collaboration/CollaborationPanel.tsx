import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Clock, User, CheckCircle2, UserPlus } from 'lucide-react';
import { Project, Comment } from '../../hooks/useStorage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export const CollaborationPanel = ({ project, updateProject, isOpen, onClose }: { project: Project, updateProject: any, isOpen: boolean, onClose: () => void }) => {
  const [newMode, setNewMode] = useState(false);
  const [text, setText] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const { user } = useAuth();

  const addComment = () => {
    if(!text) return;
    const c: Comment = {
      id: `comment_${Date.now()}`,
      author: user?.displayName || 'المستخدم الحالي',
      text,
      timestamp: Date.now(),
      status: 'pending'
    };
    updateProject(project.id, { comments: [...(project.comments || []), c] });
    setText('');
    setNewMode(false);
  };

  const inviteCollaborator = async () => {
    if (!inviteEmail) return;
    setInviteStatus('جاري البحث...');
    try {
      const q = query(collection(db, 'users'), where('email', '==', inviteEmail.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const uid = snap.docs[0].data().uid;
        if (project.members.includes(uid)) {
           setInviteStatus('هذا المستخدم موجود مسبقاً في الفريق.');
        } else {
           await updateProject(project.id, { members: [...project.members, uid] });
           setInviteStatus('تمت الإضافة بنجاح!');
           setInviteEmail('');
        }
      } else {
        setInviteStatus('عذراً، لم نجد مستخدم بهذا البريد.');
      }
    } catch(err) {
      setInviteStatus('حدث خطأ في الشبكة.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
             onClick={onClose}
          />
          <motion.div
             initial={{ x: '-100%', opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: '-100%', opacity: 0 }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="fixed top-0 left-0 h-full w-[400px] bg-white border-r border-[#E2E8F0] shadow-2xl z-50 flex flex-col"
          >
             <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
                <div>
                   <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-600"/> مركز التعاون والمراجعة</h2>
                   <div className="flex items-center gap-2 mt-2">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                     <p className="text-xs text-slate-500 font-medium">أنت متصل الآن (شريك التحرير)</p>
                   </div>
                </div>
                <button onClick={onClose} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-colors shadow-sm">
                  <X className="w-5 h-5" />
                </button>
             </div>

             {/* INVITATION SECTION */}
             <div className="p-6 border-b border-slate-100 bg-white">
                <p className="text-sm font-bold text-slate-700 mb-2">إضافة زميل للمشروع (Real-time)</p>
                <div className="flex gap-2">
                   <input 
                     type="email" 
                     placeholder="أدخل البريد الإلكتروني للزميل..."
                     value={inviteEmail}
                     onChange={(e) => setInviteEmail(e.target.value)}
                     className="flex-1 text-sm bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:border-indigo-400"
                   />
                   <button onClick={inviteCollaborator} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg font-bold text-sm hover:bg-indigo-600 hover:text-white transition-colors">
                     إضافة
                   </button>
                </div>
                {inviteStatus && <p className="text-xs font-bold text-indigo-600 mt-2">{inviteStatus}</p>}
                <p className="text-[10px] text-slate-400 mt-2">هذا المشروع يضم الآن {project.members?.length || 1} أعضاء.</p>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
                {(!project.comments || project.comments.length === 0) ? (
                   <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                     <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mb-4">
                       <MessageSquare className="w-8 h-8 text-slate-300" />
                     </div>
                     <p className="text-sm font-medium">لا توجد تعليقات أو مراجعات حتى الآن.</p>
                   </div>
                ) : (
                   project.comments.map(c => (
                     <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group transition-all hover:border-indigo-300">
                        {c.status === 'resolved' && (
                           <div className="absolute top-0 right-0 w-2 h-full bg-emerald-400 rounded-r-2xl"/>
                        )}
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-inner">
                               <User className="w-5 h-5" />
                             </div>
                             <div>
                               <div className="text-sm font-bold text-slate-800">{c.author}</div>
                               <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono"><Clock className="w-3 h-3"/> {new Date(c.timestamp).toLocaleString('ar-EG')}</div>
                             </div>
                           </div>
                           {c.status === 'resolved' ? (
                              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-md">
                                <CheckCircle2 className="w-3 h-3" /> مُعتمد
                              </span>
                           ) : (
                              <button onClick={() => {
                                const newComments = project.comments?.map(x => x.id === c.id ? { ...x, status: 'resolved' as const } : x) || [];
                                updateProject(project.id, { comments: newComments });
                              }} className="text-[10px] uppercase tracking-wider font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-sm">
                                اعتماد التعليق؟
                              </button>
                           )}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{c.text}</p>
                     </div>
                   ))
                )}
             </div>

             <div className="p-6 border-t border-slate-200 bg-white">
                {newMode ? (
                  <div className="space-y-3">
                    <textarea 
                      value={text} onChange={e=>setText(e.target.value)}
                      placeholder="أضف ملاحظات للمراجعة (يمكنك الإشارة للزملاء بـ @)..."
                      className="w-full text-sm bg-slate-50 border border-slate-200 outline-none rounded-xl p-3 resize-none h-28 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-medium placeholder-slate-400"
                    />
                    <div className="flex gap-2">
                      <button onClick={addComment} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"><Send className="w-4 h-4"/> إرسال المراجعة</button>
                      <button onClick={()=>setNewMode(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>setNewMode(true)} className="w-full bg-white border-2 border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    إضافة تعليق جديد للزملاء
                  </button>
                )}
             </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}