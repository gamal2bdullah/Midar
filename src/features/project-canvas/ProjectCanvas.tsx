import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Beaker, LayoutDashboard, Database, Lightbulb, Target, Users, Check, ArrowRight, MessageSquare, Activity, Zap } from 'lucide-react';
import { Project } from '../../hooks/useStorage';
import { cn } from '../../components/ui/shared';

import { StakeholderMap } from '../stakeholder-map/StakeholderMap';
import { ProblemAnalysis } from '../analysis/ProblemAnalysis';
import { ReportCenter } from '../report-center/ReportCenter';
import { IdeationLab } from '../analysis/IdeationLab';
import { EvidenceBoard } from '../evidence-board/EvidenceBoard';
import { CollaborationPanel } from '../collaboration/CollaborationPanel';
import { DecisionLog } from '../decision-log/DecisionLog';
import { ExperimentBacklog } from '../experiment-backlog/ExperimentBacklog';
import { ScenarioSimulator } from '../scenario-simulator/ScenarioSimulator';
import { ExecutiveDashboard } from './ExecutiveDashboard'; // We'll create this

const MODULES = [
  { id: 'overview', title: 'لوحة القيادة', icon: Activity, component: ExecutiveDashboard },
  { id: 'stk', title: 'شبكة الأطراف', icon: Users, component: StakeholderMap },
  { id: 'prob', title: 'التحليل الإدراكي', icon: Target, component: ProblemAnalysis },
  { id: 'evd', title: 'جدار الأدلة', icon: Database, component: EvidenceBoard },
  { id: 'ide', title: 'غرفة الأفكار', icon: Lightbulb, component: IdeationLab },
  { id: 'exp', title: 'محفظة التجارب', icon: Beaker, component: ExperimentBacklog },
  { id: 'scn', title: 'محاكاة الانهيار', icon: Zap, component: ScenarioSimulator },
  { id: 'dec', title: 'سجل القرارات', icon: ShieldAlert, component: DecisionLog },
  { id: 'rep', title: 'الوثيقة الحية', icon: LayoutDashboard, component: ReportCenter }
];

export const ProjectCanvas = ({ project, updateProject, onClose }: { project: Project, updateProject: any, onClose: ()=>void }) => {
  const [activeModule, setActiveModule] = useState(MODULES[0].id);
  const [isCollabOpen, setIsCollabOpen] = useState(false);

  const CurrentComponent = MODULES.find(m => m.id === activeModule)?.component || ExecutiveDashboard;

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-right" dir="rtl">
      
      {/* Sidebar Menu */}
      <div className="w-[280px] bg-white border-l border-slate-200 shadow-sm flex flex-col z-20 shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
           <div>
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">مساحة المشروع</div>
             <h2 className="font-black text-slate-800 text-lg leading-tight truncate" title={project.name}>{project.name}</h2>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors" title="العودة">
             <ArrowRight className="w-4 h-4" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
           {MODULES.map(m => {
             const active = activeModule === m.id;
             return (
               <button 
                 key={m.id} 
                 onClick={() => setActiveModule(m.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none",
                   active ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                 )}
               >
                 <m.icon className={cn("w-4 h-4", active ? "text-blue-200" : "text-slate-400")} />
                 {m.title}
                 {active && <motion.div layoutId="sidebar-active" className="absolute right-0 w-1 h-8 bg-blue-600 rounded-l-full hidden"/>}
               </button>
             );
           })}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
           <button 
              onClick={() => setIsCollabOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4"/> 
              فريق العمل {(project.comments?.length || 0) > 0 && <span className="bg-blue-100 text-blue-700 text-xs w-5 h-5 rounded-full flex items-center justify-center">{project.comments?.length}</span>}
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative bg-[#F8FAFC]">
         {/* Top bar for active section context */}
         <header className="sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-md z-10 border-b border-slate-200 px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
               {React.createElement(MODULES.find(m => m.id === activeModule)?.icon || Activity, { className: 'w-5 h-5 text-blue-600' })}
               {MODULES.find(m => m.id === activeModule)?.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                 إصدار <span className="text-blue-600">{project.version || 1}.0</span>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
                نشط الآن
              </div>
            </div>
         </header>

         <main className="p-8 max-w-5xl mx-auto pb-32">
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeModule}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
                <CurrentComponent project={project} updateProject={updateProject} />
             </motion.div>
           </AnimatePresence>
         </main>
      </div>

      <CollaborationPanel 
        isOpen={isCollabOpen} 
        onClose={() => setIsCollabOpen(false)} 
        project={project} 
        updateProject={updateProject} 
      />
    </div>
  );
};

