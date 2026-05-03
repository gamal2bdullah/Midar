import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { cn } from './shared';

export const AICard = ({ title, content, type = 'info' }: { title: string, content: React.ReactNode, type?: 'info'|'warning'|'success' }) => {
  const colors = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };
  return (
    <div className={cn("p-4 rounded-xl border flex gap-3 items-start backdrop-blur-sm", colors[type])}>
      <BrainCircuit className={cn("w-5 h-5 flex-shrink-0 mt-0.5 opacity-80")} />
      <div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <div className="text-sm opacity-90 leading-relaxed font-sans">{content}</div>
      </div>
    </div>
  );
};
