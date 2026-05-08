import React, { useRef, useState, useEffect } from 'react';
import { Project } from '../../hooks/useStorage';
import { InsightEngine } from '../../lib/analysis/InsightEngine';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { GlassCard } from '../../components/ui/shared';
import { FileDown, Target, Zap, ShieldAlert, Sparkles, Target as TargetIcon, Code, FileText, CheckCircle2, Share2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { GeminiOrchestrator } from '../../lib/ai-engine';

type ReportVariant = 'executive' | 'funder' | 'operational';

export const ReportCenter = ({ project }: { project: Project }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [geminiInsight, setGeminiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [reportVariant, setReportVariant] = useState<ReportVariant>('executive');
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    async function fetchInsight() {
      setLoadingInsight(true);
      const insight = await GeminiOrchestrator.synthesizeInsights(project);
      setGeminiInsight(insight);
      setLoadingInsight(false);
    }
    fetchInsight();
  }, [project]);

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
      
      pdf.save(`Midar_Report_${reportVariant}_${project.name}.pdf`);
    } catch (e: any) {
      setExportError(e.message || 'حدث خطأ غير معروف.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Midar_${project.name}_Backup.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyShareLink = () => {
    try {
      // Basic compression logic utilizing base64 and dropping large cached AI results if necessary.
      // But we will try full first.
      const slimProject = { ...project };
      if(slimProject.evidence) {
        slimProject.evidence = slimProject.evidence.map(e => ({...e, aiAnalysis: ''}));
      }
      const stringified = JSON.stringify(slimProject);
      const b64 = window.btoa(unescape(encodeURIComponent(stringified)));
      const url = `${window.location.origin}${window.location.pathname}?share=${b64}`;
      navigator.clipboard.writeText(url);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 3000);
    } catch(err) {
      setExportError("حجم المشروع كبير جداً على المشاركة عبر رابط مباشر. استخدم التصدير.");
    }
  };

  const copyMarkdown = () => {
    let md = `# تقرير المشروع: ${project.name}\n\n`;
    md += `**النتيجة الإجمالية:** ${analysis.overallScore}/100\n\n`;
    if (geminiInsight) {
      md += `## التوليف الاستراتيجي\n${geminiInsight}\n\n`;
    }
    md += `## التحليل الفني\n`;
    md += `- وضوح المشكلة: ${analysis.problemClarity.score}\n`;
    md += `- جودة الافتراضات: ${analysis.assumptionQuality.score}\n`;
    md += `- اصطفاف الأطراف: ${analysis.stakeholderAlignment.score}\n`;
    md += `- الأثر الاجتماعي: ${analysis.socialImpact.score}\n`;
    md += `- قابلية التنفيذ: ${analysis.feasibility.score}\n`;
    md += `- الاستدامة: ${analysis.sustainability.score}\n`;
    md += `- جاهزية التمويل: ${analysis.fundingReadiness.score}\n\n`;
    
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 relative pb-10 font-sans text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">الوثيقة الحية ومخرجات الإطلاق</h2>
          <p className="text-slate-500 font-sans text-sm">استخرج تقارير مخصصة لاحتياجات فريقك أو مستثمرك بصيغ متعددة.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Variant Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex hidden lg:flex">
            <button onClick={() => setReportVariant('executive')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reportVariant === 'executive' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>تنفيذي</button>
            <button onClick={() => setReportVariant('funder')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reportVariant === 'funder' ? 'bg-white shadow-sm text-indigo-900' : 'text-slate-500 hover:text-indigo-700'}`}>للمستثمرين</button>
            <button onClick={() => setReportVariant('operational')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reportVariant === 'operational' ? 'bg-white shadow-sm text-emerald-900' : 'text-slate-500 hover:text-emerald-700'}`}>تشغيلي</button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block"></div>

          <button onClick={exportJSON} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl font-bold transition-all shadow-sm text-sm" title="تصدير بيانات JSON">
            <Code className="w-4 h-4"/> <span className="hidden sm:inline">Backup</span>
          </button>
          <button onClick={copyMarkdown} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl font-bold transition-all shadow-sm text-sm" title="نسخ كمستند Markdown">
            {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <FileText className="w-4 h-4"/>} <span className="hidden sm:inline">MD</span>
          </button>
          <button onClick={copyShareLink} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 px-3 py-2 rounded-xl font-bold transition-all shadow-sm text-sm" title="نسخ رابط صفحة عامة">
            {isLinkCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Share2 className="w-4 h-4"/>} <span className="hidden sm:inline">{isLinkCopied ? 'تم النسخ' : 'رابط'}</span>
          </button>
          <button onClick={exportPDF} disabled={isExporting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-sm text-sm">
            <FileDown className="w-4 h-4"/> {isExporting ? 'تحميل...' : 'PDF'}
          </button>
        </div>
      </div>
      
      {/* Mobile Variant Selector */}
      <div className="bg-slate-100 p-1 rounded-xl flex lg:hidden w-full">
        <button onClick={() => setReportVariant('executive')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reportVariant === 'executive' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>تنفيذي</button>
        <button onClick={() => setReportVariant('funder')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reportVariant === 'funder' ? 'bg-white shadow-sm text-indigo-900' : 'text-slate-500 hover:text-indigo-700'}`}>للمستثمرين</button>
        <button onClick={() => setReportVariant('operational')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reportVariant === 'operational' ? 'bg-white shadow-sm text-emerald-900' : 'text-slate-500 hover:text-emerald-700'}`}>تشغيلي</button>
      </div>

      {exportError && <div className="text-rose-600 text-sm font-bold bg-rose-50 p-3 rounded-lg border border-rose-200">{exportError}</div>}

      {loadingInsight ? (
        <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-3 animate-pulse">
           <Sparkles className="w-5 h-5 text-indigo-500" />
           <span className="text-sm font-bold text-indigo-800">جاري صياغة التقرير الإستراتيجي الذكي (النسخة {reportVariant === 'executive' ? 'التنفيذية' : reportVariant === 'funder' ? 'التمويلية' : 'التشغيلية'})...</span>
        </div>
      ) : geminiInsight ? (
        <div className="p-8 bg-gradient-to-l from-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <h3 className="font-bold text-indigo-200 mb-4 flex items-center gap-2 relative z-10"><Sparkles className="w-5 h-5"/> التوليف الاستراتيجي (AI Synthesis) - {reportVariant === 'funder' ? 'نظرة استثمارية' : reportVariant === 'operational' ? 'الواقع التشغيلي' : 'نظرة تنفيذية'}</h3>
           <div className="relative z-10 text-sm leading-relaxed space-y-4 font-medium text-slate-100 whitespace-pre-wrap">
              {geminiInsight}
           </div>
        </div>
      ) : null}

      <GlassCard className="mb-8 p-8 shadow-sm justify-between transition-all duration-300">
        <h3 className="font-bold text-slate-900 mb-6 text-xl">رادار الجاهزية الشاملة</h3>
        <div className="flex flex-col lg:flex-row gap-8 items-center cursor-crosshair">
            <div className="h-72 w-full lg:w-1/2 group">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 13, fontFamily: 'Tajawal', fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="المشروع" dataKey="A" stroke="#4f46e5" strokeWidth={2} fill="#4f46e5" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
                <div className="flex justify-between items-center p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                   <div className="flex items-center gap-3">
                     <div className="bg-white shadow-sm p-3 rounded-xl text-indigo-600"><TargetIcon className="w-6 h-6"/></div>
                     <div>
                       <div className="font-black text-indigo-900 text-lg">النتيجة الإجمالية</div>
                       <div className="text-xs font-bold text-indigo-700/80 mt-0.5 tracking-wider">مؤشر الجاهزية المتكامل</div>
                     </div>
                   </div>
                   <div className="text-4xl font-black text-indigo-600">{analysis.overallScore}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   {reportVariant === 'operational' ? (
                     <>
                       <MetricBox title="مخاطر التنفيذ" score={analysis.executionRisk.level} isLevel desc={analysis.executionRisk.why} color="rose" />
                       <MetricBox title="قابلية التنفيذ" score={analysis.feasibility.score} desc={analysis.feasibility.why} color="emerald" />
                       <MetricBox title="وضوح المشكلة" score={analysis.problemClarity.score} desc={analysis.problemClarity.why} color="indigo" />
                       <MetricBox title="جودة الافتراضات" score={analysis.assumptionQuality.score} desc={analysis.assumptionQuality.why} color="amber" />
                     </>
                   ) : reportVariant === 'funder' ? (
                     <>
                       <MetricBox title="الأثر الاجتماعي" score={analysis.socialImpact.score} desc={analysis.socialImpact.why} color="emerald" />
                       <MetricBox title="جاهزية التمويل" score={analysis.fundingReadiness.score} desc={analysis.fundingReadiness.why} color="amber" />
                       <MetricBox title="الاستدامة" score={analysis.sustainability.score} desc={analysis.sustainability.why} color="indigo" />
                       <MetricBox title="مخاطر التنفيذ" score={analysis.executionRisk.level} isLevel desc={analysis.executionRisk.why} color="rose" />
                     </>
                   ) : (
                     <>
                       <MetricBox title="مخاطر التنفيذ" score={analysis.executionRisk.level} isLevel desc={analysis.executionRisk.why} color="rose" />
                       <MetricBox title="الأثر الاجتماعي" score={analysis.socialImpact.score} desc={analysis.socialImpact.why} color="emerald" />
                       <MetricBox title="الاستدامة" score={analysis.sustainability.score} desc={analysis.sustainability.why} color="indigo" />
                       <MetricBox title="جاهزية التمويل" score={analysis.fundingReadiness.score} desc={analysis.fundingReadiness.why} color="amber" />
                     </>
                   )}
                </div>
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6">
         <h3 className="font-bold text-slate-900 text-xl border-b border-slate-200 pb-3">تفسير النتائج الاستراتيجية</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExplainItem title="وضوح المشكلة" item={analysis.problemClarity} />
            <ExplainItem title="جودة الافتراضات" item={analysis.assumptionQuality} />
            <ExplainItem title="اصطفاف الأطراف" item={analysis.stakeholderAlignment} />
            <ExplainItem title="قابلية التنفيذ" item={analysis.feasibility} />
         </div>
      </div>

      {/* Invisible PDF Template tailored by variant (rendered out of screen for html2canvas) */}
      <div style={{ position: 'absolute', top: 0, right: '100vw', width: '800px', pointerEvents: 'none', visibility: 'visible', zIndex: -50 }}>
        <div ref={printRef} style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '48px', width: '100%', minHeight: '1131px', textAlign: 'right', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>{project.name}</h1>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>
                {reportVariant === 'executive' ? 'التقرير التنفيذي (Executive Summary)' : reportVariant === 'funder' ? 'مذكرة الطرح التمويلي (Funding Pitch Memo)' : 'التقرير التشغيلي (Operational Report)'}
              </p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>تاريخ الإصدار</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>{new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', backgroundColor: reportVariant === 'funder' ? '#f0fdfa' : '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid', borderColor: reportVariant === 'funder' ? '#ccfbf1' : '#e2e8f0' }}>
             <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>المؤشر العام للجاهزية</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>بناءً على معايير الجودة والاستدامة والمخاطر</p>
             </div>
             <div style={{ fontSize: '36px', fontWeight: '900', color: reportVariant === 'funder' ? '#0f766e' : '#4f46e5' }}>{analysis.overallScore} <span style={{fontSize:'16px', opacity:0.5}}>/ 100</span></div>
          </div>

          {geminiInsight && (
            <div style={{ marginBottom: '32px', padding: '28px', backgroundColor: '#eef2ff', borderRadius: '16px', border: '1px solid #c7d2fe' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#3730a3', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 التوليف الاستراتيجي الذكي
              </h3>
              <p style={{ color: '#312e81', fontSize: '14px', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
                {geminiInsight}
              </p>
            </div>
          )}

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>تفصيل أبعاد الابتكار</h3>
            
            {reportVariant === 'funder' ? (
              <>
                <ReportRow title="جاهزية التمويل" data={analysis.fundingReadiness} highlight />
                <ReportRow title="الأثر الاجتماعي" data={analysis.socialImpact} highlight />
                <ReportRow title="الاستدامة" data={analysis.sustainability} />
                <ReportRow title="القابلية للتنفيذ" data={analysis.feasibility} />
              </>
            ) : reportVariant === 'operational' ? (
              <>
                <ReportRow title="وضوح المشكلة" data={analysis.problemClarity} />
                <ReportRow title="القابلية للتنفيذ" data={analysis.feasibility} highlight />
                <ReportRow title="جودة الافتراضات" data={analysis.assumptionQuality} highlight />
                <ReportRow title="اصطفاف الأطراف" data={analysis.stakeholderAlignment} />
              </>
            ) : (
              <>
                <ReportRow title="وضوح المشكلة" data={analysis.problemClarity} />
                <ReportRow title="الأثر الاجتماعي" data={analysis.socialImpact} />
                <ReportRow title="الاستدامة" data={analysis.sustainability} />
                <ReportRow title="جاهزية التمويل" data={analysis.fundingReadiness} />
              </>
            )}
            
          </div>

          <div style={{ marginBottom: '32px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>المخاطر والتحديات الجوهرية</h3>
             <div style={{ padding: '20px', backgroundColor: analysis.executionRisk.level === 'High' ? '#fef2f2' : '#f0fdfa', border: '1px solid', borderColor: analysis.executionRisk.level === 'High' ? '#fca5a5' : '#99f6e4', borderRadius: '12px' }}>
                <strong style={{ display: 'block', color: analysis.executionRisk.level === 'High' ? '#991b1b' : '#115e59', marginBottom: '8px', fontSize: '16px' }}>مستوى المخاطر الكلي: {analysis.executionRisk.level}</strong>
                <p style={{ color: analysis.executionRisk.level === 'High' ? '#b91c1c' : '#0f766e', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>{analysis.executionRisk.why}</p>
             </div>
          </div>

          {(reportVariant !== 'funder' && project.decisions && project.decisions.length > 0) && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>سجل القرارات الاستراتيجية</h3>
              {project.decisions.map(d => (
                 <div key={d.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                   <div style={{ fontWeight: 'bold', color: '#334155', fontSize: '15px' }}>{d.title} <span style={{ fontSize: '11px', backgroundColor: d.status === 'approved' ? '#dcfce7' : d.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: d.status === 'approved' ? '#166534' : d.status === 'rejected' ? '#991b1b' : '#92400e', padding: '2px 8px', borderRadius: '99px', marginRight: '8px' }}>{d.status}</span></div>
                   <div style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', lineHeight: 1.5 }}>{d.rationale}</div>
                 </div>
              ))}
            </div>
          )}

          {(project.experiments && project.experiments.length > 0) && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>المحفظة التجريبية (Traction & Testing)</h3>
              {project.experiments.map(e => (
                 <div key={e.id} style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                   <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px', marginBottom: '8px' }}>{e.name} <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '6px' }}>الحالة: {e.status}</span></div>
                   <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px', lineHeight: 1.5 }}><strong>الفرضية المراد إثباتها: </strong>{e.hypothesis}</div>
                   {e.result && <div style={{ color: '#4f46e5', fontSize: '14px', marginTop: '8px', lineHeight: 1.5, backgroundColor: '#eef2ff', padding: '8px', borderRadius: '8px' }}><strong>مخرجات التجربة: </strong>{e.result}</div>}
                 </div>
              ))}
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '64px', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '12px', border: '1px solid #e2e8f0' }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: '#475569' }}>تم توليد هذه الوثيقة آلياً بواسطة مِدار (Midar OS)</strong>
            هذا المستند سري وقد يحتوي على معلومات حساسة. يعتمد تحليل محرك مِدار على المدخلات الحالية للمشروع والتوليف الاستراتيجي لنماذج الذكاء الاصطناعي ويهدف لدعم قرار صانع القرار وليس بدیلاً عنه.
          </div>
        </div>
      </div>
    </div>
  );
};

const ExplainItem = ({ title, item }: { title: string, item: { score: number, why: string } }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center mb-3">
      <span className="font-bold text-slate-800 text-lg">{title}</span>
      <span className="text-indigo-700 font-black bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-sm">{item.score}<span className="text-[10px] opacity-60">/100</span></span>
    </div>
    <p className="text-sm text-slate-600 font-sans leading-relaxed">{item.why}</p>
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
         <div className="font-black text-2xl mb-1">{score}{!isLevel && <span className="opacity-50 text-sm font-medium">/100</span>}</div>
         <p className="text-[10px] leading-tight opacity-75 font-sans font-medium">{desc}</p>
      </div>
    </div>
  );
}

const ReportRow = ({ title, data, highlight = false }: { title: string, data: any, highlight?: boolean }) => (
  <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px', backgroundColor: highlight ? '#f8fafc' : 'transparent', padding: highlight ? '16px' : '0 0 16px 0', borderRadius: highlight ? '12px' : '0' }}>
    <div style={{ width: '180px', fontWeight: 'bold', color: highlight ? '#334155' : '#475569', fontSize: '15px' }}>{title}</div>
    <div style={{ width: '80px', fontWeight: '900', color: highlight ? '#4f46e5' : '#64748b', fontSize: '18px' }}>{data.score}</div>
    <div style={{ flex: 1, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>{data.why}</div>
  </div>
);

