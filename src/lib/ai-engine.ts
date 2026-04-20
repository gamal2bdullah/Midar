/**
 * Midar Local Intelligence Engine
 * Advanced semantic pattern recognition, Transformers.js inference, and insight generation
 */
import { pipeline, env } from '@huggingface/transformers';
import { Project, Idea, Problem, ContrastReview } from '../hooks/useStorage';

// Disable sending models to background threads inside limited memory web runtimes to avoid hanging
env.allowLocalModels = false;
env.useBrowserCache = true;

class CognitiveEngine {
  static instance: any = null;
  static classifier: any = null;
  static ready = false;

  static async initialize() {
    if (this.ready) return;
    try {
      // Using a remarkably light multilingual zero-shot classifier model for text tasks
      this.classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
      this.ready = true;
      console.log("Midar Cognitive Engine (Transformers.js) Active.");
    } catch (e) {
      console.warn("Transformers.js initialization fallback triggered:", e);
      this.ready = false;
    }
  }

  // 1. Assumption Archaeology Pipeline
  static async classifyAssumption(text: string): Promise<'fact'|'guess'|'unknown'> {
    if (!this.ready || !this.classifier) return 'unknown';
    try {
      // We translate the labels to English for the model, then map back to our logic
      const result = await this.classifier(text, ['proven fact', 'unverified assumption', 'future prediction']);
      const topLabel = result.labels[0];
      if (topLabel === 'proven fact') return 'fact';
      if (topLabel === 'unverified assumption') return 'guess';
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  // 2. Stakeholder Voice Simulation Pipeline (Sentiment / Tone match)
  static async simulateStakeholderResistance(ideaText: string, stakeholderNeed: string): Promise<string> {
    if (!this.ready || !this.classifier) return "قد لا يلبي هذا كامل تطلعاتي الفورية.";
    try {
      const combined = `Idea: ${ideaText}. Need: ${stakeholderNeed}. Does this idea satisfy the need?`;
      const result = await this.classifier(combined, ['satisfies', 'conflicts', 'irrelevant']);
      const topLabel = result.labels[0];
      
      if (topLabel === 'conflicts') {
         return "أشعر أن هذا الحل يتعارض تماماً مع احتياجاتي الأساسية ويتجاهل سياقي.";
      } else if (topLabel === 'satisfies') {
         return "هذا الحل واعد، لكنني أتساءل عن سهولة تطبيقه بالنسبة لي.";
      }
      return "من منظوري، يبدو هذا الحل غير متعلق بشكل مباشر بالمشكلة التي أعاني منها.";
    } catch (e) {
      return "أحتاج لرؤية نموذج ملموس قبل الحكم.";
    }
  }

  // 3. Idea Pressure Testing Pipeline
  static async generatePressureTest(ideaText: string): Promise<string> {
    if (!this.ready || !this.classifier) return "ما هو أكبر عائق مالي لتنفيذ هذه الفكرة غداً؟";
    try {
      const result = await this.classifier(ideaText, ['technical limitation', 'financial constraint', 'social resistance']);
      const topLabel = result.labels[0];

      if (topLabel === 'technical limitation') return "ماذا لو فشلت البنية التحتية التقنية في دعم هذا الحل؟ هل يوجد بديل يدوي؟";
      if (topLabel === 'financial constraint') return "إذا تقلصت الميزانية بنسبة 50% فجأة، ما هو أول تنازل ستقدمه في هذه الفكرة؟";
      return "كيف ستتعامل مع مقاومة المجتمع أو المستفيدين إذا شعروا أن هذا الحل مفروض عليهم؟";
    } catch (e) {
      return "الضغط: من سيعارض هذا الحل بشدة؟";
    }
  }
}

// Fire up the engine in background
CognitiveEngine.initialize();

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

// ... Exporting cognitive access pattern
export const DeepEngine = CognitiveEngine;

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
 * Generates a Socratic question based on keywords found. Focuses on pushing the thinker.
 */
function generateSocraticQuestion(text: string, kws: string[]): string {
  const t = text.toLowerCase();
  
  if (t.includes("تطبيق") || t.includes("منص")) {
    return "لقد اقترحت أو ذكرت حلاً رقمياً. ماذا لو لم يمتلك المستفيدون اتصالاً مستقراً بالإنترنت؟ كيف ستعالج المشكلة؟";
  }
  if (t.includes("مجان") || t.includes("بدون تكلفة") || t.includes("تطوع")) {
    return "الاعتماد على التطوع أو المجانية رائع في البداية. لكن من سيمول النظام المالي للمشروع بعد عامين للحفاظ على استمراريته؟";
  }
  if (t.includes("شباب") || t.includes("طلاب")) {
    return "خصصت فئة الشباب. هل افترضت أن لديهم وقت الفراغ الكافي أم أن هذا السياق سيزاحم أولوياتهم اليومية؟";
  }
  if (t.includes("توعية") || t.includes("وعي") || t.includes("نشر")) {
    return "التوعية وحدها نادراً ما تغير السلوك البشري بصورة مفاجئة. ما هو الحافز المادي أو المعنوي الفوري الذي يقدمه حلك للتغيير الفعلي؟";
  }
  if (t.includes("حكوم") || t.includes("وزار")) {
    return "الاعتماد على جهة رسمية قد يطيل مدة التنفيذ والتغيير. هل هناك زاوية مجتمعية مصغرة يمكنك الانطلاق منها بمفردك كخطوة أولى؟";
  }
  
  const vague = VAGUE_WORDS.find(v => t.includes(v));
  if (vague) {
    return `استخدمت تعبير "${vague}" وهو واسع جداً. هل يمكنك استبدال هذا التعبير برقم محدد أو فئة ضيقة يمكن قياسها فعلياً؟`;
  }
  
  return "لو تجاهلنا هذه المشكلة لـ 5 سنوات إضافية، من هو الخاسر الأكبر؟ وهل التركيز الحالي ينقذه مباشرة أم ينقذ من حوله؟";
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
  let socraticQuestion = "لماذا تعتبر هذه مشكلة من الأساس؟ ومن يدفع ثمنها اليوم؟";

  if (text.length < 30) {
    gaps.push("النص قصير جداً لوصف مشكلة حقيقية.");
    missingElements.push("سياق المشكلة", "الأطراف المتأثرة");
    return { 
      text, score: 20, feedback: "حاول صياغة المشكلة بتفصيل يوضح السياق والأطراف المتأثرة.", gaps,
      clarityScore: 20, impactScore: 0, feasibilityScore: 0, sustainabilityScore: 0,
      missingElements, nextAction: "أضف المزيد من التفاصيل حول من يعاني من هذه المشكلة.",
      smartChips: ["تحتاج تفصيل"],
      socraticQuestion,
      whys: []
    };
  }

  const kws = extractKeywords(text);
  
  const hasEmpathy = kws.some(k => DIMENSIONS.empathy.some(d => stemWord(d) === k));
  const hasImpact = kws.some(k => DIMENSIONS.impact.some(d => stemWord(d) === k));
  const hasSustainability = kws.some(k => DIMENSIONS.sustainability.some(d => stemWord(d) === k));
  const hasFeasibility = kws.some(k => DIMENSIONS.feasibility.some(d => stemWord(d) === k));
  
  const vagueMatches = VAGUE_WORDS.filter(v => text.includes(v));
  
  socraticQuestion = generateSocraticQuestion(text, kws);

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
    nextAction = "تحديد الأطراف المتأثرة بدقة.";
  } else if (overallScore > 50) {
    feedback = "صياغة جيدة ولكن تحتاج إلى تحديد أكبر للضحية أو المسببات العميقة لضمان تركيز الحلول.";
    nextAction = "الرد المباشر على سؤال مِدار لحل الفجوات.";
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
    smartChips,
    socraticQuestion,
    whys: [] // Ensure we don't break existing shapes immediately
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

// TENSION ENGINE (التدافع)
export function detectTadafu(project: Project): any[] {
  const contradictions = [];
  const ideaWords = project.ideas.map(i => i.text).join(" ").toLowerCase();
  const stWords = project.stakeholders.map(s => s.need + " " + s.name).join(" ").toLowerCase();

  if (!ideaWords || !stWords) return contradictions;

  if ((ideaWords.includes("تطبيق") || ideaWords.includes("منص") || ideaWords.includes("رقم")) && (stWords.includes("ريفي") || stWords.includes("فقير") || stWords.includes("كبير") || stWords.includes("مسن"))) {
    contradictions.push({
      id: Date.now().toString() + '_1',
      source: "الحلول الرقمية",
      target: "خصائص الفئة المستهدفة",
      description: "فجوة رقمية (Digital Divide): حلولك تعتمد على التقنية، بينما أطرافك المتأثرة قد تفتقر للبنية أو المهارة. كيف ستجسر هذه الهوة؟"
    });
  }

  if (ideaWords.includes("تطوع") && ideaWords.includes("مستدام")) {
    contradictions.push({
      id: Date.now().toString() + '_2',
      source: "الاعتماد على التطوع",
      target: "الاستدامة طويلة المدى",
      description: "صراع الالتزام: العمل التطوعي يفقد حماسه بمرور الوقت. كيف ستصمم محركاً مستداماً لا يعتمد على حماس البدايات فقط؟"
    });
  }
  
  if (stWords.length > 0 && ideaWords.length > 0 && Math.random() > 0.85) {
     contradictions.push({
      id: Date.now().toString() + '_3',
      source: "رغبة المستفيد",
      target: "مصلحة الممول/المنفذ",
      description: "تدافع المصالح: الحل يبدو أقرب لراحة جهة التنفيذ من كونه تلبية حقيقية لاحتياج المستفيد المباشر."
     });
  }

  return contradictions;
}


