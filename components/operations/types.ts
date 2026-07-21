'use client';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  medicalAlerts: string[];
  currentTreatment: string;
  historyScore: number; // For AI predicted attendance
  priorityType: 'Walk-in' | 'Emergency' | 'VIP' | 'Routine';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  color: string;
  workingHours: { start: string; end: string };
  status: 'Active' | 'Break' | 'On Leave' | 'Vacation';
  breaks: { start: string; end: string }[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  procedure: string;
  chair: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: number; // in minutes
  status: 'Confirmed' | 'Pending' | 'In-Progress' | 'Completed' | 'Cancelled';
  category: 'Consultation' | 'Treatment' | 'Surgery' | 'Lab' | 'Recall';
  isRecurring?: boolean;
}

export interface ChairStatus {
  id: string;
  name: string;
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
  currentPatient?: string;
  currentDoctor?: string;
  remainingTime?: number; // in minutes
  estimatedCompletion?: string;
}

export interface QueueItem {
  id: string;
  patientName: string;
  type: 'Walk-in' | 'Emergency' | 'VIP' | 'Scheduled';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  arrivalTime: string;
  waitTime: number; // in minutes
  assignedDoctorId?: string;
}

export interface RecallItem {
  id: string;
  patientName: string;
  phone: string;
  type: 'Routine Hygiene' | 'Implant Follow-up' | 'Crown Check' | 'Suture Removal' | 'Periodontal Recall';
  dueDate: string; // YYYY-MM-DD
  status: 'Today' | 'Overdue' | 'Upcoming' | 'Completed' | 'Missing';
  lastContacted?: string;
}

export interface OperationalNotification {
  id: string;
  title: string;
  desc: string;
  category: 'Appointments' | 'Lab' | 'AI' | 'Medical Alerts' | 'Recalls' | 'Treatment Reminders';
  priority: 'Low' | 'Medium' | 'High';
  time: string;
  unread: boolean;
}

export interface TreatmentSession {
  id: string;
  patientId: string;
  patientName: string;
  procedure: string;
  chair: string;
  doctorId: string;
  doctorName: string;
  assistantName: string;
  duration: number; // in minutes
  materials: string[];
  clinicalNotes: string;
  outcome: string;
  timestamp: string;
}

// === PRE-SEEDED EHR RECORDS & METADATA ===
export const MOCK_PATIENTS: Patient[] = [
  { id: 'P-101', name: 'Arthur Pendragon', phone: '(555) 123-8945', email: 'arthur.p@camelot.org', dob: '1978-05-15', medicalAlerts: ['Penicillin Allergy', 'Hypertension'], currentTreatment: 'Implant Placement #14', historyScore: 92, priorityType: 'VIP' },
  { id: 'P-102', name: 'Clara Oswald', phone: '(555) 345-1200', email: 'clara.oswald@tardis.com', dob: '1989-11-23', medicalAlerts: ['Latex Allergy'], currentTreatment: 'Ceramic Veneers #5-#12', historyScore: 96, priorityType: 'Routine' },
  { id: 'P-103', name: 'Bruce Wayne', phone: '(555) 901-7643', email: 'bwayne@gotham.co', dob: '1972-02-17', medicalAlerts: ['Bruxism (Severe)'], currentTreatment: 'Full Mouth Reconstruction', historyScore: 78, priorityType: 'VIP' },
  { id: 'P-104', name: 'Logan Howlett', phone: '(555) 441-9876', email: 'wolverine@xmen.edu', dob: '1905-08-04', medicalAlerts: ['Uncontrolled metal implants', 'Rapid healing rate'], currentTreatment: 'Implant Maintenance', historyScore: 65, priorityType: 'Emergency' },
  { id: 'P-105', name: 'Diana Prince', phone: '(555) 762-1100', email: 'diana@themyscira.gov', dob: '1984-03-25', medicalAlerts: [], currentTreatment: 'Digital Smile Design', historyScore: 99, priorityType: 'Routine' },
  { id: 'P-106', name: 'Barry Allen', phone: '(555) 282-1980', email: 'speedy@centralcity.gov', dob: '1992-09-12', medicalAlerts: ['High metabolic anesthetic clearance'], currentTreatment: 'Emergency crown repair', historyScore: 85, priorityType: 'Walk-in' }
];

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'D-1', name: 'Dr. Elena Rostova', specialty: 'Prosthodontist', color: 'emerald', workingHours: { start: '08:00', end: '17:00' }, status: 'Active', breaks: [{ start: '12:00', end: '13:00' }] },
  { id: 'D-2', name: 'Dr. Michael Chen', specialty: 'Implantologist', color: 'purple', workingHours: { start: '09:00', end: '18:00' }, status: 'Active', breaks: [{ start: '13:00', end: '14:00' }] },
  { id: 'D-3', name: 'Dr. Sarah Jenkins', specialty: 'Cosmetic Dentist', color: 'blue', workingHours: { start: '08:00', end: '17:00' }, status: 'Break', breaks: [{ start: '12:00', end: '13:00' }] },
  { id: 'D-4', name: 'Dr. Marcus Vance', specialty: 'Lab Director & Prostho', color: 'orange', workingHours: { start: '08:00', end: '16:00' }, status: 'Active', breaks: [{ start: '12:30', end: '13:30' }] }
];

