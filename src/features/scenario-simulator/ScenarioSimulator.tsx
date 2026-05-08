import React, { useState } from 'react';
import { Project } from '../../hooks/useStorage';
import { GlassCard, PrimaryButton } from '../../components/ui/shared';
import { AlertTriangle, Info, Zap, ShieldAlert, Crosshair, TrendingDown, Eye } from 'lucide-react';
import { MultiAgentOrchestrator } from '../../lib/agents/Pipeline';

export const ScenarioSimulator = ({ project }: { project: Project }) => {
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<{ id: string; title: string; risk: string; mitigation: string; riskScore?: number; sensitivityFactor?: string }[]>([]);

  const generateScenarios = async () => {
    setLoading(true);
    const pipelineContext = {
      project,
      history: project.history.map(h => h.action),
      evidenceData: project.evidence
    };
    const response = await MultiAgentOrchestrator.simulateScenarios(pipelineContext);
    const generated = response?.scenarios;
    
    if (generated && generated.length > 0) {
       setScenarios(generated);
    } else {
       // Fallback logic if AI fails or key is missing
       const ideasText = project.ideas.map(i => i.text).join(" ");
       const fallback = [];
       if (ideasText.includes("رقمي") || ideasText.includes("تطبيق") || ideasText.includes("منص")) {
         fallback.push({
           id: "s1",
           title: "انهيار التبني الرقمي (Digital Abandonment)",
           risk: "المستهدفون يحملون التطبيق ثم يحذفونه بعد ٣ أيام بسبب تعقيد الواجهة.",
           mitigation: "تصميم التدخلات السلوكية (Nudges) منذ اليوم الأول وبناء نسخة 'ويب خفيف'.",
           riskScore: 85,
           sensitivityFactor: "سلوك المستخدم والمهارة التقنية"
         });
       }
       fallback.push({
         id: "s2",
         title: "الجفاف التمويلي المبكر (Premature Scaling)",
         risk: "صرف 70% من الميزانية على التنفيذ قبل تأكيد طلب السوق الفعلي.",
         mitigation: "استخدام منهجية البناء الرشيق (MVP) واختبار المفهوم الأساسي أولاً.",
         riskScore: 92,
         sensitivityFactor: "السيولة ومعدل الحرق المالي"
       });
       setScenarios(fallback);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-100 pb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-rose-900 flex items-center gap-2 mb-2">محاكاة سيناريوهات الانهيار (Pre-Mortem)</h2>
          <p className="text-slate-500 text-sm font-medium">الذكاء المكثف للتوقعات: حلل المخاطر النظامية وقس مستوى الحساسية للمتغيرات (Sensitivity Analysis).</p>
        </div>
        <PrimaryButton onClick={generateScenarios} disabled={loading} className="bg-rose-600 hover:bg-rose-700 shadow-rose-600/30">
          {loading ? <span className="animate-pulse">يتم توليد الأزمات وتصنيف المخاطر...</span> : <><ShieldAlert className="w-4 h-4 mr-2" /> تنشيط محرك الفشل</>}
        </PrimaryButton>
      </div>

      {!scenarios.length && !loading && (
        <div className="text-center text-slate-400 py-16 bg-rose-50/30 rounded-2xl border border-dashed border-rose-200">
           <Zap className="w-12 h-12 mx-auto mb-4 opacity-20 text-rose-500" />
           <p className="text-sm font-bold text-rose-800 opacity-60">اضغط على زر التنشيط لتوليد سيناريوهات الضغط العكسي وتقييم حساسية العوامل.</p>
        </div>
      )}

      {scenarios.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scen, idx) => (
               <div key={scen.id}>
                 <GlassCard className="p-6 border-rose-100 relative overflow-hidden group h-full flex flex-col">
                    <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                           {idx + 1}
                         </div>
                         <h3 className="font-bold text-slate-900">{scen.title}</h3>
                       </div>
                       {scen.riskScore && (
                         <div className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-1 flex items-center gap-1 rounded-md">
                           <TrendingDown className="w-3 h-3" />
                           {scen.riskScore}%
                         </div>
                       )}
                    </div>
                    
                    <div className="space-y-4 flex-grow">
                       {scen.sensitivityFactor && (
                         <div className="text-xs bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-medium flex items-center gap-2">
                           <Eye className="w-4 h-4 text-slate-500" /> عامل الحساسية الرئيسي: <span className="text-slate-800">{scen.sensitivityFactor}</span>
                         </div>
                       )}
                       <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-sm">
                          <span className="font-bold text-rose-800 text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> السيناريو:</span>
                          <p className="text-slate-700 leading-relaxed font-semibold">{scen.risk}</p>
                       </div>
                       
                       <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm">
                          <span className="font-bold text-emerald-800 text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><Crosshair className="w-3 h-3"/> استراتيجية النجاة (Mitigation):</span>
                          <p className="text-slate-700 leading-relaxed">{scen.mitigation}</p>
                       </div>
                    </div>
                 </GlassCard>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
