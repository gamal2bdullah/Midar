import React, { useState } from 'react';
import { Project, Decision } from '../../hooks/useStorage';
import { GlassCard, PrimaryButton } from '../../components/ui/shared';
import { Check, X, Clock, ShieldAlert, Sparkles, BrainCircuit } from 'lucide-react';
import { MultiAgentOrchestrator } from '../../lib/agents/Pipeline';

export const DecisionLog = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [title, setTitle] = useState('');
  const [rationale, setRationale] = useState('');
  const [isCritiquing, setIsCritiquing] = useState<string | null>(null);

  const add = async () => {
    if(!title || !rationale) return;
    const newId = `dec_${Date.now()}`;
    const newDecision: Decision = {
      id: newId,
      title,
      rationale,
      status: 'pending',
      timestamp: Date.now()
    };
    
    // Optimistic update
    const currentDecisions = [newDecision, ...(project.decisions || [])];
    updateProject(project.id, { decisions: currentDecisions });
    
    setTitle('');
    setRationale('');

    // Generate critique asynchronously
    setIsCritiquing(newId);
    
    const pipelineContext = {
      project,
      history: project.history.map(h => h.action),
      evidenceData: project.evidence
    };
    
    const decisionTopic = `Decision: ${newDecision.title}\nRationale: ${newDecision.rationale}`;
    const aiResults = await MultiAgentOrchestrator.executeDecisionPipeline(pipelineContext, decisionTopic);
    
    // Process results into decision
    const updatedDecision: Decision = { 
      ...newDecision, 
    };

    if (aiResults?.synthesis) {
      updatedDecision.criticism = aiResults.synthesis.executiveSummary || aiResults.critique?.weaknesses?.join('\n');
      updatedDecision.expectedOutcomes = aiResults.synthesis.expectedOutcomes;
    }
    
    if (aiResults?.critique) {
      updatedDecision.risks = aiResults.critique.weaknesses;
      updatedDecision.criticism = (updatedDecision.criticism ? updatedDecision.criticism + '\n\n' : '') + 
        `Risk Level: ${aiResults.critique.riskLevel} | Confidence: ${aiResults.critique.confidenceScore}%\n` + 
        (aiResults.critique.counterArguments?.map((c: string) => `- ${c}`).join('\n') || '');
    }

    if (aiResults?.research) {
      updatedDecision.linkedEvidenceIds = aiResults.research.foundEvidence;
    }

    const updatedDecisions = currentDecisions.map(d => d.id === newId ? updatedDecision : d);
    updateProject(project.id, { decisions: updatedDecisions });
    setIsCritiquing(null);
  };

  const updateDecisionStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = (project.decisions || []).map(d => d.id === id ? { ...d, status } : d);
    updateProject(project.id, { decisions: updated });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-2">الذكاء في اتخاذ القرار</h2>
        <p className="text-gray-500 text-sm font-medium">وثّق القرارات المصيرية للمشروع، أسبابها، وحالتها للمراجعة، لضمان ذاكرة مؤسسية وحكومة متماسكة للقرارات. سيدرس فريق العملاء الوكلاء (الاستراتيجي፣ الباحث، والناقد) قرارك لتوفير رؤية 360 درجة.</p>
      </div>

      <GlassCard className="p-6 bg-slate-50 border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-slate-500" />
          توثيق قرار جديد
        </h3>
        <div className="space-y-4">
          <input 
            value={title} onChange={e=>setTitle(e.target.value)}
            placeholder="عنوان القرار (مثل: الاعتماد على تطبيق موبايل)"
            className="w-full text-sm font-bold bg-white border border-slate-200 outline-none rounded-xl p-3 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder-slate-400"
          />
          <textarea 
            value={rationale} onChange={e=>setRationale(e.target.value)}
            placeholder="الحيثيات والمبررات: لماذا اتخذنا هذا القرار؟ ما هي البدائل التي تم استبعادها؟"
            className="w-full text-sm bg-white border border-slate-200 outline-none rounded-xl p-3 resize-y min-h-[100px] focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder-slate-400"
          />
          <div className="flex justify-end">
            <PrimaryButton onClick={add} disabled={!title || !rationale}>توثيق القرار وتحليل AI</PrimaryButton>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        {(!project.decisions || project.decisions.length === 0) ? (
          <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-dashed border-slate-200">
             <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-20" />
             <p className="text-sm font-bold">لم يتم تسجيل أي قرارات بعد.</p>
          </div>
        ) : (
          project.decisions.map(d => (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5 items-start">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-slate-900">{d.title}</h4>
                  {d.status === 'pending' && <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1"><Clock className="w-3 h-3"/> مقترح</span>}
                  {d.status === 'approved' && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1"><Check className="w-3 h-3"/> مُعتمد</span>}
                  {d.status === 'rejected' && <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100 flex items-center gap-1"><X className="w-3 h-3"/> مستبعد</span>}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{d.rationale}</p>
                
                {(d.criticism || isCritiquing === d.id) && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl relative space-y-3">
                    <div className="flex items-center gap-2 mb-1 border-b border-indigo-100/50 pb-2">
                      <BrainCircuit className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-indigo-800">تحليل فريق الوكلاء الذكي (Multi-Agent Synthesis)</span>
                    </div>
                    {isCritiquing === d.id ? (
                      <p className="text-sm text-indigo-500 animate-pulse font-medium">جاري تحليل القرار من قبل الباحث والناقد والاستراتيجي...</p>
                    ) : (
                      <div className="text-sm text-indigo-900 leading-relaxed space-y-3">
                        <div className="font-semibold">{d.criticism?.split('\n')[0]}</div>
                        {d.risks && d.risks.length > 0 && (
                          <div className="mt-2">
                            <span className="font-bold text-rose-700 text-xs uppercase block mb-1">المخاطر المحتملة:</span>
                            <ul className="list-disc list-inside text-rose-800 text-xs space-y-1">
                              {d.risks.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                        {d.expectedOutcomes && d.expectedOutcomes.length > 0 && (
                          <div className="mt-2 text-indigo-800 bg-white/40 p-2 rounded-lg border border-indigo-100/50">
                            <span className="font-bold text-xs uppercase block mb-1">النتائج المتوقعة (Outcomes):</span>
                            <ul className="list-disc list-inside text-xs space-y-1">
                              {d.expectedOutcomes.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                        {d.criticism?.includes('CounterArguments') || d.criticism?.includes('Risk Level') ? (
                          <div className="mt-2 text-xs text-indigo-600 whitespace-pre-wrap font-medium">
                            {d.criticism.substring(d.criticism.indexOf('Risk Level'))}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-2">
                   تاريخ: {new Date(d.timestamp).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col gap-2 shrink-0 self-stretch justify-start items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                 <span className="text-[10px] font-bold text-slate-400 mb-1 w-full text-center">المراجعة</span>
                 <button onClick={() => updateDecisionStatus(d.id, 'approved')} className={`p-2 rounded-lg transition-colors border shadow-sm ${d.status === 'approved' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-emerald-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200'}`} title="اعتماد">
                   <Check className="w-4 h-4" />
                 </button>
                 <button onClick={() => updateDecisionStatus(d.id, 'rejected')} className={`p-2 rounded-lg transition-colors border shadow-sm ${d.status === 'rejected' ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-rose-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200'}`} title="رفض">
                   <X className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
