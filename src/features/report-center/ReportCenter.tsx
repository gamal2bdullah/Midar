import React, { useRef, useState } from 'react';
import { Project } from '../../hooks/useStorage';
import { InsightEngine } from '../../lib/analysis/InsightEngine';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { GlassCard } from '../../components/ui/shared';
import { FileDown, Target, Lightbulb, AlertTriangle, Coins, Target as TargetIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const ReportCenter = ({ project }: { project: Project }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const analysis = InsightEngine.analyzeProject(project);

  const radarData = [
    { subject: 'وضوح المشكلة', A: analysis.problemClarity.score },
    { subject: 'جودة الافتراضات', A: analysis.assumptionQuality.score },
    { subject: 'اصطفاف الأطراف', A: analysis.stakeholderAlignment.score },
    { subject: 'قابلية التنفيذ', A: analysis.feasibility.score },
    { subject: 'الأثر الاجتماعي', A: analysis.socialImpact.score },
    { subject: 'الاستدامة', A: analysis.sustainability.score },
    { subject: 'جاهزية التمويل', A: analysis.fundingReadiness.score },
  ];

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
      
      pdf.save(`Midar_IntelligenceReport_${project.name}.pdf`);
    } catch (e: any) {
      setExportError(e.message || 'حدث خطأ غير معروف.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 relative pb-10 font-sans text-right" dir="rtl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">مركز التقارير (ذكاء مفسّر)</h2>
          <p className="text-gray-500 font-sans text-sm">تحليل شامل بأبعاد متعددة يوضح قوة مشروعك وجاهزيته.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={exportPDF} disabled={isExporting} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm text-sm">
            <FileDown className="w-5 h-5"/> {isExporting ? 'جاري الاستخراج...' : 'تصدير التقرير التنفيذي'}
          </button>
          {exportError && <span className="text-rose-600 text-xs font-bold">{exportError}</span>}
        </div>
      </div>

      <GlassCard className="mb-8 p-8 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6 text-xl">رادار الجاهزية والابتكار</h3>
        <div className="flex flex-col md:flex-row gap-8 items-center cursor-crosshair">
            <div className="h-72 w-full md:w-1/2 group">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 13, fontFamily: 'Tajawal', fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="المشروع" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#2563EB" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-1/2">
                <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-100 rounded-xl">
                   <div className="flex items-center gap-3">
                     <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><TargetIcon className="w-5 h-5"/></div>
                     <div>
                       <div className="font-bold text-blue-900">النتيجة الإجمالية</div>
                       <div className="text-xs text-blue-700 mt-0.5">جاهزية التمويل والتنفيذ</div>
                     </div>
                   </div>
                   <div className="text-3xl font-black text-blue-800">{analysis.overallScore}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <MetricBox title="مخاطر التنفيذ" score={analysis.executionRisk.level} isLevel desc={analysis.executionRisk.why} color="rose" />
                   <MetricBox title="الأثر الاجتماعي" score={analysis.socialImpact.score} desc={analysis.socialImpact.why} color="emerald" />
                   <MetricBox title="الاستدامة" score={analysis.sustainability.score} desc={analysis.sustainability.why} color="indigo" />
                   <MetricBox title="جاهزية التمويل" score={analysis.fundingReadiness.score} desc={analysis.fundingReadiness.why} color="amber" />
                </div>
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6">
         <h3 className="font-bold text-gray-900 text-xl border-b pb-2">الذكاء المفسّر (Explainable AI)</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExplainItem title="وضوح المشكلة" item={analysis.problemClarity} />
            <ExplainItem title="جودة الافتراضات" item={analysis.assumptionQuality} />
            <ExplainItem title="اصطفاف الأطراف" item={analysis.stakeholderAlignment} />
            <ExplainItem title="قابلية التنفيذ" item={analysis.feasibility} />
         </div>
      </div>

      <div style={{ position: 'absolute', top: 0, right: '100vw', width: '800px', pointerEvents: 'none', visibility: 'visible', zIndex: -50 }}>
        <div ref={printRef} style={{ backgroundColor: '#ffffff', color: '#111827', padding: '48px', width: '100%', minHeight: '1131px', textAlign: 'right', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>{project.name}</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>تقرير الذكاء المفسّر - تم التوليد بواسطة محرك مِدار</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
             <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>النتيجة الإجمالية</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>الجاهزية الكلية للمشروع</p>
             </div>
             <div style={{ fontSize: '32px', fontWeight: '900', color: '#2563eb' }}>{analysis.overallScore} / 100</div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>تفصيل أبعاد الابتكار</h3>
            
            <ReportRow title="وضوح المشكلة" data={analysis.problemClarity} />
            <ReportRow title="جودة الافتراضات" data={analysis.assumptionQuality} />
            <ReportRow title="اصطفاف الأطراف" data={analysis.stakeholderAlignment} />
            <ReportRow title="الأثر الاجتماعي" data={analysis.socialImpact} />
            <ReportRow title="قابلية التنفيذ" data={analysis.feasibility} />
            <ReportRow title="الاستدامة" data={analysis.sustainability} />
            <ReportRow title="جاهزية التمويل" data={analysis.fundingReadiness} />
            
            <div style={{ padding: '16px', backgroundColor: analysis.executionRisk.level === 'High' ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: analysis.executionRisk.level === 'High' ? '#fca5a5' : '#bbf7d0', borderRadius: '8px', marginTop: '16px' }}>
               <strong style={{ display: 'block', color: analysis.executionRisk.level === 'High' ? '#991b1b' : '#166534', marginBottom: '4px' }}>مخاطر التنفيذ الكلية: {analysis.executionRisk.level}</strong>
               <p style={{ color: analysis.executionRisk.level === 'High' ? '#b91c1c' : '#15803d', fontSize: '14px', margin: 0 }}>{analysis.executionRisk.why}</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '12px' }}>
            هذا التقرير يستند إلى تحليل نماذج اللغة المدعمة هيكلياً.
          </div>
        </div>
      </div>
    </div>
  );
};

const ExplainItem = ({ title, item }: { title: string, item: { score: number, why: string } }) => (
  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex flex-col justify-between">
    <div className="flex justify-between items-center mb-2">
      <span className="font-bold text-gray-800">{title}</span>
      <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-sm">{item.score}/100</span>
    </div>
    <p className="text-sm text-gray-500 font-sans leading-relaxed">{item.why}</p>
  </div>
);

const MetricBox = ({ title, score, desc, isLevel, color }: any) => {
  const colorMap: any = {
    rose: 'bg-rose-50 border-rose-100 text-rose-900',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-900',
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
  };
  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]} shadow-sm flex flex-col justify-between`}>
      <div className="text-xs font-bold mb-2 opacity-80 uppercase tracking-widest">{title}</div>
      <div>
         <div className="font-black text-xl mb-1">{score}{!isLevel && <span className="opacity-50 text-sm font-medium">/100</span>}</div>
         <p className="text-[10px] leading-tight opacity-70 font-sans">{desc}</p>
      </div>
    </div>
  );
}

const ReportRow = ({ title, data }: { title: string, data: any }) => (
  <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
    <div style={{ width: '150px', fontWeight: 'bold', color: '#475569' }}>{title}</div>
    <div style={{ width: '60px', fontWeight: '900', color: '#2563eb' }}>{data.score}</div>
    <div style={{ flex: 1, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>{data.why}</div>
  </div>
);
