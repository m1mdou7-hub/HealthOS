'use client';

// --- ENTERPRISE TYPES ---
export type UserRole =
  | 'Super Admin'
  | 'Clinic Owner'
  | 'Prosthodontist'
  | 'General Dentist'
  | 'Assistant'
  | 'Receptionist'
  | 'Laboratory Technician'
  | 'Read-only Auditor';

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  module: string;
  status: 'Success' | 'Warn' | 'Denied';
  ipAddress: string;
  previousValue?: string;
  newValue?: string;
}

export interface BackupArchive {
  id: string;
  timestamp: string;
  size: string;
  status: 'Completed' | 'InProgress' | 'Restored' | 'Corrupted';
  checksum: string;
  integrityChecked: boolean;
  type: 'Automatic' | 'Manual' | 'SLA Mirror';
}

export interface ClinicLocation {
  id: string;
  name: string;
  location: string;
  manager: string;
  doctors: number;
  patients: number;
  rooms: number;
  hours: string;
  timezone?: string;
  status: 'Active' | 'Maintenance' | 'Planned';
}

export interface SystemHealthStatus {
  database: 'Healthy' | 'Degraded' | 'Offline';
  apiGateway: 'Healthy' | 'High Latency' | 'Offline';
  storageCluster: 'Healthy' | 'Degraded' | 'Offline';
  aiInferenceNode: 'Healthy' | 'Rate Limited' | 'Offline';
  exocadServerNode: 'Healthy' | 'Syncing' | 'Offline';
  lastChecked: string;
  latencyMs: number;
}

// --- INITIAL ENTERPRISE DATASETS ---
const INITIAL_AUDITS: AuditRecord[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-07-20 10:14:22',
    actor: 'Dr. Elena Rostova',
    role: 'Clinic Owner',
    action: 'Approved high-translucency multi-layer zirconia prescription for Clara Oswald',
    module: 'Laboratory',
    status: 'Success',
    ipAddress: '108.43.190.22'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-07-20 09:48:11',
    actor: 'Dr. Michael Chen',
    role: 'Prosthodontist',
    action: 'Modified surgery scheduler slot parameters (Monday mornings)',
    module: 'Appointments',
    status: 'Success',
    ipAddress: '194.22.88.99'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-07-20 08:32:05',
    actor: 'Barton Miller',
    role: 'Laboratory Technician',
    action: 'Re-calibrated Digital Milling Machine STL offset by +0.02mm',
    module: 'Laboratory',
    status: 'Success',
    ipAddress: '92.12.44.11'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-07-20 07:12:00',
    actor: 'Anonymous Node',
    role: 'Read-only Auditor',
    action: 'Attempted write operation on patient medical records',
    module: 'Patient Records',
    status: 'Denied',
    ipAddress: '185.12.44.92'
  }
];

const INITIAL_CLINICS: ClinicLocation[] = [
  {
    id: 'CLI-01',
    name: 'HealthOS Main Campus',
    location: '742 Evergreen Terrace, Springfield',
    manager: 'Dr. Elena Rostova',
    doctors: 12,
    patients: 1420,
    rooms: 8,
    hours: '08:00 - 20:00',
    timezone: 'America/Los_Angeles',
    status: 'Active'
  },
  {
    id: 'CLI-02',
    name: 'North Ward Urgent Care',
    location: '101 Pine Avenue, Metro City',
    manager: 'Dr. Michael Chen',
    doctors: 6,
    patients: 850,
    rooms: 4,
    hours: '24/7 Operations',
    timezone: 'America/New_York',
    status: 'Active'
  },
  {
    id: 'CLI-03',
    name: 'Westside Implant Specialists',
    location: '422 Maple Street, Riverdale',
    manager: 'Dr. Sarah Jenkins',
    doctors: 4,
    patients: 512,
    rooms: 3,
    hours: '09:00 - 17:00',
    timezone: 'America/Los_Angeles',
    status: 'Active'
  }
];

const INITIAL_BACKUPS: BackupArchive[] = [
  {
    id: 'BKP-20260720-01',
    timestamp: '2026-07-20 06:00:00',
    size: '1.42 GB',
    status: 'Completed',
    checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    integrityChecked: true,
    type: 'Automatic'
  },
  {
    id: 'BKP-20260719-01',
    timestamp: '2026-07-19 06:00:00',
    size: '1.41 GB',
    status: 'Completed',
    checksum: 'sha256:f81b1513be244d2d634dbbf8ea75c977f6b4dcf3e48109bf4c8332db85517a2',
    integrityChecked: true,
    type: 'Automatic'
  },
  {
    id: 'BKP-20260718-01',
    timestamp: '2026-07-18 14:32:10',
    size: '1.39 GB',
    status: 'Restored',
    checksum: 'sha256:9118a101ff2a44bdccab12ff48203c9428ae41e4649b934ca495991b7852b85',
    integrityChecked: true,
    type: 'Manual'
  }
];

