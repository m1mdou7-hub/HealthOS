/**
 * Sync Service
 * Handles synchronization between local database and remote server
 */

import { offlineDb } from './offline-db';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

class SyncService {
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Start automatic sync when online
   */
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) return;
    if (typeof window === 'undefined') return;

    // Listen for online/offline events
    window.addEventListener('online', () => this.sync());
    window.addEventListener('offline', () => this.stopAutoSync());

    // Start interval sync
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, intervalMs);

    console.log('Auto-sync started');
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('Auto-sync stopped');
  }

  /**
   * Sync pending changes to server
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, synced: 0, failed: 0, errors: ['No internet connection'] };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };

    try {
      const queue = await offlineDb.getSyncQueue();
      console.log(`Syncing ${queue.length} pending changes...`);

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await offlineDb.markAsSynced(item.table, item.recordId);
          result.synced++;
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Failed to sync ${item.table}:${item.recordId} - ${error.message}`);
        }
      }

      if (result.failed === 0) {
        await offlineDb.clearSyncQueue();
      }

      console.log(`Sync complete: ${result.synced} synced, ${result.failed} failed`);
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Sync a single item to server
   */
  private async syncItem(item: any): Promise<void> {
    const { table, recordId, action, data } = item;
    const serverUrl = this.getServerUrl();
    
    if (!serverUrl) {
      throw new Error('Server URL not configured');
    }
    
    const response = await fetch(`${serverUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, action, id: recordId, data })
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  }

  /**
   * Download latest data from server
   */
  async pullFromServer(): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('Cannot pull: offline');
      return;
    }

    const serverUrl = this.getServerUrl();
    if (!serverUrl) return;

    try {
      // Pull patients
      const patientsResponse = await fetch(`${serverUrl}/api/sync/patients`);
      if (patientsResponse.ok) {
        const patients = await patientsResponse.json();
        for (const patient of patients) {
          await offlineDb.savePatient(patient);
        }
      }

      // Pull appointments
      const appointmentsResponse = await fetch(`${serverUrl}/api/sync/appointments`);
      if (appointmentsResponse.ok) {
        const appointments = await appointmentsResponse.json();
        for (const appointment of appointments) {
          await offlineDb.saveAppointment(appointment);
        }
      }

      console.log('Pull from server complete');
    } catch (error) {
      console.error('Pull from server failed:', error);
    }
  }

  /**
   * Get server URL from local storage
   */
  private getServerUrl(): string {
    if (typeof localStorage === 'undefined') return '';
    return localStorage.getItem('server_url') || '';
  }

  /**
   * Set server URL
   */
  setServerUrl(url: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('server_url', url);
    }
  }

  /**
   * Get current sync status
   */
  async getStatus() {
    return await offlineDb.getSyncStatus();
  }
}

export const syncService = new SyncService();
export default syncService;
