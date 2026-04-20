const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStart = 'const StepDashboard = ({ project }: { project: Project }) => {';
const targetEnd = 'const STEPS = [';

const startIdx = code.indexOf(targetStart);
const endIdx = code.indexOf(targetEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `const StepDashboard = ({ project }: { project: Project }) => {
  const radarData = calculateRadarStats(project);
  const printRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const exportPDF = async () => {
    if (!printRef.current || isExporting) return;
    setIsExporting(true);
    setExportError('');
    
    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      if (!canvas || canvas.width === 0) throw new Error("فشل في التقاط أبعاد المستند.");

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({ orientation: 'portrait', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 5) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(\`Midar_LivingBrief_\${project.name}.pdf\`);
    } catch (e: any) {
      setExportError(e.message || 'حدث خطأ غير معروف.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">الوثيقة الحية</h2>
          <p className="text-gray-500 font-sans text-sm">مستند استعراض الجاهزية المكتمل، يمثل نظرية التغيير الخاصة بك.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={exportPDF} disabled={isExporting} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 text-sm">
            <FileDown className="w-5 h-5"/> {isExporting ? 'جاري الاستخراج...' : 'تحميل المُلخّص'}
          </button>
          {exportError && <span className="text-rose-600 text-xs font-bold">{exportError}</span>}
        </div>
      </div>

      <GlassCard className="mb-8 p-8 bg-white border-gray-200 relative z-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <h3 className="font-bold text-gray-900 mb-6 text-xl">بوصلة الابتكار (مِدار)</h3>
        <div className="flex flex-col md:flex-row gap-8 items-center cursor-crosshair">
            <div className="h-64 w-full md:w-1/2 group">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 13, fontFamily: 'Tajawal', fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="المشروع" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#2563EB" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 w-full md:w-1/2">
              {radarData.map(r => (
                <div key={r.subject} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 shadow-sm flex flex-col justify-center">
                  <div className="text-2xl font-black text-gray-900">{r.A}</div>
                  <div className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">{r.subject}</div>
                </div>
              ))}
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
             <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-blue-600"/> المشكلة والجذور</h4>
             <p className="text-gray-600 leading-relaxed text-sm mb-4">{project.problem.text || "لم يتم التعريف"}</p>
             {project.problem.socraticAnswer && (
                 <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-blue-900">
                    <strong className="block mb-1 text-blue-700 text-xs tracking-wider uppercase">الإجابة السقراطية (تحليل أعمق)</strong>
                    {project.problem.socraticAnswer}
                 </div>
             )}
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
             <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500"/> أفضل الأفكار والحلول</h4>
             <div className="space-y-4">
                {project.ideas.slice(0, 3).map(idea => (
                   <div key={idea.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <p className="font-bold text-gray-800 text-sm">{idea.text}</p>
                      <div className="flex gap-2 items-center mt-2 flex-wrap">
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md font-bold font-mono">نقاط المحرك: {idea.score}</span>
                        {idea.pressureTest && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold">تم خضوعها للضغط</span>}
                      </div>
                   </div>
                ))}
             </div>
         </div>
      </div>

      <div style={{ position: 'absolute', top: 0, right: '100vw', width: '800px', pointerEvents: 'none', visibility: 'visible', zIndex: -50 }}>
        <div ref={printRef} style={{ backgroundColor: '#ffffff', color: '#111827', padding: '48px', width: '100%', minHeight: '1131px', textAlign: 'right', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>{project.name}</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>تم التوليد بواسطة محرك مِدار للذكاء الاصطناعي - الوثيقة الحية (Theory of Change)</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', marginBottom: '12px' }}>1. التشخيص الدقيق والجذور</h3>
            <p style={{ color: '#374151', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', lineHeight: '1.6', border: '1px solid #e5e7eb' }}>{project.problem.text || "لم يتم إدخال المشكلة"}</p>
            {project.problem.socraticAnswer && (
                 <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', color: '#1e3a8a', fontSize: '14px'}}>
                    <strong style={{display: 'block', marginBottom: '4px', color: '#1d4ed8'}}>الإجابة على التحدي السقراطي:</strong>
                    {project.problem.socraticAnswer}
                 </div>
            )}
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', marginBottom: '12px' }}>2. الخريطة الاستراتيجية للأطراف</h3>
            {project.stakeholders.map(s => (
              <div key={s.id} style={{ marginBottom: '8px', borderLeft: '4px solid #3b82f6', paddingLeft: '12px' }}>
                <strong style={{ color: '#111827' }}>{s.name}:</strong> <span style={{ color: '#4b5563' }}>{s.need}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', marginBottom: '12px' }}>3. الافتراضات الحاكمة</h3>
             <ul style={{ listStyleType: 'none', padding: 0 }}>
              {project.assumptions.map((a, i) => (
                <li key={i} style={{ marginBottom: '8px', color: '#374151', background: '#f9fafb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{a.text}</span>
                  <span style={{ fontWeight: 'bold', color: a.status === 'fact' ? '#059669' : '#d97706' }}>[{a.status === 'fact' ? 'مُثبت' : a.status === 'guess' ? 'تخمين' : 'مجهول'}]</span>
                </li>
              ))}
            </ul>
           </div>

          <div style={{ marginBottom: '32px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', marginBottom: '12px' }}>4. الحلول المطروحة واختبارات الضغط</h3>
             {project.ideas.map((idea, idx) => (
                <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                   <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px', color: '#111827' }}>{idx + 1}. {idea.text}</p>
                   <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>سبب التميز: {idea.why}</p>
                   {idea.pressureTest && (
                       <p style={{ color: '#9a3412', fontSize: '13px', backgroundColor: '#fffbeb', padding: '10px', borderRadius: '8px', border: '1px solid #fef3c7' }}><strong>اختبار الضغط:</strong> {idea.pressureTest}</p>
                   )}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

`;
    const newCode = code.substring(0, startIdx) + replacement + code.substring(endIdx);
    fs.writeFileSync('src/App.tsx', newCode);
    console.log('App.tsx StepDashboard updated successfully.');
} else {
    console.error('Could not find StepDashboard boundaries');
}