export const MOCK_CHAIRS_STATUS: ChairStatus[] = [
  { id: 'C-1', name: 'Chair 1 (Digital Suite)', status: 'Occupied', currentPatient: 'Arthur Pendragon', currentDoctor: 'Dr. Elena Rostova', remainingTime: 15, estimatedCompletion: '11:30 AM' },
  { id: 'C-2', name: 'Chair 2 (Restorative)', status: 'Available' },
  { id: 'C-3', name: 'Chair 3 (Fitting & Try-in)', status: 'Cleaning' },
  { id: 'C-4', name: 'Surgery Suite A', status: 'Maintenance', remainingTime: 120, estimatedCompletion: '01:30 PM' },
  { id: 'C-5', name: 'Consultation Room', status: 'Occupied', currentPatient: 'Diana Prince', currentDoctor: 'Dr. Sarah Jenkins', remainingTime: 40, estimatedCompletion: '11:55 AM' }
];

export const MOCK_TREATMENT_SESSIONS: TreatmentSession[] = [
  {
    id: 'SESS-1',
    patientId: 'P-101',
    patientName: 'Arthur Pendragon',
    procedure: 'Implant Placement #14',
    chair: 'Chair 1 (Digital Suite)',
    doctorId: 'D-1',
    doctorName: 'Dr. Elena Rostova',
    assistantName: 'Sarah Jenkins',
    duration: 60,
    materials: ['Straumann BLX Implant', 'Titanium Abutment', 'Bone Graft Matrix'],
    clinicalNotes: 'Successful surgical placement of #14 implant. Primary stability achieved at 45 Ncm.',
    outcome: 'Successful Placement',
    timestamp: '2026-07-20T09:00:00Z'
  },
  {
    id: 'SESS-2',
    patientId: 'P-102',
    patientName: 'Clara Oswald',
    procedure: 'Veneer Try-in #5-#12',
    chair: 'Chair 2 (Restorative)',
    doctorId: 'D-2',
    doctorName: 'Dr. Michael Chen',
    assistantName: 'David Tennant',
    duration: 45,
    materials: ['e.max CAD Veneers', 'RelyX Luting Cement', 'Silane Coupling Agent'],
    clinicalNotes: 'Veneers tried in with water-based try-in paste. Aesthetics approved by patient.',
    outcome: 'Aesthetics Approved',
    timestamp: '2026-07-20T10:30:00Z'
  }
];

export const MOCK_RECALLS: RecallItem[] = [
  { id: 'R-1', patientName: 'Arthur Pendragon', phone: '(555) 123-8945', type: 'Implant Follow-up', dueDate: '2026-07-20', status: 'Today' },
  { id: 'R-2', patientName: 'Clara Oswald', phone: '(555) 345-1200', type: 'Crown Check', dueDate: '2026-06-15', status: 'Overdue', lastContacted: '2026-06-20' },
  { id: 'R-3', patientName: 'Bruce Wayne', phone: '(555) 901-7643', type: 'Routine Hygiene', dueDate: '2026-08-10', status: 'Upcoming' },
  { id: 'R-4', patientName: 'Logan Howlett', phone: '(555) 441-9876', type: 'Periodontal Recall', dueDate: '2026-07-12', status: 'Completed', lastContacted: '2026-07-12' },
  { id: 'R-5', patientName: 'Barry Allen', phone: '(555) 282-1980', type: 'Suture Removal', dueDate: '2026-07-22', status: 'Upcoming' },
  { id: 'R-6', patientName: 'Selina Kyle', phone: '(555) 999-8888', type: 'Crown Check', dueDate: '2026-05-10', status: 'Missing' }
];