const INITIAL_HEALTH: SystemHealthStatus = {
  database: 'Healthy',
  apiGateway: 'Healthy',
  storageCluster: 'Healthy',
  aiInferenceNode: 'Healthy',
  exocadServerNode: 'Healthy',
  lastChecked: 'Just now',
  latencyMs: 14
};

// --- CLIENT STATE HELPERS ---
const IS_BROWSER = typeof window !== 'undefined';

export function getActiveRole(): UserRole {
  if (!IS_BROWSER) return 'Super Admin';
  const saved = localStorage.getItem('healthos_active_role');
  return (saved as UserRole) || 'Super Admin';
}

export function setActiveRole(role: UserRole) {
  if (!IS_BROWSER) return;
  localStorage.setItem('healthos_active_role', role);
  window.dispatchEvent(new CustomEvent('healthos_state_change', { detail: { type: 'role', value: role } }));
  
  // Log this role-swap action
  appendAuditLog(
    'Self impersonation',
    `Switched active workspace session privilege scope to [${role}]`,
    'Auth',
    'Success'
  );
}

export function getAuditLogs(): AuditRecord[] {
  if (!IS_BROWSER) return INITIAL_AUDITS;
  const saved = localStorage.getItem('healthos_audit_logs');
  if (!saved) {
    localStorage.setItem('healthos_audit_logs', JSON.stringify(INITIAL_AUDITS));
    return INITIAL_AUDITS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_AUDITS;
  }
}

export function appendAuditLog(
  actorName: string,
  actionText: string,
  moduleName: string,
  status: 'Success' | 'Warn' | 'Denied' = 'Success',
  previous?: string,
  next?: string
): AuditRecord {
  const currentRole = getActiveRole();
  const newLog: AuditRecord = {
    id: `AUD-${Math.floor(Math.random() * 900000) + 100000}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor: actorName || 'System Gateway',
    role: currentRole,
    action: actionText,
    module: moduleName,
    status,
    ipAddress: '192.168.1.14',
    previousValue: previous,
    newValue: next
  };

  if (!IS_BROWSER) return newLog;

  const currentLogs = getAuditLogs();
  const updated = [newLog, ...currentLogs];
  localStorage.setItem('healthos_audit_logs', JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('healthos_state_change', { detail: { type: 'audit', value: newLog } }));
  return newLog;
}

export function getClinics(): ClinicLocation[] {
  if (!IS_BROWSER) return INITIAL_CLINICS;
  const saved = localStorage.getItem('healthos_clinics');
  if (!saved) {
    localStorage.setItem('healthos_clinics', JSON.stringify(INITIAL_CLINICS));
    return INITIAL_CLINICS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_CLINICS;
  }
}

export function addClinicLocation(clinic: Omit<ClinicLocation, 'id' | 'doctors' | 'patients' | 'rooms'>): ClinicLocation {
  const newClinic: ClinicLocation = {
    ...clinic,
    id: `CLI-${Math.floor(Math.random() * 90) + 10}`,
    doctors: Math.floor(Math.random() * 6) + 2,
    patients: 0,
    rooms: Math.floor(Math.random() * 4) + 2
  };

  if (!IS_BROWSER) return newClinic;

  const list = getClinics();
  const updated = [...list, newClinic];
  localStorage.setItem('healthos_clinics', JSON.stringify(updated));
  
  appendAuditLog(
    'System Admin',
    `Provisioned new clinic tenant location: "${newClinic.name}" in timezone ${newClinic.timezone}`,
    'System Admin',
    'Success'
  );

  window.dispatchEvent(new CustomEvent('healthos_state_change', { detail: { type: 'clinics', value: newClinic } }));
  return newClinic;
}

export function getBackups(): BackupArchive[] {
  if (!IS_BROWSER) return INITIAL_BACKUPS;
  const saved = localStorage.getItem('healthos_backups');
  if (!saved) {
    localStorage.setItem('healthos_backups', JSON.stringify(INITIAL_BACKUPS));
    return INITIAL_BACKUPS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_BACKUPS;
  }
}

export function createManualBackup(): BackupArchive {
  const randomHex = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  const newBkp: BackupArchive = {
    id: `BKP-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 90) + 10}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    size: `${(Math.random() * 0.1 + 1.4).toFixed(2)} GB`,
    status: 'Completed',
    checksum: `sha256:${randomHex}••••••••••••••••`,
    integrityChecked: true,
    type: 'Manual'
  };

  if (!IS_BROWSER) return newBkp;

  const list = getBackups();
  const updated = [newBkp, ...list];
  localStorage.setItem('healthos_backups', JSON.stringify(updated));

  appendAuditLog(
    'System Admin',
    `Triggered manual database SLA backup archive snapshot: ${newBkp.id}`,
    'System Admin',
    'Success'
  );

  window.dispatchEvent(new CustomEvent('healthos_state_change', { detail: { type: 'backups', value: newBkp } }));
  return newBkp;
}

