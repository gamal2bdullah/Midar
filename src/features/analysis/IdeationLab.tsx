import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Trash2, Plus, BrainCircuit, Activity, Target, Users, Database } from 'lucide-react';
import { Project, Idea } from '../../hooks/useStorage';
import { DeepEngine, scoreIdea } from '../../lib/ai-engine';
import { PrimaryButton, cn } from '../../components/ui/shared';
import { EvidenceSelector } from '../../components/ui/EvidenceSelector';

export const IdeationLab = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [newIdea, setNewIdea] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  const add = () => {
    if(!newIdea) return;
    const scored = scoreIdea(newIdea);
    const idea: Idea = { id: `id_${Date.now()}`, text: newIdea, score: scored.score, why: scored.why, linkedEvidenceIds: selectedEvidence };
    updateProject(project.id, { ideas: [idea, ...project.ideas] });
    setNewIdea('');
    setSelectedEvidence([]);
  };

  const remove = (id: string) => updateProject(project.id, { ideas: project.ideas.filter(i => i.id !== id) });

  const triggerSimulation = async (idea: Idea) => {
    if (!project.stakeholders.length) {
       alert('يجب تحديد أطراف أولاً لاستخدام المحاكاة.');
       return;
    }
    
    setIsSimulating(idea.id);
    try {
      // Create voice simulation
      const newVoices: Record<string, string> = {};
      
      for (const stk of project.stakeholders) {
         try {
           const reply = await DeepEngine.simulateStakeholderResistance(stk.need, idea.text);
           newVoices[stk.id] = reply || "يمتنع عن الإجابة";
         } catch(e) {
           newVoices[stk.id] = "لم نتمكن من محاكاة رد الفعل";
         }
      }

      const pTest = await DeepEngine.generatePressureTest(idea.text);

      const updatedIdeas = project.ideas.map(i => {
         if (i.id === idea.id) {
           return { ...i, pressureTest: pTest };
         }
         return i;
      });

      const updatedStakeholders = project.stakeholders.map(s => {
         return {
            ...s,
            voiceReactions: {
              ...(s.voiceReactions || {}),
              [idea.id]: newVoices[s.id]
            }
         };
      });

      updateProject(project.id, { ideas: updatedIdeas, stakeholders: updatedStakeholders });
    } catch(err) {
      console.error(err);
    } finally {
      setIsSimulating(null);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">غرفة الأفكار والضغط</h2>
        <p className="text-gray-500 font-sans text-sm leading-relaxed">اطرح أفكارك هنا. سيقوم مِدار بتقييمها واختبارها عبر محاكاة أصوات الأطراف المعنية وتوجيه أسئلة ضغط لاكتشاف الثغرات وتحدي الجدوى.</p>
      </div>

      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="اكتب فكرة الحل المبدئي..." 
            className="flex-1 bg-gray-50 border border-gray-200 shadow-inner rounded-xl px-5 py-4 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-lg transition-all"
            value={newIdea} onChange={e => setNewIdea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <PrimaryButton onClick={add} icon={Plus} className="md:px-8 bg-blue-600 hover:bg-blue-700">دفع الفكرة</PrimaryButton>
        </div>
        <EvidenceSelector 
            availableEvidence={project.evidence || []} 
            selectedIds={selectedEvidence} 
            onChange={setSelectedEvidence} 
            className="mt-0"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 pt-4">
        <AnimatePresence>
          {project.ideas?.map(i => {
             const simActive = isSimulating === i.id;
             return (
              <motion.div 
                initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.95}}
                key={i.id} 
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 rounded-r-2xl opacity-50"></div>
                
                <div className="flex justify-between items-start gap-4 border-b border-gray-50 pb-4 mb-4">
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-900 mb-2 leading-relaxed">{i.text}</p>
                    <div className="text-sm text-gray-500 font-sans flex items-center gap-2 mb-3">
                       <Lightbulb className="w-4 h-4 text-amber-500" />
                       سبب التميز: {i.why}
                    </div>
                    {i.linkedEvidenceIds && i.linkedEvidenceIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {i.linkedEvidenceIds.map(eid => {
                           const ev = project.evidence?.find(e => e.id === eid);
                           if (!ev) return null;
                           return (
                             <span key={eid} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] px-2 py-1 rounded truncate max-w-[250px]" title={ev.content}>
                               <Database className="w-3 h-3" />
                               {ev.source || "مرجع"}
                             </span>
                           )
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 shadow-sm">
                       {i.score.toFixed(1)} <span className="text-xs font-bold text-blue-400">/ 10</span>
                    </div>
                    <button onClick={() => remove(i.id)} className="text-gray-300 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 p-2.5 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                </div>

                {/* AI Simulation Actions */}
                <div className="flex items-center justify-between mt-4">
                   <button 
                     onClick={() => triggerSimulation(i)}
                     disabled={simActive}
                     className="flex items-center gap-2 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors border border-indigo-100 disabled:opacity-50"
                   >
                     {simActive ? <BrainCircuit className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                     {simActive ? 'جارِ تشغيل المحاكاة المعرفية...' : 'محاكاة ردود الأطراف والضغط'}
                   </button>
                </div>

                {/* Simulation Reports */}
                {(i.pressureTest || project.stakeholders.some(s => s.voiceReactions?.[i.id])) && (
                  <motion.div initial={{opacity:0, height: 0}} animate={{opacity:1, height: 'auto'}} className="mt-6 space-y-4">
                     
                     {/* Pressure Test */}
                     {i.pressureTest && (
                       <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 shadow-sm">
                         <div className="flex items-center gap-2 text-rose-800 font-bold mb-2">
                            <Target className="w-5 h-5" />
                            اختبار ضغط الجدوى (Pressure Test)
                         </div>
                         <p className="text-rose-900/80 font-medium font-sans leading-relaxed text-sm">{i.pressureTest}</p>
                       </div>
                     )}

                     {/* Stakeholder Voices */}
                     {project.stakeholders.some(s => s.voiceReactions?.[i.id]) && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-sm">
                           <div className="flex items-center gap-2 text-slate-700 font-bold mb-4">
                             <Users className="w-5 h-5" />
                             أصوات الأطراف (محاكاة)
                           </div>
                           <div className="space-y-3">
                             {project.stakeholders.map(s => {
                                const reaction = s.voiceReactions?.[i.id];
                                if(!reaction) return null;
                                return (
                                  <div key={s.id} className="bg-white p-3 rounded-lg border border-slate-200 text-sm">
                                    <span className="font-bold text-indigo-600 block mb-1">{s.name}:</span>
                                    <span className="text-slate-600 font-sans">{reaction}</span>
                                  </div>
                                )
                             })}
                           </div>
                        </div>
                     )}
                  </motion.div>
                )}

              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
