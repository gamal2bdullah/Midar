import localforage from 'localforage';
import { Project } from '../../hooks/useStorage';

// Sync Engine scaffold for future cloud sync readiness (Firestore / Supabase)
// Preserves local-first behavior

export class SyncEngine {
  static async pushToCloud(project: Project): Promise<boolean> {
    // Scaffold: Check auth token, push to remote DB
    console.log(`[SyncEngine] Mock pushing project to cloud: ${project.id}. Version: ${project.version}`);
    // Await fake network request
    await new Promise(r => setTimeout(r, 500));
    return true;
  }

  static async pullFromCloud(projectId: string): Promise<Project | null> {
    // Scaffold: Fetch from remote DB, compare versions
    console.log(`[SyncEngine] Mock pulling project from cloud: ${projectId}`);
    return null; // For now, we rely always on local for the actual return
  }

  static async syncProject(project: Project): Promise<void> {
    // Local save is always primary
    await localforage.setItem(project.id, project);

    // Attempt cloud push in background (fire-and-forget for local-first UX)
    if (navigator.onLine) {
      this.pushToCloud(project).catch(err => {
        console.error(`[SyncEngine] Failed to push project ${project.id}`, err);
        // Could mark project as 'dirty' or 'pendingUpload' here
      });
    }
  }
}
