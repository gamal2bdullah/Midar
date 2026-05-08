import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Folder, Plus, X, BarChart, Settings, Home, Lightbulb, Users, Beaker, ShieldAlert, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CommandPalette({ isOpen, setIsOpen, sections, onNavigate }: { 
  isOpen: boolean; 
  setIsOpen: any;
  sections: { id: string, label: string, icon: any }[];
  onNavigate: (id: string) => void;
}) {
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open: boolean) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setIsOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[10vh]">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
        <Command.Dialog 
          open={isOpen} 
          onOpenChange={setIsOpen} 
          className="relative bg-white max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        >
          <div className="flex items-center border-b border-slate-100 px-4">
            <Search className="w-5 h-5 text-slate-400" />
            <Command.Input 
              placeholder="ابحث عن قسم أو اجراء (Cmd + K)..." 
              className="flex-1 border-0 bg-transparent p-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none w-full"
            />
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">لا توجد نتائج.</Command.Empty>
            
            <Command.Group heading="التنقل السريع" className="px-2 py-1 text-xs font-bold text-slate-500 uppercase">
              {sections.map(sec => {
                const Icon = sec.icon;
                return (
                  <Command.Item 
                    key={sec.id}
                    onSelect={() => { onNavigate(sec.id); setIsOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none hover:bg-indigo-50 aria-selected:bg-indigo-50 text-slate-700 font-medium"
                  >
                    <Icon className="w-5 h-5 text-slate-400" />
                    {sec.label}
                  </Command.Item>
                )
              })}
            </Command.Group>
          </Command.List>
        </Command.Dialog>
      </div>
    </AnimatePresence>
  );
}