export function restoreBackup(id: string): boolean {
  if (!IS_BROWSER) return false;
  const list = getBackups();
  const updated = list.map(bkp => {
    if (bkp.id === id) {
      return { ...bkp, status: 'Restored' as const };
    }
    return bkp;
  });

  localStorage.setItem('healthos_backups', JSON.stringify(updated));
  
  appendAuditLog(
    'System Admin',
    `Restored database cluster state to historical archive: ${id}`,
    'System Admin',
    'Success'
  );

  window.dispatchEvent(new CustomEvent('healthos_state_change', { detail: { type: 'backups', value: id } }));
  return true;
}

export function getSystemHealth(): SystemHealthStatus {
  if (!IS_BROWSER) return INITIAL_HEALTH;
  const saved = localStorage.getItem('healthos_health');
  if (!saved) {
    localStorage.setItem('healthos_health', JSON.stringify(INITIAL_HEALTH));
    return INITIAL_HEALTH;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_HEALTH;
  }
}

export function runIntegrityScan(): SystemHealthStatus {
  const scanned: SystemHealthStatus = {
    database: Math.random() > 0.95 ? 'Degraded' : 'Healthy',
    apiGateway: 'Healthy',
    storageCluster: 'Healthy',
    aiInferenceNode: 'Healthy',
    exocadServerNode: 'Healthy',
    lastChecked: new Date().toLocaleTimeString(),
    latencyMs: Math.floor(Math.random() * 10) + 8
  };

  if (!IS_BROWSER) return scanned;

  localStorage.setItem('healthos_health', JSON.stringify(scanned));
  
  appendAuditLog(
    'System Diagnostic',
    `Completed full cryptographic database checksum scan. Latency: ${scanned.latencyMs}ms. Status: ALL SECURE`,
    'System Admin',
    'Success'
  );

  window.dispatchEvent(new CustomEvent('healthos_state_change', { detail: { type: 'health', value: scanned } }));
  return scanned;
}

// --- RBAC CHECKER UTILS ---
export interface RBACPermission {
  allowed: boolean;
  reason?: string;
}

export function checkPageAccess(pathname: string, role: UserRole): RBACPermission {
  const normPath = pathname.toLowerCase();

  // Super Admin & Clinic Owner can do EVERYTHING
  if (role === 'Super Admin' || role === 'Clinic Owner') {
    return { allowed: true };
  }

  // General check rules per role
  if (role === 'Read-only Auditor') {
    // Auditors are forbidden from Developer settings, Platform, and Billing/Stripe
    if (normPath.startsWith('/platform') || normPath.startsWith('/developer') || normPath.startsWith('/billing') || normPath.startsWith('/ai-assistant')) {
      return { allowed: false, reason: 'Read-only Auditor accounts are restricted to HIPAA regulatory audit logs, clinics directory, and read-only views.' };
    }
    return { allowed: true };
  }

  if (role === 'Laboratory Technician') {
    // Technicians only allowed on: Lab, Imaging, Comm, Docs, Tasks, Notifications
    const allowedPrefixes = ['/laboratory', '/imaging', '/communication', '/documents', '/tasks', '/notifications', '/help'];
    const isAllowed = normPath === '/' || allowedPrefixes.some(p => normPath.startsWith(p));
    if (!isAllowed) {
      return { allowed: false, reason: 'Your current role [Laboratory Technician] is restricted to Digital Lab CAD/CAM Workspaces, dental imaging, and operations dispatch workflows.' };
    }
    return { allowed: true };
  }

  if (role === 'Assistant') {
    // Assistants restricted from: Clinics, Analytics, Billing, Platform, Developer, Settings, Audit
    const restrictedPrefixes = ['/clinics', '/analytics', '/billing', '/platform', '/developer', '/settings', '/audit'];
    const isRestricted = restrictedPrefixes.some(p => normPath.startsWith(p));
    if (isRestricted) {
      return { allowed: false, reason: 'Your [Assistant] seat license does not possess administrator clearances required to configure core clinical departments or compliance logs.' };
    }
    return { allowed: true };
  }

  if (role === 'Receptionist') {
    // Receptionists allowed on: Dashboard, Patients, Appointments, Comm, Docs, Tasks, Notifications
    const allowedPrefixes = ['/', '/patients', '/appointments', '/communication', '/documents', '/tasks', '/notifications', '/help'];
    const isAllowed = allowedPrefixes.some(p => normPath === p || (p !== '/' && normPath.startsWith(p)));
    if (!isAllowed) {
      return { allowed: false, reason: 'Your [Receptionist] role is focused on patient intake scheduling and dispatch. Clinical procedures and developer API logs are restricted.' };
    }
    return { allowed: true };
  }

  if (role === 'Prosthodontist' || role === 'General Dentist') {
    // Clinicians restricted from: Platform, Developer, Billing
    const restrictedPrefixes = ['/platform', '/developer', '/billing'];
    const isRestricted = restrictedPrefixes.some(p => normPath.startsWith(p));
    if (isRestricted) {
      return { allowed: false, reason: 'Clinicians do not have access to platform cluster provisioning or stripe billing credentials.' };
    }
    return { allowed: true };
  }

  return { allowed: true };
}
