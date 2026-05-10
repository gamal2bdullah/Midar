export interface Assumption { id: string; sourceContext: string; text: string; status: 'fact' | 'guess' | 'unknown' | 'pending'; }
export interface Contradiction { id: string; source: string; target: string; description: string; isResolved: boolean; resolution?: string; }
export interface Stakeholder { id: string; name: string; need: string; influenceLevel?: 'high' | 'medium' | 'low'; interestLevel?: 'high' | 'medium' | 'low'; voiceReactions?: Record<string, string>; }
export interface Idea { id: string; text: string; score: number; why: string; pressureTest?: string; versionId?: string; linkedEvidenceIds?: string[]; }
export interface ContrastReview { id: string; critique: string; countermeasure: string; }
export interface Problem { text: string; score: number; feedback: string; gaps: string[]; impactScore?: number; feasibilityScore?: number; sustainabilityScore?: number; clarityScore?: number; missingElements?: string[]; nextAction?: string; smartChips?: string[]; whys?: string[]; socraticQuestion?: string; isSocraticAnswered?: boolean; socraticAnswer?: string; }
export interface ProjectEvent { action: string; timestamp: number; }
export interface Evidence { id: string; type: 'data' | 'quote' | 'observation' | 'research'; content: string; source: string; confidence: number; aiAnalysis?: string; }
export interface Comment { id: string; author: string; text: string; timestamp: number; status?: 'pending' | 'resolved'; }
export interface Decision { id: string; title: string; rationale: string; status: 'pending' | 'approved' | 'rejected'; timestamp: number; criticism?: string; linkedEvidenceIds?: string[]; alternatives?: string[]; risks?: string[]; expectedOutcomes?: string[]; }
export interface Experiment { id: string; name: string; hypothesis: string; metric: string; status: 'planned' | 'running' | 'completed' | 'failed'; result?: string; criticism?: string; linkedEvidenceIds?: string[]; }

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
  members: string[];
  stakeholders: Stakeholder[];
  problem: Problem;
  ideas: Idea[];
  contrastReviews: ContrastReview[];
  assumptions: Assumption[];
  contradictions: Contradiction[];
  history: ProjectEvent[];
  evidence: Evidence[];     
  comments: Comment[];      
  decisions?: Decision[];
  experiments?: Experiment[];
  overallScore: number;
  version: number;          
}