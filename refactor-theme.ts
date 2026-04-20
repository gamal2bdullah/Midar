import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Theming mappings - Light Premium SaaS replacing Dark IDE
code = code.replace(/bg-\[#0F172A\]\/80/g, 'bg-white');
code = code.replace(/bg-\[#0B1121\]/g, 'bg-gray-50');
code = code.replace(/bg-slate-900/g, 'bg-white');
code = code.replace(/bg-slate-800/g, 'bg-gray-50');
code = code.replace(/bg-slate-800\/50/g, 'bg-gray-50/80');
code = code.replace(/bg-slate-700/g, 'bg-gray-100');

code = code.replace(/text-slate-100/g, 'text-gray-900');
code = code.replace(/text-slate-200/g, 'text-gray-800');
code = code.replace(/text-slate-300/g, 'text-gray-700');
code = code.replace(/text-slate-400/g, 'text-gray-500');
code = code.replace(/border-white\/5/g, 'border-gray-200');
code = code.replace(/border-slate-700/g, 'border-gray-200');
code = code.replace(/border-slate-800/g, 'border-gray-100');

code = code.replace(/bg-cyan-950\/30/g, 'bg-blue-50');
code = code.replace(/border-cyan-800\/50/g, 'border-blue-100');
code = code.replace(/text-cyan-400/g, 'text-blue-700');

code = code.replace(/bg-amber-950\/30/g, 'bg-amber-50');
code = code.replace(/border-amber-800\/50/g, 'border-amber-100');
code = code.replace(/text-amber-400/g, 'text-amber-700');

code = code.replace(/bg-mint-950\/30/g, 'bg-emerald-50');
code = code.replace(/border-mint-800\/50/g, 'border-emerald-100');
code = code.replace(/text-mint-400/g, 'text-emerald-700');

code = code.replace(/from-cyan-600/g, 'from-gray-900');
code = code.replace(/to-blue-600/g, 'to-gray-800');
code = code.replace(/hover:from-cyan-500/g, 'hover:from-gray-800');
code = code.replace(/hover:to-blue-500/g, 'hover:to-gray-700');
code = code.replace(/shadow-cyan-500\/20/g, 'shadow-gray-900/10');
code = code.replace(/bg-\[#0EA5E9\]/g, 'bg-gray-900');
code = code.replace(/hover:bg-cyan-400/g, 'hover:bg-gray-800');

code = code.replace(/stroke="#0ea5e9"/g, 'stroke="#2563EB"');
code = code.replace(/fill="#0ea5e9"/g, 'fill="#2563EB"');
code = code.replace(/stroke="#1e293b"/g, 'stroke="#E5E7EB"');

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx theme replacement completed.');
