import React from 'react';
import { Project } from '../../hooks/useStorage';
import { GlassCard } from '../../components/ui/shared';
import { AICard } from '../../components/ui/AICard';
import { Target, Lightbulb, Users, ShieldAlert, Beaker, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const ExecutiveDashboard = ({ project, updateProject }: { project: Project, updateProject: any }) => {

  const totalScore = project.overallScore || 0;
  
  const stats = [
    { label: 'أصحاب مصلحة', value: project.stakeholders?.length || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'أفكار مقترحة', value: project.ideas?.length || 0, icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'مواقف وإشكاليات', value: project.problems?.length || 0, icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'تجارب نشطة', value: project.experiments?.filter(e=>e.status==='running')?.length || 0, icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'قرارات مقترحة', value: project.decisions?.filter(d=>d.status==='pending')?.length || 0, icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const pieData = [
    { name: 'منفذ', value: project.experiments?.filter(e=>e.status==='completed')?.length || 0 },
    { name: 'جاري', value: project.experiments?.filter(e=>e.status==='running')?.length || 0 },
    { name: 'مخطط', value: project.experiments?.filter(e=>e.status==='planned')?.length || 0 },
  ];

  const pieColors = ['#10b981', '#3b82f6', '#cbd5e1'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-blue-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20 shadow-lg">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-black mb-2">مرحباً بك في مساحة عمل "{project.name}"</h2>
              <p className="text-blue-200 text-sm max-w-xl leading-relaxed">استخدم لوحة القيادة لمتابعة جاهزية المشروع، اتخاذ القرارات المعلقة، وإدارة التجارب الفعالة لتقليل مخاطر التنفيذ.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 shrink-0">
               <div className="font-bold text-center">
                 <div className="text-3xl tracking-tighter text-white">{totalScore}%</div>
                 <div className="text-[10px] uppercase tracking-widest text-blue-200 mt-1">مؤشر الجاهزية</div>
               </div>
               <div className="w-12 h-12 rounded-full border-[3px] border-emerald-400 flex items-center justify-center bg-white/5">
                 <CheckCircle2 className="w-6 h-6 text-emerald-400" />
               </div>
            </div>
         </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         {stats.map((s, i) => (
           <GlassCard key={i} className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center mb-1`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-800">{s.value}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</div>
           </GlassCard>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pending Actions */}
        <GlassCard className="p-6">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
             <ShieldAlert className="w-5 h-5 text-amber-500" />
             إجراءات تتطلب الانتباه
           </h3>
           <div className="space-y-3">
             {project.decisions?.filter(d=>d.status==='pending').slice(0,3).map(d => (
                <div key={d.id} className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm">
                  <div className="font-bold text-amber-900 mb-1">قرار معلق: {d.title}</div>
                  <div className="text-xs text-amber-700 opacity-80 truncate">{d.rationale}</div>
                </div>
             ))}
             {(!project.decisions || project.decisions.filter(d=>d.status==='pending').length === 0) && (
               <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                 <span className="text-xs font-bold text-slate-400 block">جميع القرارات تم البت فيها</span>
               </div>
             )}
           </div>
        </GlassCard>

        {/* AI Insight */}
        <div className="space-y-4">
          <AICard 
             title="التوجيه الذكي (AI Insight)"
             content={
               <p className="text-sm">
                 بناءً على المعطيات الحالية، نقترح البدء باختبار <strong>محفظة التجارب</strong> للتحقق من الفرضيات الأساسية قبل استهلاك مزيد من الموارد. مؤشر الجاهزية يشير إلى الحاجة لتحسين "جدار الأدلة" لرفع الموثوقية العامة.
               </p>
             }
             type="info"
          />
          <GlassCard className="p-6">
             <h3 className="font-bold text-slate-800 mb-2">توزيع التجارب</h3>
             <div className="h-40">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     innerRadius={40}
                     outerRadius={60}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4 text-xs font-bold text-slate-500 mt-2">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> منفذ</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> جاري</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"/> مخطط</span>
             </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
