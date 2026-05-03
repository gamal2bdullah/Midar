import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Filter, Plus, Target, CheckCircle2, HelpCircle, XCircle, Search } from 'lucide-react';
import { Project, Assumption } from '../../hooks/useStorage';
import { PrimaryButton, cn } from '../../components/ui/shared';
import { evaluateProblemStatement, DeepEngine } from '../../lib/ai-engine';

export const ProblemAnalysis = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [text, setText] = useState(project.problem?.text || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [typingTimer, setTypingTimer] = useState<any>(null);

  const analyze = (val: string) => {
    setText(val);
    updateProject(project.id, { problem: { ...project.problem, text: val } });
    
    if (val.length < 15) return;
    
    setIsAnalyzing(true);
    clearTimeout(typingTimer);
    
    setTypingTimer(setTimeout(async () => {
      // Mocked deep analysis logic here. Normally we run NLP
      const result = { ...project.problem, score: Math.min(100, val.length * 2), text: val };
      
      // Auto Socratic question generation if not generated
      if (!result.socraticQuestion || result.text !== project.problem.text) {
        result.socraticQuestion = await DeepEngine.generatePressureTest(val);
        result.isSocraticAnswered = false;
        result.socraticAnswer = "";
      }

      updateProject(project.id, { problem: result });
      setIsAnalyzing(false);
    }, 1200)); 
  };

  const handleSocraticAnswer = (val: string) => {
    updateProject(project.id, { 
      problem: { 
        ...project.problem, 
        socraticAnswer: val,
        isSocraticAnswered: val.length > 5
      } 
    });
  }

  // --- Assumptions ---
  const [newAsm, setNewAsm] = useState('');
  const [isMining, setIsMining] = useState(false);

  const addAssumption = async () => {
    if(!newAsm || isMining) return;
    const a: Assumption = { id: `asm_${Date.now()}`, text: newAsm, status: 'pending', sourceContext: 'Problem' };
    updateProject(project.id, { assumptions: [a, ...(project.assumptions || [])] });
    setNewAsm('');
    
    setIsMining(true);
    const classification = await DeepEngine.classifyAssumption(a.text);
    
    const updatedStatus = classification.includes('fact') ? 'fact' : classification.includes('guess') ? 'guess' : 'unknown';
    
    updateProject(project.id, {
      assumptions: project.assumptions.map(item => item.id === a.id ? { ...item, status: updatedStatus } : item)
    });
    setIsMining(false);
  };

  const removeAssumption = (id: string) => {
    updateProject(project.id, { assumptions: project.assumptions.filter(a => a.id !== id) });
  };

  const pb = project.problem;

  return (
    <div className="space-y-12 text-right" dir="rtl">
      {/* Problem Definition */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">إضاءة الجذور والتحليل السقراطي</h2>
          <p className="text-gray-500 font-sans text-sm">صف المعاناة والظواهر التي تلاحظها بدقة، ودع مِدار يتحدى فهمك ويستنبط الفجوات والإفتراضات الخفية.</p>
        </div>

        <div className="relative group">
          <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <textarea
            className={cn(
              "w-full h-40 bg-white border rounded-2xl p-6 font-sans focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 resize-none shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] text-gray-900 text-lg leading-relaxed transition-all placeholder-gray-400",
              isAnalyzing ? "border-blue-200" : "border-gray-200"
            )}
            placeholder="المجتمعات تعاني من... بسبب..."
            value={text}
            onChange={e => analyze(e.target.value)}
          />
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm"
              >
                <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
                مِدار يحلل ويستنبط...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isAnalyzing && pb?.socraticQuestion && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-6 border-t border-gray-100 pt-6"
            >
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100/60 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400"></div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                       <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div className="flex-1 w-full">
                      <h4 className="text-amber-900 font-bold mb-1">المحرك السقراطي</h4>
                      <p className="text-amber-800/80 text-sm mb-4 leading-relaxed font-medium">{pb.socraticQuestion}</p>
                      
                      <div className="relative mt-2">
                         <textarea
                           className="w-full bg-white border border-amber-200/60 rounded-xl p-4 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none transition-shadow min-h-[100px]"
                           placeholder="أجب على تساؤل مِدار لدفع تفكيرك أعمق وكشف الزوايا العمياء..."
                           value={pb.socraticAnswer || ''}
                           onChange={e => handleSocraticAnswer(e.target.value)}
                         />
                      </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full h-px bg-gray-100"></div>

      {/* Assumptions Mapping */}
      <div>
        <div className="mb-6 flex gap-3 text-gray-800 items-center">
            <Filter className="w-6 h-6 text-indigo-500" />
            <div>
              <h3 className="font-extrabold text-xl">مختبر الافتراضات (Assumption Archeology)</h3>
              <p className="text-gray-500 text-sm mt-1">اكتب ما تعتبره حقيقة في هذا المشروع وسيصنفه مِدار إلى حقائق مثبتة أو تخمينات بناءً على المنطق اللغوي.</p>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input 
            type="text" 
            placeholder="مثال: المستخدمون مستعدون للدفع لتوفير الوقت..." 
            className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
            value={newAsm} onChange={e=>setNewAsm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addAssumption()}
          />
          <PrimaryButton onClick={addAssumption} disabled={isMining || !newAsm} className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto">
             {isMining ? <BrainCircuit className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
             {isMining ? 'مِدار يحلل...' : 'استخراج'}
          </PrimaryButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {project.assumptions?.map(a => (
              <motion.div 
                initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}}
                key={a.id} 
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative group hover:shadow-md transition-all flex flex-col"
              >
                <button onClick={() => removeAssumption(a.id)} className="absolute top-4 left-4 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors bg-transparent p-2 rounded-lg z-10">
                  <XCircle className="w-5 h-5"/>
                </button>
                <div className="flex-1 pr-2">
                  <p className="text-gray-900 font-medium font-sans text-sm mb-4 leading-relaxed">{a.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                     تصنيف مِدار الإدراكي
                   </div>
                   {a.status === 'fact' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5"/> حقيقة هيكلية</span>}
                   {a.status === 'guess' && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm"><HelpCircle className="w-3.5 h-3.5"/> مجرد تخمين (اختبره)</span>}
                   {a.status === 'unknown' && <span className="bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm"><Search className="w-3.5 h-3.5"/> يتطلب بحثاً وتدقيقاً</span>}
                   {a.status === 'pending' && <span className="bg-gray-50 text-gray-500 border border-gray-200 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm"><BrainCircuit className="w-3.5 h-3.5 animate-pulse"/> قيد التحليل...</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
