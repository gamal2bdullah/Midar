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
import { calculateRadarStats, evaluateProblemStatement, scoreIdea, classifyContrast } from './lib/ai-engine';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --------------------------------------------------------------------------------
// Shared UI Components
// --------------------------------------------------------------------------------

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl p-6", className)}>
    {children}
  </div>
);

const PrimaryButton = ({ children, onClick, icon: Icon, disabled }: any) => (
  <button 
    disabled={disabled}
    onClick={onClick} 
    className="flex items-center justify-center gap-2 bg-[#0F172A] text-white px-6 py-3 rounded-xl hover:bg-[#0EA5E9] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick} 
    className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

const AICard = ({ title, content, type = 'info' }: { title: string, content: React.ReactNode, type?: 'info'|'warning'|'success' }) => {
  const colors = {
    info: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-mint-50 border-mint-200 text-mint-900',
  };
  return (
    <div className={cn("p-4 rounded-xl border flex gap-3 items-start", colors[type])}>
      <BrainCircuit className={cn("w-5 h-5 flex-shrink-0 mt-0.5 opacity-80")} />
      <div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
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
        <h2 className="text-2xl font-bold text-slate-900 mb-2">من هو المستخدم؟</h2>
        <p className="text-slate-500 font-sans">حدد الفئات المتأثرة بالمشكلة واحتياجاتهم العميقة. الابتكار يبدأ بالتعاطف الحقيقي.</p>
      </div>

      <div className="flex gap-4">
        <input 
          type="text" 
          placeholder="الفئة (مثال: المجتمعات الريفية)" 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={name} onChange={e => setName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="الاحتياج العميق..." 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{s.name}</h4>
                  <p className="text-sm text-slate-500 font-sans">{s.need}</p>
                </div>
              </div>
              <button onClick={() => remove(s.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {project.stakeholders.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
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

const StepProblem = ({ project, updateProject }: { project: Project, updateProject: any }) => {
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
      updateProject(project.id, { problem: result });
      setIsAnalyzing(false);
    }, 1200)); // Debounced to feel like deep analysis
  };

  const pb = project.problem;
  const showFeedback = pb.score > 0 || pb.gaps?.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">جذور المُعاناة</h2>
        <p className="text-slate-500 font-sans">تحديد المشكلة بدقة هو نصف الحل. صف معاناة المستخدم بوضوح، واربطها بالأسباب العميقة.</p>
      </div>

      <div className="relative">
        <textarea
          className={cn(
            "w-full h-40 bg-white border rounded-2xl p-5 font-sans focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none shadow-sm text-slate-800 text-lg leading-relaxed transition-colors",
            isAnalyzing ? "border-cyan-200 bg-cyan-50/10" : "border-slate-200"
          )}
          placeholder="المجتمعات تعاني من... بسبب..."
          value={text}
          onChange={e => analyze(e.target.value)}
        />
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute bottom-4 left-4 text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-full flex items-center gap-2"
            >
              <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
              مِدار يحلل...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFeedback && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              <div className="md:col-span-1 flex flex-col gap-3">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="text-5xl font-bold text-slate-800 mb-2">{pb.score}<span className="text-xl text-slate-400">/100</span></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">الجاهزية التأسيسية</span>
                </div>
                {pb.smartChips?.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {pb.smartChips.map(chip => (
                       <span key={chip} className="bg-cyan-50 border border-cyan-100 text-cyan-700 px-2 py-1 flex items-center gap-1 rounded-md text-xs font-bold font-sans">
                         <Target className="w-3 h-3" /> {chip}
                       </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 space-y-3">
                <AICard 
                  type={pb.score > 70 ? 'success' : 'info'}
                  title="البصيرة التحليلية" 
                  content={pb.feedback} 
                />
                
                {pb.missingElements?.length > 0 && (
                  <div className="flex gap-2 items-start mt-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-sans text-slate-600">
                      <span className="font-bold text-slate-800">عناصر مفقودة:</span> {pb.missingElements.join('، ')}
                    </p>
                  </div>
                )}

                {pb.gaps?.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-sans text-sm space-y-2 mt-4">
                    <span className="font-bold text-slate-800 block mb-2">إرشادات التحسين:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {pb.gaps.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                )}

                {pb.nextAction && (
                  <div className="mt-4 inline-block bg-[#0F172A] text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="font-bold">التوصية التالية:</span> <span className="font-sans">{pb.nextAction}</span>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StepIdeation = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [idea, setIdea] = useState('');

  const add = () => {
    if(!idea) return;
    const scored = scoreIdea(idea);
    updateProject(project.id, { ideas: [scored, ...project.ideas] });
    setIdea('');
  };

  const remove = (id: string) => {
    updateProject(project.id, { ideas: project.ideas.filter(i => i.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">مولّد الابتكار</h2>
        <p className="text-slate-500 font-sans">اطرح حلولاً غير تقليدية. دع محرك مِدار يقيم مدى الابتكار والجدوى مباشرة.</p>
      </div>

      <div className="flex gap-4">
        <textarea 
          placeholder="فكرة الحل... (مثال: تطبيق ذكي للربط بين...)" 
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-16 shadow-sm"
          value={idea} onChange={e => setIdea(e.target.value)}
        />
        <div className="flex flex-col justify-end">
           <PrimaryButton onClick={add} icon={Lightbulb}>توليد</PrimaryButton>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <AnimatePresence>
          {project.ideas.map(i => (
            <motion.div 
              initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}}
              key={i.id} 
              className="bg-white border text-right border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-slate-800 font-medium font-sans mb-3 text-lg">{i.text}</p>
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-100">
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-500" />
                    <span>مِدار: {i.why}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-800">
                     {i.score}
                   </div>
                   <button onClick={() => remove(i.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Trash2 className="w-4 h-4" />
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
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex justify-center items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          مرحلة التباين (Devil's Advocate)
        </h2>
        <p className="text-slate-500 font-sans">هاجم أفكارك الخاصة بلا رحمة. اكتب أسوأ العيوب المتوقعة، ثم صمم تدبيراً مضاداً لحمايتها.</p>
      </div>

      <div className="bg-[#0F172A] rounded-2xl p-6 shadow-xl text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">الهجوم (العيوب/المخاطر)</label>
            <textarea 
              value={critique} onChange={e=>setCritique(e.target.value)}
              className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-slate-100 font-sans focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none"
              placeholder="مثال: هذه الفكرة مكلفة جداً وشبه مستحيلة التنفيذ..."
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">الدفاع (التدبير المضاد)</label>
            <textarea 
              value={countermeasure} onChange={e=>setCountermeasure(e.target.value)}
              className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-slate-100 font-sans focus:ring-2 focus:ring-mint-400 focus:outline-none resize-none"
              placeholder="الاعتماد على شراكات قطاع خاص والبدء بنموذج مصغر..."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={add} className="bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-2 rounded-xl font-bold text-sm transition-colors">
            حفظ المحاكمة
          </button>
        </div>
      </div>

      <div className="grid gap-4">
         {project.contrastReviews.map(c => (
           <div key={c.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm relative group text-right">
             <button onClick={() => remove(c.id)} className="absolute top-4 left-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
               <Trash2 className="w-5 h-5"/>
             </button>
             <div className="flex flex-col gap-3">
               <div>
                 <span className="text-xs font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block mb-1">الهجوم المكتشف: {classifyContrast(c.critique)}</span>
                 <p className="text-slate-800 font-sans font-medium">{c.critique}</p>
               </div>
               <div className="pl-6 border-r-2 border-mint-400 pr-4 mt-2">
                  <p className="text-slate-600 font-sans pb-1">{c.countermeasure}</p>
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

  const exportPDF = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', format: 'a4' });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save(`Midar_${project.name}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">الخلاصة التنفيذية</h2>
          <p className="text-slate-500 font-sans text-sm">مستند استعراض الجاهزية.</p>
        </div>
        <PrimaryButton onClick={exportPDF} icon={FileDown}>استخراج PDF</PrimaryButton>
      </div>

       {/* Visible Render */}
      <GlassCard className="mb-8">
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 13, fontFamily: 'Tajawal' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="المشروع" dataKey="A" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {radarData.map(r => (
            <div key={r.subject} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <div className="text-lg font-bold text-slate-800">{r.A}</div>
              <div className="text-xs text-slate-500 mt-1">{r.subject}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Hidden Render target for export to keep A4 proportions neat without messing up mobile view */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={printRef} style={{ backgroundColor: '#ffffff', color: '#0F172A', padding: '48px', width: '800px', minHeight: '1131px', textAlign: 'right', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0F172A', marginBottom: '8px' }}>{project.name}</h1>
            <p style={{ color: '#64748b' }}>تم التوليد بواسطة محرك مِدار للذكاء الاصطناعي المركزي</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0EA5E9', marginBottom: '12px' }}>1. جذور المشكلة</h3>
            <p style={{ color: '#334155', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', lineHeight: '1.6', border: '1px solid #e2e8f0' }}>{project.problem.text || "لم يتم إدخال المشكلة"}</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0EA5E9', marginBottom: '12px' }}>2. الأطراف المتأثرة</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {project.stakeholders.length === 0 && <p style={{ color: '#64748b' }}>لم يتم تحديد الأطراف المتأثرة</p>}
                 {project.stakeholders.map(s => (
                   <div key={s.id} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                     <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{s.name}:</span> <span style={{ color: '#475569', paddingRight: '8px' }}>{s.need}</span>
                   </div>
                 ))}
             </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0EA5E9', marginBottom: '12px' }}>3. حلول الابتكار</h3>
             <ul style={{ listStyleType: 'disc', paddingInlineStart: '20px', margin: 0, paddingLeft: 0, paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {project.ideas.length === 0 && <p style={{ color: '#64748b' }}>لم يتم اقتراح حلول بعد</p>}
                {project.ideas.map((i, idx) => (
                  <li key={i.id} style={{ color: '#1e293b' }}>
                    {i.text} <span style={{ color: '#94a3b8', fontSize: '14px' }}>({i.score}/10)</span>
                  </li>
                ))}
             </ul>
          </div>
          
           <div style={{ marginBottom: '32px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0EA5E9', marginBottom: '12px' }}>4. إدارة المخاطر (نتيجة محاكمة التباين)</h3>
             {project.contrastReviews.length === 0 && <p style={{ color: '#64748b' }}>لم يتم استخدام المحاكمة بعد</p>}
             {project.contrastReviews.map(c => (
               <div key={c.id} style={{ marginBottom: '12px', borderRight: '4px solid #fbbf24', paddingRight: '16px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px 0 0 8px', border: '1px solid #f1f5f9', borderRightWidth: '4px' }}>
                 <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>الخطر: {c.critique}</p>
                 <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>التدبير: {c.countermeasure}</p>
               </div>
             ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '12px', letterSpacing: '0.1em' }} className="uppercase">
            MIDAR OFFLINE INTELLIGENCE ENGINE V2.0
          </div>
        </div>
      </div>
      
    </div>
  );
}

// --------------------------------------------------------------------------------
// Layouts
// --------------------------------------------------------------------------------

const STEPS = [
  { id: 'stk', title: 'الأطراف', icon: Users },
  { id: 'prob', title: 'المعاناة', icon: Target },
  { id: 'ide', title: 'الابتكار', icon: Lightbulb },
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
      case 1: return <StepProblem project={project} updateProject={updateProject} />;
      case 2: return <StepIdeation project={project} updateProject={updateProject} />;
      case 3: return <StepContrast project={project} updateProject={updateProject} />;
      case 4: return <StepDashboard project={project} />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <h1 className="font-bold text-lg text-slate-800">{project.name}</h1>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">Midar Engine</div>
        </div>
        
        {/* Progress Timeline */}
        <div className="container mx-auto px-4 py-4 flex justify-between relative max-w-4xl">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
          {STEPS.map((s, idx) => {
            const active = idx === currentStepIndex;
            const past = idx < currentStepIndex;
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 relative bg-white px-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2",
                  active ? "bg-white border-[#0EA5E9] text-[#0EA5E9]" : 
                  past ? "bg-[#0F172A] border-[#0F172A] text-white" : "bg-white border-slate-200 text-slate-300"
                )}>
                  {past ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={cn("text-xs font-bold hidden md:block transition-colors", active ? "text-[#0EA5E9]" : past ? "text-slate-700" : "text-slate-400")}>{s.title}</span>
              </div>
            )
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 max-w-4xl mt-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
             <GlassCard>{StepContent()}</GlassCard>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Floating Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-40">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <SecondaryButton onClick={prev} disabled={currentStepIndex===0} icon={ChevronRight}>السابق</SecondaryButton>
          {currentStepIndex < STEPS.length - 1 ? (
             <PrimaryButton onClick={next}>التالي <ChevronLeft className="w-4 h-4 ml-2 inline"/></PrimaryButton>
          ) : (
            <PrimaryButton onClick={onClose} icon={Check}>إنهاء وحفظ</PrimaryButton>
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

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 font-sans">يتم تجهيز مُحرك مِدار...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-right" dir="rtl">
      <header className="bg-[#0F172A] text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0EA5E9] opacity-20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                 <span className="text-white text-xl font-black">م</span>
               </div>
               مِدار
            </h1>
            <div className="text-xs border border-slate-700 bg-slate-800/50 px-3 py-1.5 rounded-full font-bold uppercase text-slate-300">
               OFFLINE MODE
            </div>
          </div>

          <div className="max-w-2xl">
             <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">الابتكار بذكاء محلي.</h2>
             <p className="text-slate-400 text-lg font-sans mb-10 leading-relaxed">منصة متكاملة لتصميم المشاريع الاجتماعية والابتكارية، تصطحبك من تحديد الأطراف المتأثرة حتى المستند التنفيذي المحكم، بصلاحية أوفلاين كاملة.</p>
             
             <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl flex max-w-lg border border-white/10 shadow-xl focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
               <input 
                 type="text" 
                 placeholder="اسم المبادرة الجديدة..."
                 value={newProjectName}
                 onChange={e=>setNewProjectName(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && launchNew()}
                 className="bg-transparent flex-1 px-4 text-white placeholder-slate-400 focus:outline-none font-sans"
               />
               <button onClick={launchNew} className="bg-[#0EA5E9] hover:bg-cyan-500 text-white px-5 py-3 rounded-xl transition-colors shadow-md flex items-center gap-2 font-bold">
                 <Plus className="w-5 h-5" /> <span>إنشاء</span>
               </button>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((p: Project) => (
               <motion.div 
                 key={p.id}
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all cursor-pointer group flex flex-col justify-between"
                 onClick={() => openProject(p.id)}
               >
                 <div>
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex bg-cyan-50 text-cyan-600 px-3 py-1.5 rounded-lg items-center gap-2 font-bold text-lg group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors shadow-sm">
                        <Target className="w-4 h-4"/> 
                        {Math.round(p.problem?.score || p.overallScore || 0)}
                     </div>
                     <span className="text-xs text-slate-400 font-sans">{new Date(p.updatedAt).toLocaleDateString()}</span>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">{p.name}</h3>
                   <p className="text-slate-500 font-sans text-sm line-clamp-2 leading-relaxed">
                     {p.problem?.text || "لا يوجد وصف للمشكلة بعد. ابدأ بالتعديل لإضافة التفاصيل."}
                   </p>
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                   <div className="flex gap-2">
                     {p.stakeholders?.length > 0 && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">{p.stakeholders.length} فئات</span>}
                     {p.ideas?.length > 0 && <span className="bg-mint-50 text-mint-700 text-xs px-2 py-1 rounded font-medium">{p.ideas.length} أفكار</span>}
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                     className="text-slate-300 hover:text-red-500 transition-colors p-2"
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
