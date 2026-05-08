import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Trash2, BrainCircuit, LogOut, User } from 'lucide-react';
import { Project } from '../../hooks/useStorage';
import { GlassCard } from '../../components/ui/shared';
import { useAuth } from '../../context/AuthContext';

// Extracted from App.tsx HomeView
export const WorkspaceHome = ({ projects, loading, createProject, openProject, deleteProject }: any) => {
  const [newProjectName, setNewProjectName] = useState('');
  const { user, logout } = useAuth();

  const launchNew = async () => {
    if(!newProjectName) return;
    const id = await createProject(newProjectName);
    openProject(id);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-blue-600 font-sans"><BrainCircuit className="w-8 h-8 animate-pulse mr-3"/> يتم استنهاض مِدار...</div>;

  return (
    <div className="min-h-screen bg-transparent pb-24 text-right" dir="rtl">
      
      {/* Top Navigation */}
      <div className="w-full flex justify-between items-center px-6 py-4 absolute top-0 z-50">
        <div className="text-xl font-black font-serif text-slate-800 tracking-tighter">مِدار</div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700">
              <User className="w-4 h-4 text-indigo-500" />
              <span>{user.displayName || user.email}</span>
            </div>
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-white/50 hover:bg-rose-50 rounded-full border border-slate-200 hover:border-rose-200"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <header className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 opacity-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10 text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900 flex justify-center items-center gap-4">
             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-gray-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-200/50 transform -rotate-3 border border-gray-100">
               <span className="text-white text-2xl font-black">م</span>
             </div>
             مِدار
          </h1>
          <div className="text-xs bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full font-bold uppercase text-blue-700 inline-block tracking-widest">
             Cognitive IDE Mode
          </div>

          <div className="max-w-2xl mx-auto mt-8">
             <p className="text-gray-500 text-lg font-sans mb-10 leading-relaxed">البيئة الإدراكية للابتكار الاجتماعي والتفكير الممنهج. لا تستخدم مِدار لملء النماذج، استخدمه للتفكير المعمق والغوص لاكتشاف الجذور.</p>
             
             <GlassCard className="p-2 flex gap-2 max-w-lg mx-auto shadow-sm">
               <input 
                 type="text" 
                 placeholder="ما هي المبادرة التي تريد هندستها اليوم..."
                 value={newProjectName}
                 onChange={e=>setNewProjectName(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && launchNew()}
                 className="bg-transparent flex-1 px-4 text-gray-900 placeholder-gray-400 outline-none font-sans"
               />
               <button onClick={launchNew} disabled={!newProjectName} className="bg-gray-900 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-black text-white px-8 py-3 rounded-xl transition-colors font-bold shadow-sm">
                 تأسيس
               </button>
             </GlassCard>

             <div className="flex gap-2 justify-center mt-6 flex-wrap">
                <span className="text-xs font-bold text-gray-400 self-center ml-2">قوالب مقترحة:</span>
                <button onClick={() => setNewProjectName('ابتكار اجتماعي للشباب')} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm">ابتكار اجتماعي</button>
                <button onClick={() => setNewProjectName('التحقق من جدوى شركة ناشئة')} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm">تحقق من شركة ناشئة</button>
                <button onClick={() => setNewProjectName('مبادرة تنمية مجتمعية')} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm">مشاريع مجتمعية</button>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 relative z-20 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((p: Project) => (
               <motion.div 
                 key={p.id}
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-white border text-right border-gray-200 p-6 rounded-2xl shadow-sm relative group hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                 onClick={() => openProject(p.id)}
               >
                 <div>
                   <div className="flex justify-between items-start mb-6">
                     <div className="flex bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg items-center gap-2 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Target className="w-4 h-4"/> 
                        {Math.round(p.problem?.score || p.overallScore || 0)}
                     </div>
                     <span className="text-xs text-slate-500 font-mono">{new Date(p.updatedAt).toLocaleDateString()}</span>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
                   <p className="text-gray-500 font-sans text-sm line-clamp-2 leading-relaxed">
                     {p.problem?.text || "مشروع مبدئي، بانتظار التفاصيل..."}
                   </p>
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                   <div className="flex gap-2">
                     {p.stakeholders?.length > 0 && <span className="text-slate-500 bg-gray-50 text-xs px-2 py-1 rounded font-medium border border-gray-100">{p.stakeholders.length} فئة</span>}
                     {p.ideas?.length > 0 && <span className="text-slate-500 bg-gray-50 text-xs px-2 py-1 rounded font-medium border border-gray-100">{p.ideas.length} حلول</span>}
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                     className="text-gray-400 hover:text-rose-500 transition-colors p-2 bg-gray-50 rounded-lg hover:bg-rose-50"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
