import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trash2, Plus, Target } from 'lucide-react';
import { Project, Stakeholder } from '../../hooks/useStorage';
import { PrimaryButton } from '../../components/ui/shared';
import { AICard } from '../../components/ui/AICard';
import { cn } from '../../components/ui/shared';

export const StakeholderMap = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [name, setName] = useState('');
  const [need, setNeed] = useState('');

  const add = () => {
    if(!name || !need) return;
    const newS: Stakeholder = { id: `stk_${Date.now()}`, name, need, voiceReactions: {} };
    updateProject(project.id, { stakeholders: [...(project.stakeholders || []), newS] });
    setName(''); setNeed('');
  };

  const remove = (id: string) => {
    updateProject(project.id, { stakeholders: project.stakeholders.filter(s => s.id !== id) });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="text-center max-w-lg mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">خريطة الأطراف المعنية</h2>
        <p className="text-gray-500 font-sans text-sm">حدد الفئات المتأثرة بالمشكلة واحتياجاتهم العميقة. الابتكار يبدأ بالتعاطف الحقيقي وتحديد المصالح المتضافرة والمتصادمة.</p>
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
          placeholder="الاحتياج العميق المنشود..." 
          className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          value={need} onChange={e => setNeed(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <PrimaryButton onClick={add} icon={Plus}>إضافة للخريطة</PrimaryButton>
      </div>

      <div className="grid gap-3 pt-4">
        <AnimatePresence>
          {project.stakeholders?.map(s => (
            <motion.div 
              initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.95}}
              key={s.id} 
              className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{s.name}</h4>
                  <p className="text-sm text-gray-500 font-sans mt-1">{s.need}</p>
                </div>
              </div>
              <button onClick={() => remove(s.id)} className="text-gray-300 hover:text-rose-600 transition-colors bg-transparent hover:bg-rose-50 p-2 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {(!project.stakeholders || project.stakeholders.length === 0) && (
          <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 font-sans shadow-inner">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            لا توجد أطراف متأثرة محددة حتى الآن. ابدأ باستكشاف النظام البيئي للمشكلة.
          </div>
        )}
      </div>

      {project.stakeholders?.length === 1 && (
        <AICard 
          type="warning"
          title="تحليل النظام المبدئي (مِدار)" 
          content="اكتشاف فئة واحدة فقط قد يعزز الرؤية المحدودة (Tunnel Vision) للحل. غالباً ما تشمل الابتكارات الاجتماعية أطرافاً تقاطعية متأثرة بشكل غير مباشر كالممولين، الحكومة، والمنافسين المحليين." 
        />
      )}
    </div>
  );
};