export const MOCK_QUEUE: QueueItem[] = [
  { id: 'Q-1', patientName: 'Logan Howlett', type: 'Emergency', urgency: 'Critical', arrivalTime: '10:15 AM', waitTime: 40, assignedDoctorId: 'D-2' },
  { id: 'Q-2', patientName: 'Bruce Wayne', type: 'VIP', urgency: 'High', arrivalTime: '10:30 AM', waitTime: 25, assignedDoctorId: 'D-1' },
  { id: 'Q-3', patientName: 'Barry Allen', type: 'Walk-in', urgency: 'Medium', arrivalTime: '10:45 AM', waitTime: 10, assignedDoctorId: 'D-3' }
];

export const MOCK_NOTIFICATIONS: OperationalNotification[] = [
  { id: 'N-1', title: 'Implant Placement Conflicted', desc: 'Conflict detected on Surgery Suite A for Dr. Michael Chen.', category: 'Appointments', priority: 'High', time: '5 mins ago', unread: true },
  { id: 'N-2', title: 'Milled Crown Complete', desc: 'Lab milled monolithic Zirconia #14 is sintered and ready for fit-check.', category: 'Lab', priority: 'Medium', time: '15 mins ago', unread: true },
  { id: 'N-3', title: 'Severe Bruxism Alert', desc: 'Patient Bruce Wayne exhibits nocturnal overload vectors. Splint is recommended.', category: 'AI', priority: 'High', time: '30 mins ago', unread: true },
  { id: 'N-4', title: 'Recall Overdue Outreach', desc: 'Recall notice dispatch needed for Clara Oswald (Overdue 35 days).', category: 'Recalls', priority: 'Medium', time: '1 hour ago', unread: false },
  { id: 'N-5', title: 'Penicillin Allergy Warning', desc: 'Arthur Pendragon medical record flags critical allergy history. Avoid Amoxicillin prophylaxis.', category: 'Medical Alerts', priority: 'High', time: '2 hours ago', unread: true }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'A-101', patientId: 'P-101', patientName: 'Arthur Pendragon', doctorId: 'D-1', doctorName: 'Dr. Elena Rostova', procedure: 'Implant Placement #14', chair: 'Chair 1 (Digital Suite)', date: '2026-07-20', startTime: '09:00', duration: 60, status: 'Completed', category: 'Surgery' },
  { id: 'A-102', patientId: 'P-102', patientName: 'Clara Oswald', doctorId: 'D-2', doctorName: 'Dr. Michael Chen', procedure: 'Veneer Try-in #5-#12', chair: 'Chair 2 (Restorative)', date: '2026-07-20', startTime: '10:30', duration: 45, status: 'In-Progress', category: 'Treatment' },
  { id: 'A-103', patientId: 'P-103', patientName: 'Bruce Wayne', doctorId: 'D-3', doctorName: 'Dr. Sarah Jenkins', procedure: 'Full Mouth Prep Phase 2', chair: 'Surgery Suite A', date: '2026-07-20', startTime: '11:00', duration: 120, status: 'Confirmed', category: 'Treatment' },
  { id: 'A-104', patientId: 'P-105', patientName: 'Diana Prince', doctorId: 'D-4', doctorName: 'Dr. Marcus Vance', procedure: 'Digital Smile Design', chair: 'Consultation Room', date: '2026-07-20', startTime: '11:15', duration: 40, status: 'In-Progress', category: 'Consultation' },
  { id: 'A-105', patientId: 'P-104', patientName: 'Logan Howlett', doctorId: 'D-2', doctorName: 'Dr. Michael Chen', procedure: 'Implant Maintenance', chair: 'Chair 3 (Fitting & Try-in)', date: '2026-07-20', startTime: '14:00', duration: 30, status: 'Confirmed', category: 'Recall' },
  { id: 'A-106', patientId: 'P-106', patientName: 'Barry Allen', doctorId: 'D-3', doctorName: 'Dr. Sarah Jenkins', procedure: 'Emergency crown repair', chair: 'Chair 2 (Restorative)', date: '2026-07-20', startTime: '15:00', duration: 60, status: 'Pending', category: 'Treatment' }
];
