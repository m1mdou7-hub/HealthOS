/**
 * Offline Database Manager
 * Handles local storage for offline-first functionality
 * Uses localStorage as storage - works on web, PWA, and mobile apps
 */

export interface SyncStatus {
  lastSync: Date | null;
  pendingChanges: number;
  isOnline: boolean;
}

interface OfflineData {
  patients: any[];
  appointments: any[];
  syncQueue: any[];
  lastSync: string | null;
}

class OfflineDatabase {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing offline database...');
    
    // Always use localStorage for simplicity
    // This works on web, PWA, and Capacitor apps
    this.initLocalStorage();
    
    this.isInitialized = true;
    console.log('Offline database initialized successfully');
  }

  private initLocalStorage(): void {
    if (!localStorage.getItem('healthos_offline')) {
      const initialData: OfflineData = {
        patients: [],
        appointments: [],
        syncQueue: [],
        lastSync: null
      };
      localStorage.setItem('healthos_offline', JSON.stringify(initialData));
    }
  }

  private getOfflineData(): OfflineData {
    const data = localStorage.getItem('healthos_offline');
    return data ? JSON.parse(data) : { patients: [], appointments: [], syncQueue: [], lastSync: null };
  }

  private saveOfflineData(data: OfflineData): void {
    localStorage.setItem('healthos_offline', JSON.stringify(data));
  }

  // Patient Operations
  async savePatient(patient: any): Promise<void> {
    const data = {
      ...patient,
      synced: 0,
      updated_at: new Date().toISOString()
    };

    const offline = this.getOfflineData();
    const patients = offline.patients || [];
    const index = patients.findIndex((p: any) => p.id === data.id);
    
    if (index >= 0) {
      patients[index] = data;
    } else {
      patients.push(data);
    }
    
    offline.patients = patients;
    this.saveOfflineData(offline);

    // Add to sync queue
    await this.addToSyncQueue('patients', data.id, 'upsert', data);
  }

  async getPatients(): Promise<any[]> {
    const offline = this.getOfflineData();
    return offline.patients || [];
  }

  async deletePatient(patientId: string): Promise<void> {
    const offline = this.getOfflineData();
    offline.patients = offline.patients.filter((p: any) => p.id !== patientId);
    this.saveOfflineData(offline);
    
    await this.addToSyncQueue('patients', patientId, 'delete', { id: patientId });
  }

  // Appointment Operations
  async saveAppointment(appointment: any): Promise<void> {
    const data = {
      ...appointment,
      synced: 0,
      updated_at: new Date().toISOString()
    };

    const offline = this.getOfflineData();
    const appointments = offline.appointments || [];
    const index = appointments.findIndex((a: any) => a.id === data.id);
    
    if (index >= 0) {
      appointments[index] = data;
    } else {
      appointments.push(data);
    }
    
    offline.appointments = appointments;
    this.saveOfflineData(offline);

    await this.addToSyncQueue('appointments', data.id, 'upsert', data);
  }

  async getAppointments(): Promise<any[]> {
    const offline = this.getOfflineData();
    return offline.appointments || [];
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    const offline = this.getOfflineData();
    offline.appointments = offline.appointments.filter((a: any) => a.id !== appointmentId);
    this.saveOfflineData(offline);
    
    await this.addToSyncQueue('appointments', appointmentId, 'delete', { id: appointmentId });
  }

  // Sync Queue Operations
  private async addToSyncQueue(table: string, recordId: string, action: string, data: any): Promise<void> {
    const offline = this.getOfflineData();
    offline.syncQueue = offline.syncQueue || [];
    offline.syncQueue.push({ 
      table, 
      recordId, 
      action, 
      data, 
      created_at: new Date().toISOString() 
    });
    this.saveOfflineData(offline);
  }

  async getSyncQueue(): Promise<any[]> {
    const offline = this.getOfflineData();
    return offline.syncQueue || [];
  }

  async clearSyncQueue(): Promise<void> {
    const offline = this.getOfflineData();
    offline.syncQueue = [];
    this.saveOfflineData(offline);
  }

  // Sync Status
  async getSyncStatus(): Promise<SyncStatus> {
    const queue = await this.getSyncQueue();
    const offline = this.getOfflineData();
    return {
      lastSync: offline.lastSync ? new Date(offline.lastSync) : null,
      pendingChanges: queue.length,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    };
  }

  // Mark as synced
  async markAsSynced(table: string, recordId: string): Promise<void> {
    const offline = this.getOfflineData();
    
    if (table === 'patients') {
      const patients = offline.patients || [];
      const patient = patients.find((p: any) => p.id === recordId);
      if (patient) patient.synced = 1;
      offline.patients = patients;
    } else if (table === 'appointments') {
      const appointments = offline.appointments || [];
      const appointment = appointments.find((a: any) => a.id === recordId);
      if (appointment) appointment.synced = 1;
      offline.appointments = appointments;
    }
    
    // Remove from sync queue
    offline.syncQueue = offline.syncQueue.filter(
      (item: any) => !(item.table === table && item.recordId === recordId)
    );
    
    // Update last sync time
    offline.lastSync = new Date().toISOString();
    
    this.saveOfflineData(offline);
  }

  // Get unsynced items
  async getUnsyncedPatients(): Promise<any[]> {
    const offline = this.getOfflineData();
    return offline.patients.filter((p: any) => !p.synced);
  }

  async getUnsyncedAppointments(): Promise<any[]> {
    const offline = this.getOfflineData();
    return offline.appointments.filter((a: any) => !a.synced);
  }
}

export const offlineDb = new OfflineDatabase();
export default offlineDb;
