import { Project } from '../../hooks/useStorage';

export interface ComprehensiveAnalysis {
  problemClarity: { score: number; why: string };
  assumptionQuality: { score: number; why: string };
  stakeholderAlignment: { score: number; why: string };
  feasibility: { score: number; why: string };
  socialImpact: { score: number; why: string };
  sustainability: { score: number; why: string };
  executionRisk: { score: number; why: string; level: 'Low' | 'Medium' | 'High' };
  fundingReadiness: { score: number; why: string };
  overallScore: number;
}

export class InsightEngine {
  // This logic is mostly heuristic as an immediate offline-friendly placeholder
  // but acts as the foundation for the deep multi-layered analysis.
  static analyzeProject(project: Project): ComprehensiveAnalysis {
    let problemScore = project.problem?.text?.length > 30 ? 80 : 30;
    let problemWhy = problemScore > 50 ? "المشكلة مصاغة بوضوح وتفصيل جيد." : "وصف المشكلة قصير جداً ولا يوضح الجذور.";
    
    let assumptionsScore = project.assumptions?.length > 2 ? 85 : 40;
    let assumptionWhy = project.assumptions?.length > 2 ? "تم رصد افتراضات كافية للاختبار." : "يجب استخراج مزيد من الافتراضات الخفية لتقليل المخاطر.";

    let stakeholdersAligned = project.stakeholders?.length > 0 ? 80 : 20;
    let stakeholdersWhy = project.stakeholders?.length > 0 ? "يوجد وعي بالأطراف المعنية واحتياجاتهم." : "لم يتم تحديد الأطراف المستفيدة أو المتضررة.";

    let maxIdeaScore = Math.max(...(project.ideas?.map(i => i.score) || [0]), 0);
    let feasibility = maxIdeaScore > 0 ? maxIdeaScore * 10 : 30;
    let feasibilityWhy = feasibility > 60 ? "الحلول المطروحة تمتلك قابلية تنفيذ عالية." : "الحلول بحاجة لمزيد من الاختبار أو غير واقعية.";

    let social = feasibility > 50 && stakeholdersAligned > 50 ? 85 : 45;
    let socialWhy = social > 70 ? "المشروع يمتلك إمكانيات عالية لإحداث أثر مجتمعي." : "الأثر المجتمعي غير متطابق مع احتياجات الأطراف المحددة.";

    let sust = project.contrastReviews?.length > 0 ? 75 : 30;
    let sustWhy = sust > 60 ? "تم التفكير في التحديات والتدابير المضادة، مما يبني أساساً مستداماً." : "لم يتم طرح تدابير مضادة أو التفكير في التحديات المستقبلية.";

    let riskScore = 100 - sust;
    let riskLevel: 'High' | 'Medium' | 'Low' = riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low';
    let riskWhy = riskLevel === 'High' ? "مخاطر التنفيذ عالية لعدم دراسة التباين والتدابير المضادة." : "مخاطر مقبولة ومعالجة مبدئياً.";

    let funding = (problemScore + stakeholdersAligned + feasibility + sust) / 4;
    let fundingWhy = funding > 70 ? "الجاهزية جيدة، المشروع منظم وقابل للعرض على المانحين." : "الجاهزية ضعيفة، يحتاج المشروع لترابط أقوى بين المشكلة والحلول والمخاطر.";

    const overallScore = (problemScore + assumptionsScore + stakeholdersAligned + feasibility + social + sust + funding) / 7;

    return {
      problemClarity: { score: problemScore, why: problemWhy },
      assumptionQuality: { score: assumptionsScore, why: assumptionWhy },
      stakeholderAlignment: { score: stakeholdersAligned, why: stakeholdersWhy },
      feasibility: { score: feasibility, why: feasibilityWhy },
      socialImpact: { score: social, why: socialWhy },
      sustainability: { score: sust, why: sustWhy },
      executionRisk: { score: riskScore, why: riskWhy, level: riskLevel },
      fundingReadiness: { score: funding, why: fundingWhy },
      overallScore: Math.round(overallScore)
    };
  }
}
