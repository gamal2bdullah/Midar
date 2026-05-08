import React, { useState } from 'react';
import { Project, Experiment } from '../../hooks/useStorage';
import { GlassCard, PrimaryButton } from '../../components/ui/shared';
import { Beaker, Play, CheckCircle2, AlertOctagon, Edit3, Target } from 'lucide-react';
import { GeminiOrchestrator } from '../../lib/ai-engine';

export const ExperimentBacklog = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [name, setName] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [metric, setMetric] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const add = async () => {
    if(!name || !hypothesis || !metric) return;
    const newId = `exp_${Date.now()}`;
    const newExp: Experiment = {
      id: newId,
      name,
      hypothesis,
      metric,
      status: 'planned'
    };
    
    const currentExps = [newExp, ...(project.experiments || [])];
    updateProject(project.id, { experiments: currentExps });
    setName(''); setHypothesis(''); setMetric('');

    setAnalyzingId(newId);
    const criticism = await GeminiOrchestrator.assessExperiment(newExp.hypothesis, newExp.metric);
    const finalExps = currentExps.map(e => e.id === newId ? { ...e, criticism } : e);
    updateProject(project.id, { experiments: finalExps });
    setAnalyzingId(null);
  };

  const updateStatus = (id: string, status: 'planned' | 'running' | 'completed' | 'failed') => {
    const updated = (project.experiments || []).map(e => e.id === id ? { ...e, status } : e);
    updateProject(project.id, { experiments: updated });
  };

  const setExpResult = (id: string, result: string) => {
    const updated = (project.experiments || []).map(e => e.id === id ? { ...e, result } : e);
    updateProject(project.id, { experiments: updated });
  }

  const StatusIcon = ({ status }: { status: string }) => {
    switch(status) {
      case 'planned': return <Edit3 className="w-4 h-4 text-slate-400" />;
      case 'running': return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'failed': return <AlertOctagon className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-2">محفظة التجارب (Experiment Backlog)</h2>
        <p className="text-gray-500 text-sm font-medium">خطط لتجارب مصغرة لاختبار فرضياتك وحلولك على أرض الواقع بأقل تكلفة ممكنة.</p>
      </div>

      <GlassCard className="p-6 bg-slate-50 border-slate-200">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              value={name} onChange={e=>setName(e.target.value)}
              placeholder="اسم التجربة (مثل: إطلاق صفحة هبوط وهمية)"
              className="text-sm font-bold bg-white border border-slate-200 outline-none rounded-xl p-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all placeholder-slate-400"
            />
            <input 
              value={metric} onChange={e=>setMetric(e.target.value)}
              placeholder="المرجع الدلالي للنجاح (Metric)"
              className="text-sm font-bold bg-white border border-slate-200 outline-none rounded-xl p-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all placeholder-slate-400"
            />
          </div>
          <textarea 
            value={hypothesis} onChange={e=>setHypothesis(e.target.value)}
            placeholder="الفرضية: نحن نعتقد أن... وسنتحقق من ذلك عبر..."
            className="w-full text-sm bg-white border border-slate-200 outline-none rounded-xl p-3 resize-y min-h-[80px] focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all placeholder-slate-400"
          />
          <div className="flex justify-end">
            <PrimaryButton onClick={add} disabled={!name || !hypothesis || !metric}>
              <Beaker className="w-4 h-4 mr-2" /> إدراج تجربة
            </PrimaryButton>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        {(!project.experiments || project.experiments.length === 0) ? (
          <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-dashed border-slate-200">
             <Beaker className="w-8 h-8 mx-auto mb-3 opacity-20" />
             <p className="text-sm font-bold">لا يوجد تجارب مجدولة.</p>
          </div>
        ) : (
          project.experiments.map(exp => (
            <div key={exp.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-1 h-full ${exp.status === 'running' ? 'bg-blue-400' : exp.status === 'completed' ? 'bg-emerald-400' : exp.status === 'failed' ? 'bg-rose-400' : 'bg-slate-200'}`}></div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                     <StatusIcon status={exp.status} /> {exp.name}
                  </h4>
                  <div className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md inline-block mt-2 font-mono font-bold">
                    القياس: {exp.metric}
                  </div>
                </div>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                  <button onClick={()=>updateStatus(exp.id, 'planned')} className={`px-2 py-1 text-xs font-bold rounded ${exp.status==='planned'?'bg-white shadow text-slate-700':'text-slate-400 hover:text-slate-600'}`}>مُخطط</button>
                  <button onClick={()=>updateStatus(exp.id, 'running')} className={`px-2 py-1 text-xs font-bold rounded ${exp.status==='running'?'bg-white shadow text-blue-600':'text-slate-400 hover:text-blue-500'}`}>جارٍ التنفيذ</button>
                  <button onClick={()=>updateStatus(exp.id, 'completed')} className={`px-2 py-1 text-xs font-bold rounded ${exp.status==='completed'?'bg-white shadow text-emerald-600':'text-slate-400 hover:text-emerald-500'}`}>اكتمل</button>
                  <button onClick={()=>updateStatus(exp.id, 'failed')} className={`px-2 py-1 text-xs font-bold rounded ${exp.status==='failed'?'bg-white shadow text-rose-600':'text-slate-400 hover:text-rose-500'}`}>أُحبط</button>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700">
                <span className="font-bold text-slate-400 text-xs uppercase tracking-wider block mb-1">الفرضية:</span>
                {exp.hypothesis}
              </div>

              {(exp.criticism || analyzingId === exp.id) && (
                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 mt-3 relative">
                   <div className="flex items-center gap-1.5 mb-1 text-orange-700 font-bold text-xs uppercase tracking-wider">
                     <Target className="w-3.5 h-3.5" />
                     مُدقق جودة القياس (AI)
                   </div>
                   {analyzingId === exp.id ? (
                      <p className="text-orange-500 text-sm animate-pulse">جاري تقييم متانة المقياس (Metric)...</p>
                   ) : (
                      <p className="text-orange-800 text-sm font-medium">{exp.criticism}</p>
                   )}
                </div>
              )}

              {(exp.status === 'completed' || exp.status === 'failed' || exp.result) && (
                <div className="pt-2">
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-wider block mb-1">النتيجة والملاحظات:</span>
                   <textarea
                     className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-300"
                     placeholder="ماذا تعلمنا من هذه التجربة؟"
                     value={exp.result || ''}
                     onChange={(e) => setExpResult(exp.id, e.target.value)}
                   />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
