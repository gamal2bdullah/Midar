/**
 * Midar Local Intelligence Engine
 * Advanced semantic pattern recognition and insight generation strictly offline
 */
import { Project, Idea, Problem, ContrastReview } from '../hooks/useStorage';

const ARABIC_STOP_WORDS = new Set([
  "في", "من", "على", "إلى", "عن", "مع", "هذا", "هذه", "أن", "إن", "هو", "هي",
  "كان", "كانت", "الذي", "التي", "كل", "أو", "أم", "بل", "لا", "لم", "لن",
  "ما", "ماذا", "متى", "كيف", "أين", "هل", "قد", "لقد", "ثم", "بين", "كما"
]);

const DIMENSIONS = {
  feasibility: ["مبلغ", "تكلفة", "تنفيذ", "وقت", "موارد", "تقنية", "ميزانية", "سعر", "ممكن", "مستحيل", "بنية", "عملي", "تمويل"],
  impact: ["أثر", "نتيجة", "تغيير", "تحسين", "مستقبل", "حل", "تأثير", "استدامة", "نمو", "فائدة", "مستدام", "مجتمع"],
  empathy: ["مستخدم", "أشخاص", "مريض", "طالب", "موظف", "معاناة", "شعور", "يحتاج", "يواجه", "إنسان", "متضرر"],
  innovation: ["جديد", "مبتكر", "أول", "حديث", "تكنولوجيا", "ذكاء", "منصة", "فكرة", "تصميم", "غير مسبوق", "ذكي"],
  sustainability: ["استدامة", "بيئة", "أجيال", "مستمر", "دائم", "طاقة", "حفظ", "موارد", "إعادة", "تدوير"]
};

const VAGUE_WORDS = ["جدا", "كبيرا", "في يوم ما", "تقريبا", "شيء", "دائما", "ابدا", "الناس", "الكثير"];

function stemWord(word: string): string {
  let w = word.replace(/[ًٌٍَُِّْ]/g, ""); 
  if (w.length > 3 && w.startsWith("ال")) w = w.slice(2);
  if (w.length > 3 && w.startsWith("وال")) w = w.slice(3);
  if (w.length > 3 && w.startsWith("بال")) w = w.slice(3);
  if (w.length > 3 && w.endsWith("ات")) w = w.slice(0, -2);
  if (w.length > 3 && w.endsWith("ون")) w = w.slice(0, -2);
  if (w.length > 3 && w.endsWith("ين")) w = w.slice(0, -2);
  w = w.replace(/[أإآ]/g, "ا").replace(/[ىي]/g, "ي").replace(/ة/g, "ه");
  return w;
}

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const words = text.split(/[\s،.,؛؟!]+/).filter(w => w.trim().length > 2);
  const keywords = words
    .filter(w => !ARABIC_STOP_WORDS.has(w))
    .map(stemWord)
    .filter(w => w.length > 2);
  
  const freqMap: Record<string, number> = {};
  keywords.forEach(kw => freqMap[kw] = (freqMap[kw] || 0) + 1);
  return Object.keys(freqMap).sort((a, b) => freqMap[b] - freqMap[a]);
}

/** 
 * Evaluates a problem statement and scores it
 */
export function evaluateProblemStatement(text: string): Problem {
  let clarityScore = 50;
  let impactScore = 20;
  let feasibilityScore = 20;
  let sustainabilityScore = 20;
  
  let feedback = "يحتاج لإعادة صياغة";
  const gaps: string[] = [];
  const missingElements: string[] = [];
  const smartChips: string[] = [];
  let nextAction = "الاستمرار في تفصيل المشكلة";

  if (text.length < 30) {
    gaps.push("النص قصير جداً لوصف مشكلة حقيقية.");
    missingElements.push("سياق المشكلة", "الأطراف المتأثرة");
    return { 
      text, score: 20, feedback: "حاول صياغة المشكلة بتفصيل يوضح السياق والأطراف المتأثرة.", gaps,
      clarityScore: 20, impactScore: 0, feasibilityScore: 0, sustainabilityScore: 0,
      missingElements, nextAction: "أضف المزيد من التفاصيل حول من يعاني من هذه المشكلة.",
      smartChips: ["تحتاج تفصيل"]
    };
  }

  const kws = extractKeywords(text);
  
  const hasEmpathy = kws.some(k => DIMENSIONS.empathy.some(d => stemWord(d) === k));
  const hasImpact = kws.some(k => DIMENSIONS.impact.some(d => stemWord(d) === k));
  const hasSustainability = kws.some(k => DIMENSIONS.sustainability.some(d => stemWord(d) === k));
  const hasFeasibility = kws.some(k => DIMENSIONS.feasibility.some(d => stemWord(d) === k));
  
  const vagueMatches = VAGUE_WORDS.filter(v => text.includes(v));

  // Compute sub-scores
  if (hasEmpathy) {
    clarityScore += 20;
    smartChips.push("عمق إنساني");
  } else {
    missingElements.push("هوية المتضرر");
    gaps.push("المشكلة لا توضح الضحية أو 'من' يتأثر تحديداً.");
  }

  if (hasImpact) {
    impactScore += 40;
    smartChips.push("تأثير واضح");
  } else {
    missingElements.push("النتائج السلبية");
    gaps.push("تأثير المشكلة أو النتيجة السلبية غير واضحة.");
  }

  if (hasSustainability) {
    sustainabilityScore += 60;
    smartChips.push("تفكير مستدام");
  } else {
    missingElements.push("الأثر طويل المدى");
  }

  if (hasFeasibility) {
    feasibilityScore += 50;
    smartChips.push("قابلة للقياس");
  }

  if (vagueMatches.length > 0) {
    clarityScore -= (vagueMatches.length * 10);
    gaps.push(`ابتعد عن المبالغات والتعميم (مثل: ${vagueMatches.join('، ')}). التحديد يقوي الموقف.`);
  } else {
    clarityScore += 10;
  }

  if (text.includes("بسبب") || text.includes("نظراً") || text.includes("لأن")) {
    clarityScore += 15;
    smartChips.push("مُحددة الأسباب");
  } else {
    missingElements.push("السبب الجذري");
    gaps.push("أين ذكر الجذور أو المسببات؟ استخدم كلمة 'بسبب' لربط المشكلة بأسبابها.");
  }

  clarityScore = Math.min(100, Math.max(0, clarityScore));
  impactScore = Math.min(100, Math.max(0, impactScore));
  feasibilityScore = Math.min(100, Math.max(0, feasibilityScore));
  sustainabilityScore = Math.min(100, Math.max(0, sustainabilityScore));

  const overallScore = Math.floor((clarityScore * 0.5) + (impactScore * 0.3) + (feasibilityScore * 0.2));

  if (overallScore > 80) {
    feedback = "صياغة ممتازة ومباشرة، تعكس مشكلة حقيقية وتُشير لمسبباتها بدقة. أنت جاهز للانتقال للخطوة التالية.";
    nextAction = "الانتقال لتحديد الأطراف المتأثرة بدقة.";
  } else if (overallScore > 50) {
    feedback = "صياغة جيدة ولكن تحتاج إلى تحديد أكبر للضحية أو المسببات العميقة لضمان تركيز الحلول.";
    nextAction = "قم بتغطية العناصر الناقصة لرفع موثوقية النص.";
  } else {
    feedback = "تعريف المشكلة ما زال سطحياً. الابتكار القوي يبدأ من فهم دقيق ومفصل للمشكلة.";
    nextAction = "حدد مَن يعاني، ولماذا، وما هو الأثر بشكل صريح.";
  }

  return { 
    text, 
    score: overallScore, 
    feedback, 
    gaps,
    impactScore,
    feasibilityScore,
    sustainabilityScore,
    clarityScore,
    missingElements,
    nextAction,
    smartChips
  };
}

