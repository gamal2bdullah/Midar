import React, { useState, useEffect } from 'react';
import { useProjects, Project } from './hooks/useStorage';
import { WorkspaceHome } from './features/workspace/WorkspaceHome';
import { ProjectCanvas } from './features/project-canvas/ProjectCanvas';
import { ReportCenter } from './features/report-center/ReportCenter';
import { useAuth } from './context/AuthContext';
import { GlassCard, PrimaryButton } from './components/ui/shared';
import { Shield, Sparkles } from 'lucide-react';

export default function App() {
  const { projects, loading: projLoading, createProject, updateProject, deleteProject } = useProjects();
  const { user, loading: authLoading, login } = useAuth();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [sharedProject, setSharedProject] = useState<Project | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('share');
    if (sharedData) {
      try {
        const decodedString = decodeURIComponent(escape(window.atob(sharedData)));
        const parsed: Project = JSON.parse(decodedString);
        setSharedProject(parsed);
      } catch (err) {
        console.error("Failed to parse shared project:", err);
      }
    }
  }, []);

  if (sharedProject) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-10">
        <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
           <div className="bg-indigo-600 p-4 text-center text-white font-bold flex justify-center items-center gap-2">
             <Sparkles className="w-5 h-5"/> نسخة قابلة للمشاركة (Read-Only)
           </div>
           <div className="p-8">
             <ReportCenter project={sharedProject} />
           </div>
        </div>
      </div>
    );
  }

  if (authLoading || projLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4 text-slate-500 animate-pulse">
          <Shield className="w-10 h-10 text-indigo-400" />
          <p className="font-semibold tracking-wide">جاري تحميل مِدار...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative overflow-hidden">
        <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-indigo-100 to-transparent pointer-events-none" />
        <GlassCard className="w-full max-w-md p-8 relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
             <span className="text-white font-serif font-black text-3xl">م</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-slate-900 mb-2">مِدار</h1>
          <p className="text-slate-500 mb-8 font-medium">المنصة الذكية لإدارة المشاريع</p>
          <PrimaryButton onClick={login} className="w-full justify-center">
            تسجيل الدخول / البدء كضيف
          </PrimaryButton>
        </GlassCard>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (activeProject) {
    return (
      <ProjectCanvas 
        project={activeProject} 
        updateProject={updateProject} 
        onClose={() => setActiveProjectId(null)} 
      />
    );
  }

  return (
    <WorkspaceHome 
      projects={projects} 
      loading={projLoading} 
      createProject={createProject} 
      openProject={setActiveProjectId} 
      deleteProject={deleteProject}
    />
  );
}
