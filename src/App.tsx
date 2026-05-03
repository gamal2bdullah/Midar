import React, { useState } from 'react';
import { useProjects } from './hooks/useStorage';
import { WorkspaceHome } from './features/workspace/WorkspaceHome';
import { ProjectCanvas } from './features/project-canvas/ProjectCanvas';

export default function App() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

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
      loading={loading} 
      createProject={createProject} 
      openProject={setActiveProjectId} 
      deleteProject={deleteProject}
    />
  );
}
