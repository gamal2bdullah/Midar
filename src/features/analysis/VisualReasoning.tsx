import React, { useMemo } from 'react';
import { ReactFlow, Controls, Background, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Project } from '../../hooks/useStorage';
import { GlassCard } from '../../components/ui/shared';

export const VisualReasoning = ({ project }: { project: Project }) => {
  const { nodes, edges } = useMemo(() => {
    const nds: Node[] = [];
    const eds: Edge[] = [];
    
    let y = 100;

    // 1. Problem Node
    const probId = 'prob-1';
    nds.push({
      id: probId,
      position: { x: 400, y: 50 },
      data: { label: <div className="p-2 font-bold text-sm text-center">المشكلة / الرؤية<br/><span className="text-xs font-normal text-slate-500">{project.problem?.text || 'غير محدد'}</span></div> },
      type: 'default',
      style: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px' }
    });

    // 2. Ideas
    const ideaIds: string[] = [];
    project.ideas?.forEach((idea, i) => {
      const id = `idea-${idea.id}`;
      ideaIds.push(id);
      nds.push({
        id,
        position: { x: 200 + i * 200, y: 200 },
        data: { label: <div className="p-2 text-xs font-bold text-center">💡 {idea.text}</div> },
        style: { backgroundColor: '#fffbf1', border: '1px solid #fcd34d', borderRadius: '8px' }
      });
      eds.push({ id: `e-${probId}-${id}`, source: probId, target: id, animated: true });
    });

    // 3. Evidence
    project.evidence?.forEach((ev, i) => {
      const id = `ev-${ev.id}`;
      nds.push({
        id,
        position: { x: 50 + i * 150, y: 350 },
        data: { label: <div className="p-2 text-[10px]">📊 {ev.content.substring(0,20)}...</div> },
        style: { backgroundColor: '#f0fdfa', border: '1px solid #5eead4', borderRadius: '8px' }
      });
      // Try to link evidence to ideas or problem
      if (ideaIds.length > 0) {
        ideaIds.forEach((ideaId) => {
           eds.push({ id: `e-${id}-${ideaId}`, source: id, target: ideaId, style: { stroke: '#94a3b8', strokeDasharray: '4' } });
        });
      } else {
        eds.push({ id: `e-${id}-${probId}`, source: id, target: probId });
      }
    });

    // 4. Experiments
    let expX = 200;
    project.experiments?.forEach((exp) => {
      const id = `exp-${exp.id}`;
      nds.push({
        id,
        position: { x: expX, y: 500 },
        data: { label: <div className="p-2 text-xs font-bold">🧪 {exp.name}</div> },
        style: { backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px' }
      });
      expX += 200;
      // Connect to ideas
      if (ideaIds.length > 0) {
        eds.push({ id: `e-${ideaIds[0]}-${id}`, source: ideaIds[0], target: id, animated: true, style: { stroke: '#3b82f6' } });
      }
    });

    // 5. Decisions
    let decX = 400;
    project.decisions?.forEach((dec) => {
      const id = `dec-${dec.id}`;
      nds.push({
        id,
        position: { x: decX, y: 700 },
        data: { label: <div className="p-2 text-xs font-bold">⚖️ {dec.title}</div> },
        style: { backgroundColor: '#fff7ed', border: '1px solid #fdba74', borderRadius: '8px' }
      });
      decX += 200;
      // Connect to problem or experiments
      if (project.experiments && project.experiments.length > 0) {
        eds.push({ id: `e-exp-${project.experiments[0].id}-${id}`, source: `exp-${project.experiments[0].id}`, target: id, type: 'smoothstep' });
      } else {
        eds.push({ id: `e-${probId}-${id}`, source: probId, target: id, type: 'step' });
      }
    });

    return { nodes: nds, edges: eds };
  }, [project]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[80vh] flex flex-col">
      <div className="mb-2">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-1">الخريطة الإدراكية والتسلسل المنطقي</h2>
        <p className="text-slate-500 text-sm font-medium">عرض مرئي يربط المشكلة بالأدلة، والأفكار، والتجارب، لضمان تسلسل منطقي في اتخاذ القرار.</p>
      </div>

      <GlassCard className="flex-1 w-full bg-white relative overflow-hidden border border-slate-200">
        <div className="absolute inset-0" dir="ltr">
          <ReactFlow nodes={nodes} edges={edges} fitView attributionPosition="bottom-left">
            <Background gap={16} color="#e2e8f0" />
            <Controls />
          </ReactFlow>
        </div>
      </GlassCard>
    </div>
  );
};
