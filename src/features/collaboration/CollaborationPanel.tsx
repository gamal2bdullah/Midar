import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Clock, User } from 'lucide-react';
import { Project, Comment } from '../../hooks/useStorage';

export const CollaborationPanel = ({ project, updateProject, isOpen, onClose }: { project: Project, updateProject: any, isOpen: boolean, onClose: () => void }) => {
  const [newMode, setNewMode] = useState(false);
  const [text, setText] = useState('');

  const addComment = () => {
    if(!text) return;
    const c: Comment = {
      id: `comment_${Date.now()}`,
      author: 'المستخدم الحالي',
      text,
      timestamp: Date.now(),
      status: 'pending'
    };
    updateProject(project.id, { comments: [...(project.comments || []), c] });
    setText('');
    setNewMode(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
             onClick={onClose}
          />
          <motion.div
             initial={{ x: '-100%', opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: '-100%', opacity: 0 }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="fixed top-0 left-0 h-full w-[400px] bg-white border-r border-[#E2E8F0] shadow-2xl z-50 flex flex-col"
          >
             <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                   <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600"/> مركز التعاون والمراجعة</h2>
                   <p className="text-xs text-[#64748B] mt-1">مراجعة المدخلات، ترك ملاحظات، واعتماد القرارات</p>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {(!project.comments || project.comments.length === 0) ? (
                   <div className="text-center text-gray-400 py-12">
                     <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                     <p className="text-sm">لا توجد تعليقات أو مراجعات حتى الآن.</p>
                   </div>
                ) : (
                   project.comments.map(c => (
                     <div key={c.id} className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                               <User className="w-4 h-4" />
                             </div>
                             <div>
                               <div className="text-sm font-bold text-[#0F172A]">{c.author}</div>
                               <div className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(c.timestamp).toLocaleString('ar-EG')}</div>
                             </div>
                           </div>
                           {c.status === 'resolved' ? (
                              <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">مُعتمد</span>
                           ) : (
                              <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">قيد الانتظار</span>
                           )}
                        </div>
                        <p className="text-sm text-[#334155] leading-relaxed">{c.text}</p>
                     </div>
                   ))
                )}
             </div>

             <div className="p-6 border-t border-[#E2E8F0] bg-white">
                {newMode ? (
                  <div className="space-y-3">
                    <textarea 
                      value={text} onChange={e=>setText(e.target.value)}
                      placeholder="أضف ملاحظات للمراجعة..."
                      className="w-full text-sm bg-gray-50 border border-gray-200 outline-none rounded-xl p-3 resize-none h-24 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder-gray-400"
                    />
                    <div className="flex gap-2">
                      <button onClick={addComment} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"><Send className="w-4 h-4"/> إرسال</button>
                      <button onClick={()=>setNewMode(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>setNewMode(true)} className="w-full bg-white border-2 border-dashed border-[#CBD5E1] text-[#64748B] hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    إضافة تعليق للزملاء
                  </button>
                )}
             </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
