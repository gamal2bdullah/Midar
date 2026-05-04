import { describe, it, expect } from 'vitest';
import { extractKeywords, evaluateProblemStatement, scoreIdea, classifyContrast } from './ai-engine';

describe('Cognitive Engine - Arabic Text Processing', () => {
  it('should correctly strip stop words and stem Arabic text', () => {
    const text = "منصة ذكية لمساعدة الشباب في البحث عن عمل في يوم ما";
    const keywords = extractKeywords(text);
    
    // Check stop words are removed: "في", "عن"
    expect(keywords).not.toContain("في");
    expect(keywords).not.toContain("عن");
    
    // Check stemming (ال removed from الشباب -> شباب)
    expect(keywords).toContain("شباب");
  });

  describe('evaluateProblemStatement', () => {
    it('should penalize very short or empty problem statements', () => {
      const problem = evaluateProblemStatement("لا توجد مياه");
      expect(problem.score).toBeLessThan(40);
      expect(problem.gaps).toContain("النص قصير جداً لوصف مشكلة حقيقية.");
      expect(problem.missingElements).toContain("سياق المشكلة");
    });

    it('should reward well structured problems mentioning empathy and impact', () => {
      const problem = evaluateProblemStatement("يعاني الكثير من الأطباء من تأخر الدفعات المالية مما يؤدي إلى ضغط نفسي كبير وتقليل في كفاءة الرعاية الطبية في المستشفيات الحكومية.");
      // Expect high empathy (أطباء, نفسي) and impact (كفاءة, رعاية)
      expect(problem.score).toBeGreaterThan(50);
      
      // Should flag vague words like "الكثير"
      expect(problem.gaps.some(g => g.includes("الكثير"))).toBe(true);
    });
  });

  describe('scoreIdea', () => {
    it('should reward high innovation and feasibility', () => {
      const idea = scoreIdea("تطبيق ذكي يعتمد الذكاء الاصطناعي لخفض تكلفة التشغيل بنسبة 50٪");
      expect(idea.score).toBeGreaterThan(5);
    });
  });

  describe('classifyContrast', () => {
    it('should identify financial constraints', () => {
      const classification = classifyContrast("هذا الحل غالي جداً ويحتاج ميزانية ضخمة");
      expect(classification).toBe("عائق مالي");
    });
  });
});
