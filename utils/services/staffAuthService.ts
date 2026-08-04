'use client';

export type StaffRole = 'admin' | 'clinician' | 'receptionist' | 'lab_tech' | 'auditor';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  roleTitle: string;
  clinicName: string;
  status: 'Active' | 'Pending' | 'Suspended';
  createdAt: string;
}

export interface StaffSession {
  user: StaffMember;
  token: string;
  loggedAt: string;
}

const STORAGE_STAFF_MEMBERS_KEY = 'healthos_staff_members_db';
const STORAGE_STAFF_SESSION_KEY = 'healthos_staff_current_session';

const DEFAULT_STAFF_MEMBERS: (StaffMember & { passwordHash: string })[] = [
  {
    id: 'staff-001',
    name: 'د. أحمد القحطاني',
    email: 'admin@healthos.io',
    passwordHash: 'admin123',
    role: 'admin',
    roleTitle: 'مدير المنظمة / مالك العيادة',
    clinicName: 'مجمع هيلث أو إس التخصصي',
    status: 'Active',
    createdAt: '2026-01-01'
  },
  {
    id: 'staff-002',
    name: 'د. سارة العتيبي',
    email: 'doctor@healthos.io',
    passwordHash: 'doctor123',
    role: 'clinician',
    roleTitle: 'استشاري جراحة وزراعة الأسنان',
    clinicName: 'مجمع هيلث أو إس التخصصي',
    status: 'Active',
    createdAt: '2026-02-15'
  },
  {
    id: 'staff-003',
    name: 'أمل الغامدي',
    email: 'reception@healthos.io',
    passwordHash: 'reception123',
    role: 'receptionist',
    roleTitle: 'مسؤولة الاستقبال والزيارات',
    clinicName: 'مجمع هيلث أو إس التخصصي',
    status: 'Active',
    createdAt: '2026-03-10'
  },
  {
    id: 'staff-004',
    name: 'م. فهد الدوسري',
    email: 'lab@healthos.io',
    passwordHash: 'lab123',
    role: 'lab_tech',
    roleTitle: 'مدير المختبر الرقمي CAD/CAM',
    clinicName: 'مجمع هيلث أو إس التخصصي',
    status: 'Active',
    createdAt: '2026-04-05'
  }
];

export const staffAuthService = {
  // Initialize storage if empty
  initStorage(): (StaffMember & { passwordHash: string })[] {
    if (typeof window === 'undefined') return DEFAULT_STAFF_MEMBERS;
    const saved = localStorage.getItem(STORAGE_STAFF_MEMBERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    localStorage.setItem(STORAGE_STAFF_MEMBERS_KEY, JSON.stringify(DEFAULT_STAFF_MEMBERS));
    return DEFAULT_STAFF_MEMBERS;
  },

  // Get active session
  getCurrentSession(): StaffSession | null {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(STORAGE_STAFF_SESSION_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  // Login staff with email and password
  loginStaff(email: string, passwordHash: string): { success: boolean; session?: StaffSession; message?: string } {
    const list = this.initStorage();
    const cleanEmail = email.trim().toLowerCase();
    const found = list.find(m => m.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, message: 'البريد الإلكتروني غير مسجل في النظام.' };
    }

    if (found.status === 'Suspended') {
      return { success: false, message: 'هذا الحساب موقوف حالياً. يرجى مراجعة إدارة العيادة.' };
    }

    if (found.passwordHash !== passwordHash) {
      return { success: false, message: 'كلمة المرور غير صحيحة.' };
    }

    const session: StaffSession = {
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        roleTitle: found.roleTitle,
        clinicName: found.clinicName,
        status: found.status,
        createdAt: found.createdAt
      },
      token: `token_${found.id}_${Date.now()}`,
      loggedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_STAFF_SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
  },

  // Logout staff
  logoutStaff(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_STAFF_SESSION_KEY);
    }
  },

  // List all staff members
  getStaffMembers(): StaffMember[] {
    const list = this.initStorage();
    return list.map(({ passwordHash: _, ...rest }) => rest);
  },

  // Add new staff invite
  inviteStaffMember(member: { name: string; email: string; role: StaffRole; roleTitle?: string; passwordHash: string }): StaffMember {
    const list = this.initStorage();
    const cleanEmail = member.email.trim().toLowerCase();
    
    // Check duplicate
    const existing = list.find(m => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('البريد الإلكتروني مسجل مسبقاً لموظف آخر.');
    }

    const roleTitles: Record<StaffRole, string> = {
      admin: 'مدير النظام والعيادة',
      clinician: 'طبيب معالج / أخصائي أسنان',
      receptionist: 'مسؤول الاستقبال والحجوزات',
      lab_tech: 'فني مختبر CAD/CAM',
      auditor: 'مراجعة وتقارير الأمان'
    };

    const newMember: StaffMember & { passwordHash: string } = {
      id: `staff_${Math.floor(100000 + Math.random() * 900000)}`,
      name: member.name,
      email: cleanEmail,
      passwordHash: member.passwordHash || 'healthos2026',
      role: member.role,
      roleTitle: member.roleTitle || roleTitles[member.role] || 'عضو كادر طبّي',
      clinicName: 'مجمع هيلث أو إس التخصصي',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newMember, ...list];
    localStorage.setItem(STORAGE_STAFF_MEMBERS_KEY, JSON.stringify(updated));
    const { passwordHash: _, ...result } = newMember;
    return result;
  },

  // Remove / suspend staff member
  updateStaffStatus(id: string, status: 'Active' | 'Suspended'): void {
    const list = this.initStorage();
    const updated = list.map(m => m.id === id ? { ...m, status } : m);
    localStorage.setItem(STORAGE_STAFF_MEMBERS_KEY, JSON.stringify(updated));
  }
};
