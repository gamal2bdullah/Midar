import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncEngine } from './syncEngine';
import localforage from 'localforage';
import { Project } from '../../hooks/useStorage';

vi.mock('localforage');

describe('SyncEngine', () => {
  const dummyProject: Project = {
    id: 'proj_test',
    name: 'Test Project',
    createdAt: 123,
    updatedAt: 123,
    version: 1,
    stakeholders: [],
    problem: { text: 'Test', score: 50, feedback: '', gaps: [] },
    ideas: [],
    contrastReviews: [],
    assumptions: [],
    contradictions: [],
    history: [],
    evidence: [],
    comments: [],
    overallScore: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('syncProject should save to localforage', async () => {
    vi.spyOn(localforage, 'setItem').mockResolvedValue(dummyProject as never);
    
    await SyncEngine.syncProject(dummyProject);
    expect(localforage.setItem).toHaveBeenCalledWith(dummyProject.id, dummyProject);
  });
});
