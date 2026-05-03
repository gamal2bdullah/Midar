import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Plus, Search, Trash2, Link, FileText, Activity } from 'lucide-react';
import { Project, Evidence } from '../../hooks/useStorage';
import { PrimaryButton, cn } from '../../components/ui/shared';

export const EvidenceBoard = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [type, setType] = useState<'data' | 'quote' | 'observation' | 'research'>('data');
  const [confidence, setConfidence] = useState(50);

  const add = () => {
    if(!content || !source) return;
    const newEvidence: Evidence = { id: `ev_${Date.now()}`, content, source, type, confidence };
    updateProject(project.id, { evidence: [newEvidence, ...(project.evidence || [])] });
    setContent(''); setSource(''); setConfidence(50);
  };

  const remove = (id: string) => {
    updateProject(project.id, { evidence: project.evidence.filter(e => e.id !== id) });
  };

  const getTypeIcon = (t: string) => {
    switch(t) {
      case 'data': return <Database className="w-5 h-5 text-indigo-500" />;
      case 'quote': return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'observation': return <Activity className="w-5 h-5 text-amber-500" />;
      default: return <Search className="w-5 h-5 text-blue-500" />;
    }
  }

  const getTypeLabel = (t: string) => {
    switch(t) {
      case 'data': return 'بيانات كمية';
      case 'quote': return 'اقتباس حي';
      case 'observation': return 'ملاحظة ميدانية';
      default: return 'بحث مكتبي';
    }
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="text-center max-w-lg mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">جدار الأدلة</h2>
        <p className="text-gray-500 font-sans text-sm">اربط كل مسار بأدلة حقيقية من الميدان أو إحصاءات. الابتكار المبني على الرغبات ينهار، والمبني على الأدلة يستمر.</p>
      </div>

      <div className="bg-white border text-right border-gray-100 shadow-sm p-6 rounded-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <textarea 
            placeholder="نص الدليل أو الاقتباس..." 
            className="col-span-1 md:col-span-2 bg-gray-50 border border-gray-200 shadow-sm rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 min-h-[100px] resize-none"
            value={content} onChange={e => setContent(e.target.value)}
          />
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 w-full gap-2 overflow-x-auto">
             {['data', 'quote', 'observation', 'research'].map(t => (
               <button 
                 key={t}
                 onClick={() => setType(t as any)}
                 className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap px-4", type === t ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:bg-gray-100")}
               >
                 {getTypeLabel(t)}
               </button>
             ))}
          </div>
          <input 
            type="text" 
            placeholder="المصدر أو المرجع (رابط، شخص، تقرير)..." 
            className="flex-1 bg-gray-50 border border-gray-200 shadow-sm rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
            value={source} onChange={e => setSource(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between mb-4">
           <span className="text-sm font-bold text-gray-700">مستوى الثقة في الدليل: <span className="text-blue-600">{confidence}%</span></span>
           <input type="range" min="10" max="100" step="10" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-1/2" />
        </div>
        <div className="flex justify-end">
           <PrimaryButton onClick={add} icon={Plus} disabled={!content || !source}>أرشفة الدليل</PrimaryButton>
        </div>
      </div>

      <div className="columns-1 md:columns-2 gap-6 space-y-6">
        <AnimatePresence>
          {project.evidence?.map(e => (
            <motion.div 
              initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}}
              key={e.id} 
              className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm break-inside-avoid relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                     {getTypeIcon(e.type)}
                   </div>
                   <span className="font-bold text-gray-800 text-sm">{getTypeLabel(e.type)}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-500 font-bold">الثقة: {e.confidence}%</span>
                   <button onClick={() => remove(e.id)} className="text-gray-300 hover:text-rose-500 transition-colors p-1 rounded hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <p className="text-gray-900 font-serif leading-relaxed mb-4 text-lg">"{e.content}"</p>
              
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50/50 p-2 rounded-lg border border-blue-50 font-sans">
                 <Link className="w-3.5 h-3.5" />
                 <span className="font-medium truncate">{e.source}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(!project.evidence || project.evidence.length === 0) && (
          <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 font-sans shadow-inner">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
            لا توجد أدلة مرجعية بعد. لا تبنِ مشروعاً على الفراغ.
          </div>
      )}
    </div>
  );
};
