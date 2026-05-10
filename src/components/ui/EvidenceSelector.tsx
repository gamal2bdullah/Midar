import React from 'react';
import { Database, Link2 } from 'lucide-react';
import { Evidence } from '../../lib/types';
import { cn } from './shared';

interface EvidenceSelectorProps {
  availableEvidence: Evidence[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export const EvidenceSelector = ({ availableEvidence, selectedIds, onChange, className }: EvidenceSelectorProps) => {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if(!availableEvidence || availableEvidence.length === 0) return null;

  return (
    <div className={cn("mt-4 border-t border-slate-100 pt-3", className)}>
      <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
        <Link2 className="w-3.5 h-3.5" /> الأسانيد المرتبطة (Traceability)
      </div>
      <div className="flex flex-wrap gap-2">
        {availableEvidence.map(ev => {
          const isSelected = selectedIds.includes(ev.id);
          return (
            <button
              key={ev.id}
              onClick={() => toggle(ev.id)}
              className={cn(
                "text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all truncate max-w-[200px]",
                isSelected 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" 
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              )}
              title={ev.content}
            >
              <Database className="w-3 h-3 shrink-0" />
              <span className="truncate">{ev.source || "مرجع"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
