import { useState, useEffect } from 'react';
import localforage from 'localforage';

export interface Stakeholder {
  id: string;
  name: string;
  need: string;
}

export interface Idea {
  id: string;
  text: string;
  score: number;
  why: string;
}

export interface ContrastReview {
  id: string;
  critique: string;
  countermeasure: string;
}

export interface Problem {
  text: string;
  score: number;
  feedback: string;
  gaps: string[];
  impactScore?: number;
  feasibilityScore?: number;
  sustainabilityScore?: number;
  clarityScore?: number;
  missingElements?: string[];
  nextAction?: string;
  smartChips?: string[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  stakeholders: Stakeholder[];
  problem: Problem;
  ideas: Idea[];
  contrastReviews: ContrastReview[];
  overallScore: number;
}

localforage.config({
  name: 'midar_offline_db',
  storeName: 'projects_v2',
  description: 'Midar Local Offline Intelligence Database'
});

const DEFAULT_PROJECT: Project = {
  id: 'proj_sample_noseer',
  name: 'مبادرة نصير للتوزيع العادل للمياه',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  stakeholders: [
    { id: 's1', name: 'المجتمعات الريفية', need: 'وصول مستدام وآمن للمياه النظيفة' },
    { id: 's2', name: 'الشباب الفاعل', need: 'دور تنظيمي ومجتمعي ذو أثر مباشر' }
  ],
  problem: {
    text: 'صعوبة وصول المجتمعات المحلية للمياه النظيفة بسبب غياب البنية التحتية وضعف التخطيط.',
    score: 85.5,
    feedback: 'صياغة ممتازة ومباشرة تعكس ألماً حقيقياً. واضحة المسببات والتأثير.',
    gaps: []
  },
  ideas: [
    { id: 'i1', text: 'بناء نظام تنقية مياه شمسي محلي يعتمد على موارد طبيعية', score: 8.5, why: 'يظهر ابتكاراً تقنياً واستدامة عالية (كلمة: شمسي، موارد طبيعية).' },
    { id: 'i2', text: 'تطبيق ذكي لإدارة الجداول ومواعيد الضخ للمنازل', score: 7.2, why: 'يُحسّن إدارة الموارد لكنه قد يواجه تحديات تقنية في المجتمعات المغلقة.' }
  ],
  contrastReviews: [
    { id: 'c1', critique: 'تكلفة النظام الشمسي عالية جداً ومكلفة للمجتمعات الريفية التي قد تخربه.', countermeasure: 'الاعتماد على تمويل جماعي ومواد محلية الصنع مع تدريب فنيين من نفس القرى للحماية والصيانة.' }
  ],
  overallScore: 85.5
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDB();
  }, []);

  async function initDB() {
    try {
      const keys = await localforage.keys();
      const loaded: Project[] = [];
      
      if (keys.length === 0) {
        // Seed default dataset if database is completely empty
        await localforage.setItem(DEFAULT_PROJECT.id, DEFAULT_PROJECT);
        loaded.push(DEFAULT_PROJECT);
      } else {
        for (const key of keys) {
          if (key.startsWith('proj_')) {
            const p = await localforage.getItem<Project>(key);
            if (p) loaded.push(p);
          }
        }
      }
      
      loaded.sort((a, b) => b.updatedAt - a.updatedAt);
      setProjects(loaded);
    } catch (e) {
      console.error("Error loading projects", e);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(name: string): Promise<string> {
    const newProj: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stakeholders: [],
      problem: { text: '', score: 0, feedback: '', gaps: [] },
      ideas: [],
      contrastReviews: [],
      overallScore: 0
    };
    await localforage.setItem(newProj.id, newProj);
    await initDB();
    return newProj.id;
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    const existing = await localforage.getItem<Project>(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: Date.now() };
      await localforage.setItem(id, updated);
      await initDB();
    }
  }

  async function deleteProject(id: string) {
    await localforage.removeItem(id);
    await initDB();
  }

  return { projects, loading, createProject, updateProject, deleteProject };
}

