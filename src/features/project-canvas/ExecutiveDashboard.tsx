import React, { useState, useEffect } from 'react';
import { Project } from '../../hooks/useStorage';
import { GlassCard } from '../../components/ui/shared';
import { AICard } from '../../components/ui/AICard';
import { Target, Lightbulb, Users, ShieldAlert, Beaker, CheckCircle2, Sparkles, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { GeminiOrchestrator } from '../../lib/ai-engine';

export const ExecutiveDashboard = ({ project, updateProject }: { project: Project, updateProject: any }) => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      setLoadingInsight(true);
      const res = await GeminiOrchestrator.synthesizeInsights(project);
      setInsight(res);
      setLoadingInsight(false);
    }
    fetchInsights();
  }, [project]);

  const totalScore = project.overallScore || 0;
  
  const stats = [
    { label: 'أصحاب مصلحة', value: project.stakeholders?.length || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'أفكار مقترحة', value: project.ideas?.length || 0, icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'إشكاليات', value: project.problem?.text ? 1 : 0, icon: Target, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { label: 'تجارب نشطة', value: project.experiments?.filter(e=>e.status==='running')?.length || 0, icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  ];

  // Dummy activity data for the chart, ideally this comes from history
  const activityData = [
    { name: 'السبت', activities: 4 },
    { name: 'الأحد', activities: 7 },
    { name: 'الإثنين', activities: 5 },
    { name: 'الثلاثاء', activities: 12 },
    { name: 'الأربعاء', activities: 8 },
    { name: 'الخميس', activities: 15 },
    { name: 'الجمعة', activities: 10 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner (Command Center style) */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border border-slate-800">
         <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none" />
         <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
         
         <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 justify-start mb-3">
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-indigo-200 border border-white/10 backdrop-blur-sm">
                PROJECT_ID: {project.id.slice(0, 8).toUpperCase()}
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ACTIVE
              </div>
            </div>
            <h2 className="text-3xl font-black mb-2 text-white tracking-tight">{project.name}</h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">مركز القيادة الاستراتيجية. مراقبة المؤشرات الحيوية، وتتبع تقدم التجارب، واتخاذ القرارات المدعومة بالبيانات المعرفية.</p>
         </div>
         
         <div className="relative z-10 shrink-0 flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-slate-800 border-[4px] border-slate-700 shadow-inner">
                {totalScore >= 80 ? (
                   <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none rounded-full" viewBox="0 0 100 100">
                       <circle cx="50" cy="50" r="46" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray={`${(totalScore/100)*289} 289`} className="transition-all duration-1000 ease-out" />
                   </svg>
                ) : (
                   <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none rounded-full" viewBox="0 0 100 100">
                       <circle cx="50" cy="50" r="46" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray={`${(totalScore/100)*289} 289`} className="transition-all duration-1000 ease-out" />
                   </svg>
                )}
                <div className="text-2xl font-black text-white">{totalScore}<span className="text-sm text-slate-400 opacity-80">%</span></div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3">مؤشر الجاهزية</div>
            </div>
         </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {stats.map((s, i) => (
           <GlassCard key={i} className={`p-5 flex items-center gap-4 border ${s.border} hover:shadow-md transition-shadow group cursor-default`}>
              <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-800 leading-none">{s.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase mt-1">{s.label}</div>
              </div>
           </GlassCard>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Activity Chart */}
        <GlassCard className="col-span-1 lg:col-span-2 p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-indigo-500" />
               النشاط والحركة الاستراتيجية
             </h3>
             <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">آخر 7 أيام</span>
          </div>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                 <RechartsTooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                 <Area type="monotone" dataKey="activities" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActivities)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Action Items Column */}
        <div className="space-y-6 flex flex-col h-[400px]">
          {/* AI Insight */}
          <div className="shrink-0">
            <AICard 
               title="التوجيه الاستراتيجي (AI)"
               content={
                 loadingInsight ? (
                   <p className="text-sm animate-pulse text-indigo-500 font-medium flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> جاري تحليل مسار المشروع...
                   </p>
                 ) : insight ? (
                   <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700">{insight}</p>
                 ) : (
                   <p className="text-sm text-slate-500">لا يوجد توجيه ذكي متوفر حالياً.</p>
                 )
               }
               type="info"
            />
          </div>

          {/* Pending Decisions */}
          <GlassCard className="p-5 flex-1 flex flex-col min-h-0">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
               <span className="flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-orange-500" />
                 قرارات تتطلب الحسم
               </span>
               <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{project.decisions?.filter(d=>d.status==='pending').length || 0}</span>
             </h3>
             <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1">
               {project.decisions?.filter(d=>d.status==='pending').map(d => (
                  <div key={d.id} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-orange-300 transition-colors group cursor-pointer shadow-sm">
                    <div className="font-bold text-slate-800 text-sm mb-1 flex justify-between items-start">
                      <span>{d.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-2">{d.rationale}</div>
                  </div>
               ))}
               {(!project.decisions || project.decisions.filter(d=>d.status==='pending').length === 0) && (
                 <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                   <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-400" />
                   <span className="text-xs font-bold text-slate-500">لا توجد قرارات معلقة</span>
                 </div>
               )}
             </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
