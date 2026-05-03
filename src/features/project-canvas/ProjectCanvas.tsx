import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Users, Target, Lightbulb, LayoutDashboard, Database, MessageSquare } from 'lucide-react';
import { Project } from '../../hooks/useStorage';
import { cn } from '../../components/ui/shared';

import { StakeholderMap } from '../stakeholder-map/StakeholderMap';
import { ProblemAnalysis } from '../analysis/ProblemAnalysis';
import { ReportCenter } from '../report-center/ReportCenter';
import { IdeationLab } from '../analysis/IdeationLab';
import { EvidenceBoard } from '../evidence-board/EvidenceBoard';
import { CollaborationPanel } from '../collaboration/CollaborationPanel';

const PIPELINE = [
  { id: 'stk', title: 'الأطراف', icon: Users },
  { id: 'prob', title: 'التحليل الإدراكي', icon: Target },
  { id: 'evd', title: 'جدار الأدلة', icon: Database },
  { id: 'ide', title: 'غرفة الأفكار', icon: Lightbulb },
  { id: 'rep', title: 'الوثيقة الحية', icon: LayoutDashboard }
];

export const ProjectCanvas = ({ project, updateProject, onClose }: { project: Project, updateProject: any, onClose: ()=>void }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCollabOpen, setIsCollabOpen] = useState(false);

  const prev = () => setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
  const next = () => setCurrentStepIndex(Math.min(PIPELINE.length - 1, currentStepIndex + 1));

  const StepContent = () => {
    switch(currentStepIndex) {
      case 0: return <StakeholderMap project={project} updateProject={updateProject} />;
      case 1: return <ProblemAnalysis project={project} updateProject={updateProject} />;
      case 2: return <EvidenceBoard project={project} updateProject={updateProject} />;
      case 3: return <IdeationLab project={project} updateProject={updateProject} />;
      case 4: return <ReportCenter project={project} />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-transparent pb-24 text-right flex flex-col" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-3xl border-b border-gray-100 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-500 transition-colors">
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <h1 className="font-bold text-lg text-gray-900">{project.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCollabOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5"/> 
              التعاون {(project.comments?.length || 0) > 0 && <span className="bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{project.comments?.length}</span>}
            </button>
            <div className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"/>
              Midar Active
            </div>
          </div>
        </div>
        
        {/* Progress Timeline */}
        <div className="container mx-auto px-4 py-4 flex justify-between relative max-w-4xl">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
          {PIPELINE.map((s, idx) => {
            const active = idx === currentStepIndex;
            const past = idx < currentStepIndex;
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 relative bg-transparent px-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2",
                  active ? "bg-blue-50 border-blue-500 text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]" : 
                  past ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-400"
                )}>
                  {past ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={cn("text-xs font-bold hidden md:block transition-colors", active ? "text-blue-600" : past ? "text-gray-900" : "text-gray-500")}>{s.title}</span>
              </div>
            )
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 max-w-4xl mt-36 flex-1">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
             {StepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Floating Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <button onClick={prev} disabled={currentStepIndex===0} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm text-gray-500 border border-transparent hover:border-gray-200">
             السابق
          </button>
          
          {currentStepIndex < PIPELINE.length - 1 ? (
             <button onClick={next} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 font-bold text-sm">التالي</button>
          ) : (
            <button onClick={onClose} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 font-bold text-sm"><Check className="w-4 h-4 mr-2"/> إنهاء العمل</button>
          )}
        </div>
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
