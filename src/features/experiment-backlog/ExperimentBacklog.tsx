import React, { useState } from 'react';
import { Project, Experiment } from '../../hooks/useStorage';
import { GlassCard, PrimaryButton } from '../../components/ui/shared';
import { Beaker, Play, CheckCircle2, AlertOctagon, Edit3, Target } from 'lucide-react';
import { GeminiOrchestrator } from '../../lib/ai-engine';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const Column = ({ id, title, icon: Icon, color, children, experiments }: any) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className={`flex flex-col flex-1 min-w-[280px] bg-slate-50/50 rounded-2xl border ${isOver ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200'} transition-colors overflow-hidden`}>
      <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 flex items-center justify-center w-5 h-5 rounded-full">{experiments.length}</span>
      </div>
      <div className="p-3 flex-1 flex flex-col gap-3 min-h-[150px]">
        {children}
      </div>
    </div>
  );
};

const DraggableExperiment = ({ exp, setExpResult, analyzingId }: any) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: exp.id,
    data: { exp }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors">
      
      <div {...listeners} {...attributes} className="w-full">
        <h4 className="font-bold text-slate-900 text-sm mb-2 pr-2">{exp.name}</h4>
        <div className="text-[10px] bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded-md inline-block mb-3 font-mono font-medium truncate w-full">
          {exp.metric}
        </div>
        
        <div className="text-xs text-slate-600 line-clamp-3 mb-2 bg-slate-50/50 rounded-md p-2">
          {exp.hypothesis}
        </div>
      </div>

      {(exp.status === 'completed' || exp.status === 'failed' || exp.result) && (
        <div className="pt-2 border-t border-slate-100 mt-2">
           <textarea
             className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2 outline-none focus:border-blue-300 focus:bg-white resize-y"
             placeholder="الملاحظات / النتيجة..."
             value={exp.result || ''}
             onChange={(e) => setExpResult(exp.id, e.target.value)}
           />
        </div>
      )}
    </div>
  );
};

export const ExperimentBacklog = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [name, setName] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [metric, setMetric] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const experimentId = active.id;
    const newStatus = over.id as 'planned' | 'running' | 'completed' | 'failed';
    
    const exp = project.experiments?.find(e => e.id === experimentId);
    if(exp && exp.status !== newStatus) {
      updateStatus(experimentId, newStatus);
    }
  };

  const exps = project.experiments || [];
  const activeExp = exps.find(e => e.id === activeId);

  const columns = [
    { id: 'planned', title: 'مخطط', icon: Edit3, color: 'text-slate-500' },
    { id: 'running', title: 'جاري', icon: Play, color: 'text-blue-500' },
    { id: 'completed', title: 'اكتمل', icon: CheckCircle2, color: 'text-emerald-500' },
    { id: 'failed', title: 'أُحبط', icon: AlertOctagon, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-2">محفظة التجارب (Experiment Backlog)</h2>
        <p className="text-gray-500 text-sm font-medium">خطط لتجارب مصغرة لاختبار فرضياتك وحلولك الميدانية. اسحب البطاقات لتحديث حالتها المجراة.</p>
      </div>

      <GlassCard className="p-6 bg-white border-slate-200">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              value={name} onChange={e=>setName(e.target.value)}
              placeholder="اسم التجربة (مثل: إطلاق واجهة تفاعلية أولوية)"
              className="text-sm font-bold bg-slate-50 border border-slate-200 outline-none rounded-xl p-3 focus:border-indigo-400 focus:bg-white transition-all placeholder-slate-400"
            />
            <input 
              value={metric} onChange={e=>setMetric(e.target.value)}
              placeholder="مقياس النجاح المستهدف (Metric)"
              className="text-sm font-bold bg-slate-50 border border-slate-200 outline-none rounded-xl p-3 focus:border-indigo-400 focus:bg-white transition-all placeholder-slate-400"
            />
          </div>
          <textarea 
            value={hypothesis} onChange={e=>setHypothesis(e.target.value)}
            placeholder="الفرضية: نحن نعتقد أن الموردين... وسنتحقق من ذلك عبر..."
            className="w-full text-sm bg-slate-50 border border-slate-200 outline-none rounded-xl p-3 resize-y min-h-[80px] focus:border-indigo-400 focus:bg-white transition-all placeholder-slate-400"
          />
          <div className="flex justify-end">
            <PrimaryButton onClick={add} disabled={!name || !hypothesis || !metric} className="bg-indigo-600 hover:bg-indigo-700">
              <Beaker className="w-4 h-4 mr-2" /> إدراج خطة تجربة
            </PrimaryButton>
          </div>
        </div>
      </GlassCard>

      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {columns.map(col => {
            const columnExps = exps.filter(e => e.status === col.id);
            return (
              <Column key={col.id} id={col.id} title={col.title} icon={col.icon} color={col.color} experiments={columnExps}>
                 {columnExps.map(exp => (
                   <DraggableExperiment key={exp.id} exp={exp} setExpResult={setExpResult} analyzingId={analyzingId} />
                 ))}
                 {columnExps.length === 0 && <div className="text-center text-xs text-slate-400 py-6 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">اسحب البطاقة إلى هنا</div>}
              </Column>
            )
          })}
        </div>
        <DragOverlay>
           {activeExp ? (
             <div className="w-[280px] opacity-80 rotate-2 scale-105 transition-transform">
               <DraggableExperiment exp={activeExp} setExpResult={setExpResult} analyzingId={null} />
             </div>
           ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
