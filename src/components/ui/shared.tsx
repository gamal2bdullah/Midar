import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-6", className)}>
    {children}
  </div>
);

export const PrimaryButton = ({ children, onClick, icon: Icon, disabled, className }: any) => (
  <button 
    disabled={disabled}
    onClick={onClick} 
    className={cn("flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm", className)}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

export const SecondaryButton = ({ children, onClick, icon: Icon, className }: any) => (
  <button 
    onClick={onClick} 
    className={cn("flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-200", className)}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);
