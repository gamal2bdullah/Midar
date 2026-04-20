import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, ChevronLeft, Plus, FileDown, 
  BrainCircuit, LayoutDashboard, Trash2, 
  Lightbulb, ShieldAlert, Target, Save, Users, AlertCircle, ArrowLeft, Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useProjects, Project, Stakeholder, Idea, ContrastReview } from './hooks/useStorage';
import { calculateRadarStats, evaluateProblemStatement, scoreIdea, classifyContrast, detectTadafu, DeepEngine } from './lib/ai-engine';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --------------------------------------------------------------------------------
// Shared UI Components
// --------------------------------------------------------------------------------

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-6", className)}>
    {children}
  </div>
);

const PrimaryButton = ({ children, onClick, icon: Icon, disabled }: any) => (
  <button 
    disabled={disabled}
    onClick={onClick} 
    className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick} 
    className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-200"
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

const AICard = ({ title, content, type = 'info' }: { title: string, content: React.ReactNode, type?: 'info'|'warning'|'success' }) => {
  const colors = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };
  return (
    <div className={cn("p-4 rounded-xl border flex gap-3 items-start backdrop-blur-sm", colors[type])}>
      <BrainCircuit className={cn("w-5 h-5 flex-shrink-0 mt-0.5 opacity-80")} />
      <div>
        <h4 className="font-bold text-sm mb-1 text-white">{title}</h4>
        <div className="text-sm opacity-90 leading-relaxed font-sans">{content}</div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------
// Wizards Steps
// --------------------------------------------------------------------------------

const StepStakeholders = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [name, setName] = useState('');
  const [need, setNeed] = useState('');

  const add = () => {
    if(!name || !need) return;
    const newS: Stakeholder = { id: `stk_${Date.now()}`, name, need };
    updateProject(project.id, { stakeholders: [...project.stakeholders, newS] });
    setName(''); setNeed('');
  };

  const remove = (id: string) => {
    updateProject(project.id, { stakeholders: project.stakeholders.filter(s => s.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">من هو المستخدم؟</h2>
        <p className="text-gray-500 font-sans">حدد الفئات المتأثرة بالمشكلة واحتياجاتهم العميقة. الابتكار يبدأ بالتعاطف الحقيقي.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="الفئة (مثال: المجتمعات الريفية)" 
          className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          value={name} onChange={e => setName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="الاحتياج العميق..." 
          className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          value={need} onChange={e => setNeed(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <PrimaryButton onClick={add} icon={Plus}>إضافة</PrimaryButton>
      </div>

      <div className="grid gap-3 pt-4">
        <AnimatePresence>
          {project.stakeholders.map(s => (
            <motion.div 
              initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.95}}
              key={s.id} 
              className="flex justify-between items-center bg-white backdrop-blur-sm border border-gray-200 p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{s.name}</h4>
                  <p className="text-sm text-gray-500 font-sans">{s.need}</p>
                </div>
              </div>
              <button onClick={() => remove(s.id)} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors bg-gray-50 p-2 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {project.stakeholders.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white/20 rounded-xl border border-dashed border-white/10 font-sans">
            لا يوجد أطراف متأثرة بعد. ابدأ بإضافة فئة مستهدفة.
          </div>
        )}
      </div>

      {project.stakeholders.length < 2 && project.stakeholders.length > 0 && (
        <AICard 
          type="warning"
          title="نصيحة مِدار" 
          content="اكتشاف فئة واحدة قد يخلق منظوراً ضيقاً للحل. هل يوجد شرائح ثانوية تتأثر بشكل غير مباشر بالمشكلة؟" 
        />
      )}
    </div>
  );
};

const StepProblem5Whys = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [text, setText] = useState(project.problem.text || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [typingTimer, setTypingTimer] = useState<any>(null);

  const analyze = (val: string) => {
    setText(val);
    updateProject(project.id, { problem: { ...project.problem, text: val } });
    
    if (val.length < 15) return;
    
    setIsAnalyzing(true);
    clearTimeout(typingTimer);
    
    setTypingTimer(setTimeout(() => {
      const result = evaluateProblemStatement(val);
      // Keep existing socratic answer if it exists and text hasn't changed drastically
      updateProject(project.id, { 
        problem: {
          ...result,
          socraticAnswer: project.problem.socraticAnswer,
          isSocraticAnswered: project.problem.isSocraticAnswered
        } 
      });
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

  const pb = project.problem;
  const showFeedback = pb.score > 0 || pb.gaps?.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">إضاءة الجذور</h2>
        <p className="text-gray-500 font-sans text-sm">حدد معالم المشكلة. لا تركز على حلك الآن، ركز على "من" يعاني و"لماذا".</p>
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
              مِدار يحلل السياق...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFeedback && !isAnalyzing && pb.socraticQuestion && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
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
                         placeholder="أجب على تساؤل مِدار لدفع تفكيرك أعمق..."
                         value={pb.socraticAnswer || ''}
                         onChange={e => handleSocraticAnswer(e.target.value)}
                       />
                       {pb.isSocraticAnswered && (
                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -left-2 -bottom-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                            <Check className="w-3 h-3" />
                         </motion.div>
                       )}
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showFeedback && (
         <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
           {pb.smartChips?.map((chip, idx) => (
             <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 text-xs font-bold rounded-lg">{chip}</span>
           ))}
           {pb.missingElements?.map((chip, idx) => (
             <span key={idx} className="bg-rose-50 text-rose-600 px-3 py-1 text-xs font-bold rounded-lg border border-rose-100">ناقص: {chip}</span>
           ))}
         </div>
      )}
    </div>
  );
};

const StepAssumptions = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [text, setText] = useState('');
  const [isMining, setIsMining] = useState(false);
  
  const addAssumption = async () => {
    if (!text.trim()) return;
    setIsMining(true);
    const assumptionText = text;
    setText(''); // clear early for UX
    
    // Auto-classify using Transformers.js / DeepEngine
    let determinedStatus = 'unknown';
    if (DeepEngine.ready) {
      determinedStatus = await DeepEngine.classifyAssumption(assumptionText);
    }
    
    const newAssumptions = [...(project.assumptions || []), { 
      id: Date.now().toString(), 
      text: assumptionText, 
      status: determinedStatus,
      sourceContext: 'Manual'
    }];
    updateProject(project.id, { assumptions: newAssumptions });
    setIsMining(false);
  };

  const toggleStatus = (id: string) => {
    const nextStatus = { guess: 'unknown', unknown: 'fact', fact: 'guess', pending: 'guess' } as any;
    const newAss = project.assumptions.map(a => a.id === id ? { ...a, status: nextStatus[a.status] } : a);
    updateProject(project.id, { assumptions: newAss });
  };

  const statusColors = {
    fact: "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100",
    guess: "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100",
    unknown: "border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100",
    pending: "border-blue-200 text-blue-700 bg-blue-50"
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">حفريات الافتراضات</h2>
        <p className="text-gray-500 font-sans text-sm">أغلب المشاريع تنهار لأننا نبنيها على افتراضات نعتقد أنها حقائق. مِدار سيساعدك في تقييم مدى يقينك والمصادقة على أفكارك.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <input 
            disabled={isMining}
            placeholder={isMining ? "مِدار يستنتج طبيعة الافتراض..." : "افترض أن المستفيدين يملكون هواتف ذكية..."}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 font-sans focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 shadow-sm text-gray-900 placeholder-gray-400 transition-all disabled:opacity-60"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
                if (e.key === 'Enter') { 
                    e.preventDefault(); 
                    addAssumption(); 
                }
            }}
          />
        </div>
        <div className="flex flex-col justify-end">
           <PrimaryButton onClick={addAssumption} disabled={isMining} icon={isMining ? BrainCircuit : Plus}>إضافة</PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <AnimatePresence>
          {project.assumptions?.map(a => (
            <motion.div 
              key={a.id} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow"
            >
              <div className="font-sans text-gray-800 mb-4 font-medium leading-relaxed">{a.text}</div>
              <div className="flex justify-between items-center mt-2 border-t border-gray-50 pt-4">
                 <button 
                   onClick={() => toggleStatus(a.id)}
                   className={cn("px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-colors flex items-center justify-center min-w-[100px]", statusColors[a.status as keyof typeof statusColors])}
                 >
                   {a.status === 'fact' ? 'حقيقة مُثبتة' : a.status === 'guess' ? 'تخمين قوي' : a.status === 'pending' ? 'جاري الفحص...' : 'مجهول تماماً'}
                 </button>
                 <button onClick={() => updateProject(project.id, { assumptions: project.assumptions.filter(x => x.id !== a.id) })} className="text-gray-400 hover:text-rose-600 transition-colors bg-gray-50 hover:bg-rose-50 p-2 rounded-lg">
                   <Trash2 className="w-4.5 h-4.5" />
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {(!project.assumptions || project.assumptions.length === 0) && (
         <div className="text-center p-12 border border-dashed border-gray-200 rounded-2xl text-gray-500 font-sans bg-gray-50">
           لائحة الافتراضات فارغة. استخرج الافتراضات المخفية.
         </div>
      )}
    </div>
  );
};

const StepTadafuIdeas = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [idea, setIdea] = useState('');
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  // Auto-detect Tadafu on mount and changes
  useEffect(() => {
    const tensions = detectTadafu(project);
    if (JSON.stringify(tensions) !== JSON.stringify(project.contradictions)) {
       updateProject(project.id, { contradictions: tensions });
    }
  }, [project.ideas, project.stakeholders, project.id, updateProject, project.contradictions]);

  const add = () => {
    if(!idea) return;
    const scored = scoreIdea(idea);
    updateProject(project.id, { ideas: [scored, ...project.ideas] });
    setIdea('');
  };

  const remove = (id: string) => {
    updateProject(project.id, { ideas: project.ideas.filter(i => i.id !== id) });
  };

  const triggerSimulation = async (ideaObj: Idea) => {
    setIsSimulating(ideaObj.id);
    let updatedStakeholders = [...(project.stakeholders || [])];
    
    // Simulate voices for each stakeholder
    for (const sh of updatedStakeholders) {
      if (!sh.voiceReactions) sh.voiceReactions = {};
      const reaction = await DeepEngine.simulateStakeholderResistance(ideaObj.text, sh.need);
      sh.voiceReactions[ideaObj.id] = reaction;
    }
    
    // Generate Pressure Test
    const test = await DeepEngine.generatePressureTest(ideaObj.text);
    
    // Assign back
    const updatedIdeas = project.ideas.map(i => i.id === ideaObj.id ? { ...i, pressureTest: test } : i);
    
    updateProject(project.id, { 
      stakeholders: updatedStakeholders,
      ideas: updatedIdeas
    });
    
    setIsSimulating(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">غرفة الأفكار</h2>
        <p className="text-gray-500 font-sans text-sm">توقف عن بناء حلول في فراغ. اطرح فكرتك ثم دع مِدار يحاكي أصوات الخصوم والمستفيدين ويضع فكرتك تحت الضغط.</p>
      </div>

      <div className="flex gap-4">
        <textarea 
          placeholder="فكرة الحل... (مثال: منصة لا مركزية للتمويل...)" 
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-4 font-sans focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 resize-none h-20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-gray-900 placeholder-gray-400"
          value={idea} onChange={e => setIdea(e.target.value)}
        />
        <div className="flex flex-col justify-end">
           <PrimaryButton onClick={add} icon={Lightbulb}>توليد وقياس</PrimaryButton>
        </div>
      </div>

      {project.contradictions && project.contradictions.length > 0 && (
         <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl mt-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-400"></div>
           <h3 className="font-bold text-rose-800 text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> تناقضات استراتيجية رصدها مِدار
           </h3>
           <div className="space-y-3 text-right">
             {project.contradictions.map(c => (
               <div key={c.id} className="bg-white p-4 rounded-xl border border-rose-100/50 text-sm font-sans text-rose-900 shadow-sm flex flex-col gap-1">
                 <strong className="text-rose-600 block">{c.source} <span className="text-gray-400">تتعارض مع</span> {c.target}</strong> 
                 <p className="text-gray-600 leading-relaxed font-medium">{c.description}</p>
               </div>
             ))}
           </div>
         </div>
      )}

      <div className="space-y-6 pt-4">
        <AnimatePresence>
          {project.ideas.map(i => (
            <motion.div 
              initial={{opacity:0, scale:0.95, y: 15}} animate={{opacity:1, scale:1, y: 0}} exit={{opacity:0, scale:0.95}}
              key={i.id} 
              className="bg-white border text-right border-gray-200 p-6 rounded-3xl shadow-sm relative group transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  <p className="text-gray-900 font-bold font-sans mb-4 text-xl">{i.text}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 border border-blue-100">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>{i.why}</span>
                    </div>
                    {i.pressureTest && (
                       <div className="inline-flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 border border-amber-200">
                          <Target className="w-3.5 h-3.5" /> اختبار الضغط: {i.pressureTest}
                       </div>
                    )}
                  </div>

                  {/* Stakeholder Voices */}
                  {project.stakeholders.some((sh: any) => sh.voiceReactions?.[i.id]) && (
                    <div className="mt-6 border-t border-gray-100 pt-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">محاكاة أصوات الأطراف (Transformers.js)</h4>
                      {project.stakeholders.map((sh: any) => {
                        const reaction = sh.voiceReactions?.[i.id];
                        if (!reaction) return null;
                        const isConflict = reaction.includes('يتعارض');
                        return (
                          <div key={sh.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                             <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm", isConflict ? "bg-rose-500" : "bg-emerald-500")}>
                               {sh.name.substring(0, 2)}
                             </div>
                             <div>
                               <p className="text-xs font-bold text-gray-900 mb-0.5">{sh.name}</p>
                               <p className="text-sm font-medium text-gray-600">"{reaction}"</p>
                             </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {!project.stakeholders.some((sh: any) => sh.voiceReactions?.[i.id]) && project.stakeholders.length > 0 && (
                     <div className="mt-4 border-t border-gray-100 pt-4">
                       <button onClick={() => triggerSimulation(i)} disabled={isSimulating === i.id} className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 transition-colors flex justify-center items-center gap-2">
                          {isSimulating === i.id ? <BrainCircuit className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                          {isSimulating === i.id ? "جاري محاكاة الخصوم..." : "محاكاة صوت المستفيدين والضغط"}
                       </button>
                     </div>
                  )}

                </div>
                <div className="flex flex-col items-center gap-3">
                   <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                     {i.score}
                   </div>
                   <button onClick={() => remove(i.id)} className="text-gray-400 hover:text-rose-500 transition-colors bg-gray-50 hover:bg-rose-50 p-2 rounded-lg w-full flex justify-center">
                     <Trash2 className="w-4.5 h-4.5" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StepContrast = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [critique, setCritique] = useState('');
  const [countermeasure, setCountermeasure] = useState('');

  const add = () => {
    if(!critique || !countermeasure) return;
    const newC: ContrastReview = { id: `crt_${Date.now()}`, critique, countermeasure };
    updateProject(project.id, { contrastReviews: [newC, ...project.contrastReviews] });
    setCritique(''); setCountermeasure('');
  };

  const remove = (id: string) => {
    updateProject(project.id, { contrastReviews: project.contrastReviews.filter(c => c.id !== id) });
  };

  return (
    <div className="space-y-6">
       <div className="text-center max-w-lg mx-auto mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex justify-center items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          مرحلة التباين (Devil's Advocate)
        </h2>
        <p className="text-gray-500 font-sans">هاجم أفكارك الخاصة بلا رحمة. اكتب أسوأ العيوب المتوقعة، ثم صمم تدبيراً مضاداً لحمايتها.</p>
      </div>

      <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">الهجوم (العيوب/المخاطر)</label>
            <textarea 
              value={critique} onChange={e=>setCritique(e.target.value)}
              className="w-full h-24 bg-gray-50 border border-amber-900/50 rounded-xl p-3 text-gray-900 font-sans focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none placeholder-gray-400"
              placeholder="مثال: هذه الفكرة مكلفة جداً وشبه مستحيلة التنفيذ..."
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-500 mb-2">الدفاع (التدبير المضاد)</label>
            <textarea 
              value={countermeasure} onChange={e=>setCountermeasure(e.target.value)}
              className="w-full h-24 bg-gray-50 border border-mint-900/50 rounded-xl p-3 text-gray-900 font-sans focus:ring-2 focus:ring-mint-500 focus:outline-none resize-none placeholder-gray-400"
              placeholder="الاعتماد على شراكات قطاع خاص والبدء بنموذج مصغر..."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={add} className="bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 hover:text-[#0B1121] text-amber-500 px-6 py-2 rounded-xl font-bold text-sm transition-colors text-amber-700">
            حفظ المحاكمة
          </button>
        </div>
      </div>

      <div className="grid gap-4">
         {project.contrastReviews.map(c => (
           <div key={c.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm relative group text-right hover:border-amber-500/20 transition-colors">
             <button onClick={() => remove(c.id)} className="absolute top-4 left-4 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 p-2 rounded-lg">
               <Trash2 className="w-5 h-5"/>
             </button>
             <div className="flex flex-col gap-3">
               <div>
                 <span className="text-xs font-bold tracking-wider text-amber-500 bg-amber-50 border border-amber-900/50 px-2 py-1 rounded inline-block mb-3">الهجوم المكتشف: {classifyContrast(c.critique)}</span>
                 <p className="text-gray-700 font-sans font-medium">{c.critique}</p>
               </div>
               <div className="pl-6 border-r-2 border-mint-500/50 pr-4 mt-2">
                  <p className="text-gray-500 font-sans pb-1">{c.countermeasure}</p>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const StepDashboard = ({ project }: { project: Project }) => {
  const radarData = calculateRadarStats(project);
  const printRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const exportPDF = async () => {
    if (!printRef.current || isExporting) return;
    setIsExporting(true);
    setExportError('');
    
    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      if (!canvas || canvas.width === 0) throw new Error("فشل في التقاط أبعاد المستند.");

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({ orientation: 'portrait', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 5) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Midar_LivingBrief_${project.name}.pdf`);
    } catch (e: any) {
      setExportError(e.message || 'حدث خطأ غير معروف.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">الوثيقة الحية</h2>
          <p className="text-gray-500 font-sans text-sm">مستند استعراض الجاهزية المكتمل، يمثل نظرية التغيير الخاصة بك.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={exportPDF} disabled={isExporting} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 text-sm">
            <FileDown className="w-5 h-5"/> {isExporting ? 'جاري الاستخراج...' : 'تحميل المُلخّص'}
          </button>
          {exportError && <span className="text-rose-600 text-xs font-bold">{exportError}</span>}
        </div>
      </div>

      <GlassCard className="mb-8 p-8 bg-white border-gray-200 relative z-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <h3 className="font-bold text-gray-900 mb-6 text-xl">بوصلة الابتكار (مِدار)</h3>
        <div className="flex flex-col md:flex-row gap-8 items-center cursor-crosshair">
            <div className="h-64 w-full md:w-1/2 group">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 13, fontFamily: 'Tajawal', fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="المشروع" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#2563EB" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 w-full md:w-1/2">
              {radarData.map(r => (
                <div key={r.subject} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 shadow-sm flex flex-col justify-center">
                  <div className="text-2xl font-black text-gray-900">{r.A}</div>
                  <div className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">{r.subject}</div>
                </div>
              ))}
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
             <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-blue-600"/> المشكلة والجذور</h4>
             <p className="text-gray-600 leading-relaxed text-sm mb-4">{project.problem.text || "لم يتم التعريف"}</p>
             {project.problem.socraticAnswer && (
                 <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-blue-900">
                    <strong className="block mb-1 text-blue-700 text-xs tracking-wider uppercase">الإجابة السقراطية (تحليل أعمق)</strong>
                    {project.problem.socraticAnswer}
                 </div>
             )}
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
             <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500"/> أفضل الأفكار والحلول</h4>
             <div className="space-y-4">
                {project.ideas.slice(0, 3).map(idea => (
                   <div key={idea.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <p className="font-bold text-gray-800 text-sm">{idea.text}</p>
                      <div className="flex gap-2 items-center mt-2 flex-wrap">
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md font-bold font-mono">نقاط المحرك: {idea.score}</span>
                        {idea.pressureTest && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold">تم خضوعها للضغط</span>}
                      </div>
                   </div>
                ))}
             </div>
         </div>
      </div>

      <div style={{ position: 'absolute', top: 0, right: '100vw', width: '800px', pointerEvents: 'none', visibility: 'visible', zIndex: -50 }}>
        <div ref={printRef} style={{ backgroundColor: '#ffffff', color: '#111827', padding: '48px', width: '100%', minHeight: '1131px', textAlign: 'right', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>{project.name}</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>تم التوليد بواسطة محرك مِدار للذكاء الاصطناعي - الوثيقة الحية (Theory of Change)</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', marginBottom: '12px' }}>1. التشخيص الدقيق والجذور</h3>
            <p style={{ color: '#374151', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', lineHeight: '1.6', border: '1px solid #e5e7eb' }}>{project.problem.text || "لم يتم إدخال المشكلة"}</p>
            {project.problem.socraticAnswer && (
                 <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', color: '#1e3a8a', fontSize: '14px'}}>
                    <strong style={{display: 'block', marginBottom: '4px', color: '#1d4ed8'}}>الإجابة على التحدي السقراطي:</strong>
                    {project.problem.socraticAnswer}
                 </div>
            )}
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', marginBottom: '12px' }}>2. الخريطة الاستراتيجية للأطراف</h3>
            {project.stakeholders.map(s => (
              <div key={s.id} style={{ marginBottom: '8px', borderLeft: '4px solid #3b82f6', paddingLeft: '12px' }}>
                <strong style={{ color: '#111827' }}>{s.name}:</strong> <span style={{ color: '#4b5563' }}>{s.need}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', marginBottom: '12px' }}>3. الافتراضات الحاكمة</h3>
             <ul style={{ listStyleType: 'none', padding: 0 }}>
              {project.assumptions.map((a, i) => (
                <li key={i} style={{ marginBottom: '8px', color: '#374151', background: '#f9fafb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{a.text}</span>
                  <span style={{ fontWeight: 'bold', color: a.status === 'fact' ? '#059669' : '#d97706' }}>[{a.status === 'fact' ? 'مُثبت' : a.status === 'guess' ? 'تخمين' : 'مجهول'}]</span>
                </li>
              ))}
            </ul>
           </div>

          <div style={{ marginBottom: '32px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', marginBottom: '12px' }}>4. الحلول المطروحة واختبارات الضغط</h3>
             {project.ideas.map((idea, idx) => (
                <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                   <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px', color: '#111827' }}>{idx + 1}. {idea.text}</p>
                   <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>سبب التميز: {idea.why}</p>
                   {idea.pressureTest && (
                       <p style={{ color: '#9a3412', fontSize: '13px', backgroundColor: '#fffbeb', padding: '10px', borderRadius: '8px', border: '1px solid #fef3c7' }}><strong>اختبار الضغط:</strong> {idea.pressureTest}</p>
                   )}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
const STEPS = [
  { id: 'stk', title: 'الأطراف', icon: Users },
  { id: 'prob', title: 'المعاناة', icon: Target },
  { id: 'asm', title: 'الافتراضات', icon: BrainCircuit },
  { id: 'ide', title: 'التدافع والحلول', icon: Lightbulb },
  { id: 'con', title: 'التباين', icon: ShieldAlert },
  { id: 'dash', title: 'الخلاصة', icon: LayoutDashboard }
];

const WizardView = ({ project, updateProject, onClose }: { project: Project, updateProject: any, onClose: ()=>void }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const prev = () => setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
  const next = () => setCurrentStepIndex(Math.min(STEPS.length - 1, currentStepIndex + 1));

  const StepContent = () => {
    switch(currentStepIndex) {
      case 0: return <StepStakeholders project={project} updateProject={updateProject} />;
      case 1: return <StepProblem5Whys project={project} updateProject={updateProject} />;
      case 2: return <StepAssumptions project={project} updateProject={updateProject} />;
      case 3: return <StepTadafuIdeas project={project} updateProject={updateProject} />;
      case 4: return <StepContrast project={project} updateProject={updateProject} />;
      case 5: return <StepDashboard project={project} />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-transparent pb-24 text-right flex flex-col" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-50/80 backdrop-blur-3xl border-b border-gray-200 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-500 transition-colors">
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <h1 className="font-bold text-lg text-gray-900">{project.name}</h1>
          </div>
          <div className="text-xs font-bold text-blue-700 bg-cyan-950/50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"/>
            Midar Active
          </div>
        </div>
        
        {/* Progress Timeline */}
        <div className="container mx-auto px-4 py-4 flex justify-between relative max-w-4xl">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-50 -z-10 -translate-y-1/2 rounded-full"></div>
          {STEPS.map((s, idx) => {
            const active = idx === currentStepIndex;
            const past = idx < currentStepIndex;
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 relative bg-transparent px-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2",
                  active ? "bg-gray-50 border-[#0EA5E9] text-[#0EA5E9] shadow-[0_0_15px_rgba(14,165,233,0.4)]" : 
                  past ? "bg-gray-900 border-[#0EA5E9] text-white" : "bg-white border-gray-200 text-slate-500"
                )}>
                  {past ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={cn("text-xs font-bold hidden md:block transition-colors", active ? "text-[#0EA5E9]" : past ? "text-gray-700" : "text-slate-600")}>{s.title}</span>
              </div>
            )
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 max-w-4xl mt-36 flex-1">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
             {StepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Floating Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-50/90 backdrop-blur-xl border-t border-gray-200 p-4 z-40">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <button onClick={prev} disabled={currentStepIndex===0} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm text-gray-500">
             السابق <ChevronRight className="w-4 h-4 ml-2"/>
          </button>
          {currentStepIndex < STEPS.length - 1 ? (
             <button onClick={next} className="flex items-center justify-center gap-2 bg-slate-100 text-[#0B1121] px-8 py-3 rounded-xl hover:bg-white transition-colors shadow-lg shadow-white/5 font-bold text-sm">التالي <ChevronLeft className="w-4 h-4 mr-2"/></button>
          ) : (
            <button onClick={onClose} className="flex items-center justify-center gap-2 bg-mint-500 text-[#0B1121] px-8 py-3 rounded-xl hover:bg-mint-400 transition-colors shadow-lg shadow-mint-500/20 font-bold text-sm"><Check className="w-4 h-4 mr-2"/> إنهاء وحفظ</button>
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------
// Home Screen
// --------------------------------------------------------------------------------

const HomeView = ({ projects, loading, createProject, openProject, deleteProject }: any) => {
  const [newProjectName, setNewProjectName] = useState('');

  const launchNew = async () => {
    if(!newProjectName) return;
    const id = await createProject(newProjectName);
    openProject(id);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-cyan-500 font-sans"><BrainCircuit className="w-8 h-8 animate-pulse mr-3"/> يتم استنهاض مِدار...</div>;

  return (
    <div className="min-h-screen bg-transparent pb-24 text-right" dir="rtl">
      <header className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-900 opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10 text-center space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-l from-white via-slate-200 to-slate-500 bg-clip-text text-transparent flex justify-center items-center gap-4">
             <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-gray-800 rounded-xl flex items-center justify-center shadow-lg shadow-gray-900/10 transform -rotate-3">
               <span className="text-white text-2xl font-black">م</span>
             </div>
             مِدار
          </h1>
          <div className="text-xs border border-blue-100 bg-blue-50 px-4 py-1.5 rounded-full font-bold uppercase text-blue-700 inline-block tracking-widest">
             Cognitive IDE Mode
          </div>

          <div className="max-w-2xl mx-auto mt-8">
             <p className="text-gray-500 text-lg font-sans mb-10 leading-relaxed">البيئة الإدراكية للابتكار الاجتماعي والتفكير الممنهج. لا تستخدم مِدار لملء النماذج، استخدمه للتفكير المعمق والغوص لاكتشاف الجذور.</p>
             
             <GlassCard className="p-2 flex gap-2 max-w-lg mx-auto">
               <input 
                 type="text" 
                 placeholder="ما هي المبادرة التي تريد هندستها اليوم..."
                 value={newProjectName}
                 onChange={e=>setNewProjectName(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && launchNew()}
                 className="bg-transparent flex-1 px-4 text-gray-900 placeholder-gray-400 outline-none font-sans"
               />
               <button onClick={launchNew} disabled={!newProjectName} className="bg-gray-900 disabled:bg-gray-50 disabled:text-slate-500 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl transition-colors font-bold">
                 تأسيس
               </button>
             </GlassCard>
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
                 className="glass-card hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                 onClick={() => openProject(p.id)}
               >
                 <div>
                   <div className="flex justify-between items-start mb-6">
                     <div className="flex bg-cyan-950/50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg items-center gap-2 font-bold text-lg group-hover:bg-gray-900 group-hover:text-white transition-colors">
                        <Target className="w-4 h-4"/> 
                        {Math.round(p.problem?.score || p.overallScore || 0)}
                     </div>
                     <span className="text-xs text-slate-500 font-mono">{new Date(p.updatedAt).toLocaleDateString()}</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                   <p className="text-gray-500 font-sans text-sm line-clamp-2 leading-relaxed">
                     {p.problem?.text || "مشروع مبدئي، بانتظار التفاصيل..."}
                   </p>
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                   <div className="flex gap-2">
                     {p.stakeholders?.length > 0 && <span className="text-slate-500 text-xs px-2 py-1 rounded font-medium border border-gray-100">{p.stakeholders.length} فئات</span>}
                     {p.ideas?.length > 0 && <span className="text-slate-500 text-xs px-2 py-1 rounded font-medium border border-gray-100">{p.ideas.length} أفكار</span>}
                     {p.contradictions?.length > 0 && <span className="text-amber-500 text-xs px-2 py-1 rounded font-medium border border-amber-900/50 bg-amber-950/20">{p.contradictions.length} تدافع</span>}
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                     className="text-slate-600 hover:text-rose-500 transition-colors p-2 bg-gray-50 rounded-lg"
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

// --------------------------------------------------------------------------------
// Entry Point
// --------------------------------------------------------------------------------

export default function App() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (activeProject) {
    return (
      <WizardView 
        project={activeProject} 
        updateProject={updateProject} 
        onClose={() => setActiveProjectId(null)} 
      />
    );
  }

  return (
    <HomeView 
      projects={projects} 
      loading={loading} 
      createProject={createProject} 
      openProject={setActiveProjectId} 
      deleteProject={deleteProject}
    />
  );
}