/** Evaluates an idea for ideation phase */
export function scoreIdea(text: string): Idea {
  const kws = extractKeywords(text);
  let score = Math.min(10, kws.length * 1.5 + (text.length > 50 ? 2 : 0));
  
  let why = "مجرد فكرة عامة غير مُفصلة.";
  
  const hasInnovation = kws.some(k => DIMENSIONS.innovation.some(d => stemWord(d) === k));
  const hasFeasibility = kws.some(k => DIMENSIONS.feasibility.some(d => stemWord(d) === k));

  if (score > 7) {
    if (hasInnovation && hasFeasibility) why = "تجمع بين قوة الابتكار وإمكانية التنفيذ العملي.";
    else if (hasInnovation) why = "فكرة ابتكارية وعصرية قد تخلق تأثيراً كبيراً.";
    else why = "فكرة متينة ومُفصلة هيكلياً.";
  } else if (score > 4) {
    why = "تحتاج لتفصيل أدوات التنفيذ أو إضافة جانب تقني/عملي.";
  }

  return { id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, text, score, why };
}

export function classifyContrast(critique: string): string {
  const kws = extractKeywords(critique);
  if (kws.some(k => DIMENSIONS.feasibility.some(d => stemWord(d) === k))) return 'ضعف الجدوى';
  if (kws.some(k => ["غالي", "مال", "ميزانية"].includes(k))) return 'عائق مالي';
  if (kws.some(k => DIMENSIONS.empathy.some(d => stemWord(d) === k))) return 'رفض مجتمعي';
  return 'خطر تنفيذي';
}

export interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}

/** Analyzes the entire project to map strengths across dimensions */
export function calculateRadarStats(project: Project): RadarData[] {
  const allText = [
    project.problem.text,
    ...project.stakeholders.map(s => s.name + " " + s.need),
    ...project.ideas.map(i => i.text),
    ...project.contrastReviews.map(c => c.countermeasure)
  ].join(" ");
  
  const kws = extractKeywords(allText);
  
  const countMatches = (dict: string[]) => {
    return dict.filter(d => kws.includes(stemWord(d))).length;
  };

  // Base logic with safety limits
  let feas = Math.min(100, (countMatches(DIMENSIONS.feasibility) * 15)) || 20;
  let imp = Math.min(100, (countMatches(DIMENSIONS.impact) * 15)) || 20;
  let emp = Math.min(100, (countMatches(DIMENSIONS.empathy) * 15)) || 20;
  let inn = Math.min(100, (countMatches(DIMENSIONS.innovation) * 15)) || 20;
  
  const structure = Math.min(100, project.problem.score || 20);

  // Boosts from data structure
  if (project.stakeholders.length > 2) emp += 20;
  if (project.contrastReviews.length > 0) feas += 20;
  if (project.ideas.some(i => i.score > 8)) inn += 20;

  return [
    { subject: 'الجدوى', A: Math.min(100, feas), fullMark: 100 },
    { subject: 'الأثر', A: Math.min(100, imp), fullMark: 100 },
    { subject: 'التعاطف', A: Math.min(100, emp), fullMark: 100 },
    { subject: 'الابتكار', A: Math.min(100, inn), fullMark: 100 },
    { subject: 'الوضوح', A: Math.min(100, structure), fullMark: 100 },
  ];
}


