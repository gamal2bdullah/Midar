import { useState, useEffect } from 'react';
import { collection, doc, query, where, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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

enum OperationType { CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write' }
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
      if (!user) {
        setProjects([]);
        setLoading(false);
      }
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    
    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Project[] = [];
      snapshot.forEach(docSnap => {
        const p = docSnap.data() as Project;
        // ensure default fields
        if (!p.assumptions) p.assumptions = [];
        if (!p.contradictions) p.contradictions = [];
        if (!p.history) p.history = [];
        if (!p.problem.whys) p.problem.whys = [];
        if (!p.evidence) p.evidence = [];
        if (!p.comments) p.comments = [];
        if (!p.decisions) p.decisions = [];
        if (!p.experiments) p.experiments = [];
        if (!p.version) p.version = 1;
        loaded.push(p);
      });
      loaded.sort((a, b) => b.updatedAt - a.updatedAt);
      setProjects(loaded);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  async function createProject(name: string): Promise<string> {
    if (!uid) throw new Error("Unauthenticated");
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newProj: Project = {
      id,
      name,
      ownerId: uid,
      members: [uid],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      stakeholders: [],
      problem: { text: '', score: 0, feedback: '', gaps: [], whys: [] },
      ideas: [],
      contrastReviews: [],
      assumptions: [],
      contradictions: [],
      evidence: [],
      comments: [],
      decisions: [],
      experiments: [],
      history: [{ action: 'ProjectCreated', timestamp: Date.now() }],
      overallScore: 0
    };
    try {
      await setDoc(doc(db, 'projects', id), newProj);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `projects/${id}`);
      throw e;
    }
    return newProj.id;
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    if (!uid) return;
    const existing = projects.find(p => p.id === id);
    if (!existing) return;

    const actionNames = Object.keys(updates)
      .filter(k => k !== 'updatedAt' && k !== 'version')
      .map(k => `Updated_${k}`)
      .join(',');

    const history = [...(existing.history || [])];
    if (actionNames) {
      history.push({ action: actionNames, timestamp: Date.now() });
    }

    try {
      await updateDoc(doc(db, 'projects', id), {
        ...updates,
        updatedAt: Date.now(),
        version: (existing.version || 1) + 1,
        history
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `projects/${id}`);
    }
  }

  async function deleteProject(id: string) {
    if (!uid) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `projects/${id}`);
    }
  }

  return { projects, loading, createProject, updateProject, deleteProject };
}
