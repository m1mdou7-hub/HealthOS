'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  AlertTriangle,
  Search,
  Activity,
  FileText,
  DollarSign,
  Layers,
  ChevronDown,
  Clock3,
  CheckCircle,
  Eye,
  Settings,
  ShieldAlert,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Wrench,
  UserX,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// === DATA DEFINITIONS & SCHEMAS ===
export interface PatientMock {
  id: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  photoUrl: string;
  medicalAlerts: string[];
  currentTreatment: string;
  financialBalance: string;
  historyScore: number; // For AI No-Show prediction (0-100)
}

export interface DoctorMock {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

export interface AppointmentMock {
  id: string;
  patient: PatientMock;
  doctor: DoctorMock;
  procedure: string;
  chair: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  duration: number; // in minutes
  status: 'Confirmed' | 'Pending' | 'In-Progress' | 'Completed' | 'Cancelled';
  category: 'Consultation' | 'Treatment' | 'Surgery' | 'Lab' | 'Recall';
  priority: 'Routine' | 'Medium' | 'Urgent';
  isRecurring?: boolean;
  isEmergency?: boolean;
  recurrenceId?: string;
}

export interface HolidayMock {
  date: string;
  name: string;
}

export interface MaintenanceBlock {
  id: string;
  chair: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface DoctorUnavailable {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface WaitingListEntry {
  id: string;
  patient: PatientMock;
  procedure: string;
  preferredDoctorId: string;
  preferredTimeOfDay: 'Morning' | 'Afternoon' | 'Any';
}

// === MOCK DATABASE ===
const MOCK_PATIENTS: PatientMock[] = [
  {
    id: 'P-101',
    name: 'Eleanor Vance',
    dob: '1964-08-14',
    phone: '(555) 123-8945',
    email: 'eleanor.vance@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    medicalAlerts: ['Osteoporosis - taking Alendronate', 'Penicillin Allergy'],
    currentTreatment: 'Full-Arch Implant Rehabilitation (All-on-4 Upper)',
    financialBalance: '$4,250.00 Pending',
    historyScore: 94 // 94% attendance rate
  },
  {
    id: 'P-102',
    name: 'Harlan Mercer',
    dob: '1952-11-23',
    phone: '(555) 345-1200',
    email: 'hmercer52@outlook.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    medicalAlerts: ['Type 2 Diabetes (Controlled)', 'Hypertension'],
    currentTreatment: 'Multi-unit Bridge and Implant Supported Crowns',
    financialBalance: '$850.00 Paid',
    historyScore: 78 // 78% attendance rate (medium risk)
  },
  {
    id: 'P-103',
    name: 'Clara Oswald',
    dob: '1989-05-04',
    phone: '(555) 876-4321',
    email: 'clara.oswald@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    medicalAlerts: [],
    currentTreatment: '8 Anterior Ceramic Veneers (#5-#12)',
    financialBalance: '$12,400.00 Approved',
    historyScore: 98 // 98% attendance rate (extremely reliable)
  },
  {
    id: 'P-104',
    name: 'Marcus Sterling',
    dob: '1971-02-17',
    phone: '(555) 901-7643',
    email: 'm.sterling@sterling-invest.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    medicalAlerts: ['Severe Bruxism'],
    currentTreatment: 'Full Mouth Restoration & Occlusal Bite Splint',
    financialBalance: '$2,300.00 Outstanding',
    historyScore: 65 // 65% attendance rate (high risk, cancellations)
  },
  {
    id: 'P-105',
    name: 'Diana Prince',
    dob: '1984-03-25',
    phone: '(555) 441-9876',
    email: 'diana.prince@gotham-museum.org',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    medicalAlerts: ['Sulfa Drugs Allergy'],
    currentTreatment: 'Single Implant Restoration #9 (Aesthetic Zone)',
    financialBalance: '$0.00 Clear',
    historyScore: 90
  }
];

const MOCK_DOCTORS: DoctorMock[] = [
  { id: 'D-1', name: 'Dr. Elena Rostova', specialty: 'Prosthodontist', color: 'emerald' },
  { id: 'D-2', name: 'Dr. Michael Chen', specialty: 'Implantologist', color: 'purple' },
  { id: 'D-3', name: 'Dr. Sarah Jenkins', specialty: 'Cosmetic Dentist', color: 'blue' },
  { id: 'D-4', name: 'Dr. Marcus Vance', specialty: 'Lab Director & Prostho', color: 'orange' }
];

const MOCK_CHAIRS = [
  'Chair 1 (Digital Suite)',
  'Chair 2 (Restorative)',
  'Chair 3 (Fitting & Try-in)',
  'Surgery Suite A',
  'Consultation Room'
];

interface ProcedureSpec {
  name: string;
  category: AppointmentMock['category'];
  duration: number;
  value: number; // Production stats value
}

const MOCK_PROCEDURES: ProcedureSpec[] = [
  { name: 'Consultation', category: 'Consultation', duration: 30, value: 150 },
  { name: 'Crown Preparation', category: 'Treatment', duration: 60, value: 1200 },
  { name: 'Bridge Preparation', category: 'Treatment', duration: 90, value: 2500 },
  { name: 'Veneer Try-in', category: 'Treatment', duration: 45, value: 300 },
  { name: 'Veneer Delivery', category: 'Treatment', duration: 60, value: 1800 },
  { name: 'Digital Smile Design', category: 'Consultation', duration: 45, value: 500 },
  { name: 'CBCT Review', category: 'Consultation', duration: 30, value: 250 },
  { name: 'Intraoral Scan', category: 'Lab', duration: 30, value: 200 },
  { name: 'Implant Surgery', category: 'Surgery', duration: 120, value: 4500 },
  { name: 'Healing Abutment', category: 'Surgery', duration: 45, value: 600 },
  { name: 'Final Restoration', category: 'Treatment', duration: 60, value: 1500 },
  { name: 'Complete Denture', category: 'Lab', duration: 60, value: 2000 },
  { name: 'RPD Try-in', category: 'Lab', duration: 45, value: 400 },
  { name: 'Scaling & Prophylaxis', category: 'Recall', duration: 45, value: 180 },
  { name: 'Routine Recall', category: 'Recall', duration: 30, value: 120 },
  { name: 'Emergency Diagnostic', category: 'Surgery', duration: 60, value: 350 }
];

// Seed initial realistic appointments for today (2026-07-17) and adjacent days
const INITIAL_APPOINTMENTS: AppointmentMock[] = [
  {
    id: 'A-1',
    patient: MOCK_PATIENTS[0],
    doctor: MOCK_DOCTORS[0],
    procedure: 'Crown Preparation',
    chair: 'Chair 1 (Digital Suite)',
    date: '2026-07-17',
    startTime: '08:30',
    duration: 60,
    status: 'Completed',
    category: 'Treatment',
    priority: 'Routine'
  },
  {
    id: 'A-2',
    patient: MOCK_PATIENTS[1],
    doctor: MOCK_DOCTORS[1],
    procedure: 'Implant Surgery',
    chair: 'Surgery Suite A',
    date: '2026-07-17',
    startTime: '10:00',
    duration: 120,
    status: 'In-Progress',
    category: 'Surgery',
    priority: 'Urgent'
  },
  {
    id: 'A-3',
    patient: MOCK_PATIENTS[2],
    doctor: MOCK_DOCTORS[2],
    procedure: 'Digital Smile Design',
    chair: 'Consultation Room',
    date: '2026-07-17',
    startTime: '13:00',
    duration: 45,
    status: 'Confirmed',
    category: 'Consultation',
    priority: 'Routine'
  },
  {
    id: 'A-4',
    patient: MOCK_PATIENTS[3],
    doctor: MOCK_DOCTORS[0],
    procedure: 'Veneer Try-in',
    chair: 'Chair 3 (Fitting & Try-in)',
    date: '2026-07-17',
    startTime: '14:30',
    duration: 60,
    status: 'Pending',
    category: 'Treatment',
    priority: 'Medium'
  },
  {
    id: 'A-5',
    patient: MOCK_PATIENTS[4],
    doctor: MOCK_DOCTORS[3],
    procedure: 'Intraoral Scan',
    chair: 'Chair 2 (Restorative)',
    date: '2026-07-17',
    startTime: '16:00',
    duration: 30,
    status: 'Confirmed',
    category: 'Lab',
    priority: 'Routine'
  },
  {
    id: 'A-6',
    patient: MOCK_PATIENTS[0],
    doctor: MOCK_DOCTORS[0],
    procedure: 'Veneer Delivery',
    chair: 'Chair 1 (Digital Suite)',
    date: '2026-07-18',
    startTime: '09:00',
    duration: 90,
    status: 'Confirmed',
    category: 'Treatment',
    priority: 'Urgent'
  }
];

export default function AppointmentsWorkspace() {
  // === SYSTEM CORE STATES ===
  const [appointments, setAppointments] = useState<AppointmentMock[]>(INITIAL_APPOINTMENTS);
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-07-17'));
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month' | 'agenda'>('week');
  const [activeLayout, setActiveLayout] = useState<'calendar' | 'timeline'>('calendar');

  // Filters State
  const [filterDoctor, setFilterDoctor] = useState<string>('All');
  const [filterChair, setFilterChair] = useState<string>('All');
  const [filterProcedure, setFilterProcedure] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // === NEW PRODUCTION STATES (1-20 REQUIREMENTS) ===
  const [holidays, setHolidays] = useState<HolidayMock[]>([
    { date: '2026-07-24', name: 'Pioneer Day' },
    { date: '2026-07-04', name: 'Independence Day' },
    { date: '2026-12-25', name: 'Christmas Day' }
  ]);

  const [maintenanceBlocks, setMaintenanceBlocks] = useState<MaintenanceBlock[]>([
    {
      id: 'M-1',
      chair: 'Chair 1 (Digital Suite)',
      date: '2026-07-17',
      startTime: '11:00',
      endTime: '12:30',
      reason: 'DLP Printer Recalibration'
    }
  ]);

  const [doctorUnavailabilities, setDoctorUnavailabilities] = useState<DoctorUnavailable[]>([
    {
      id: 'DU-1',
      doctorId: 'D-2',
      date: '2026-07-17',
      startTime: '14:00',
      endTime: '15:30',
      reason: 'Prostho Academic Lecture'
    }
  ]);

  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([
    {
      id: 'W-1',
      patient: MOCK_PATIENTS[1], // Harlan
      procedure: 'Final Restoration',
      preferredDoctorId: 'D-1',
      preferredTimeOfDay: 'Afternoon'
    },
    {
      id: 'W-2',
      patient: MOCK_PATIENTS[3], // Marcus
      procedure: 'RPD Try-in',
      preferredDoctorId: 'D-4',
      preferredTimeOfDay: 'Morning'
    }
  ]);

  // Context Menu State (Req 4)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; apptId: string } | null>(null);

  // Reminders Simulator Modal State (Req 13, 14, 15)
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(false);
  const [simType, setSimType] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [simAppt, setSimAppt] = useState<AppointmentMock | null>(null);

  // Booking Wizard Dialog
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [newApptPatient, setNewApptPatient] = useState<string>('');
  const [newApptDoctor, setNewApptDoctor] = useState<string>('');
  const [newApptProcedure, setNewApptProcedure] = useState<string>('');
  const [newApptChair, setNewApptChair] = useState<string>('');
  const [newApptDate, setNewApptDate] = useState<string>('2026-07-17');
  const [newApptTime, setNewApptTime] = useState<string>('09:00');
  const [newApptDuration, setNewApptDuration] = useState<number>(45);
  const [newApptPriority, setNewApptPriority] = useState<'Routine' | 'Medium' | 'Urgent'>('Routine');
  const [newApptIsRecurring, setNewApptIsRecurring] = useState<boolean>(false);

  // AI Suggestions State (Req 16)
  const [aiSugPatient, setAiSugPatient] = useState<string>('');
  const [aiSugProcedure, setAiSugProcedure] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<{ date: string; time: string; chair: string; score: number; reason: string }[]>([]);

  // Collapsible drawer states
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isWaitingDrawerOpen, setIsWaitingDrawerOpen] = useState<boolean>(false);

  // Selected Detail Panel
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // State to track temporary horizontal resize deltas
  const [resizingApptId, setResizingApptId] = useState<string | null>(null);

  // Close context menu on window click
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  // Helper formats
  const getFormattedDate = (date: Date) => date.toISOString().split('T')[0];

  const currentDayString = useMemo(() => getFormattedDate(currentDate), [currentDate]);

  // === DYNAMIC CONFLICT DETECTION & NO-SHOW ENGINE (Req 8 & Req 17) ===
  const conflictMap = useMemo(() => {
    const conflicts: Record<string, string[]> = {};

    appointments.forEach((a1) => {
      if (a1.status === 'Cancelled') return;
      const issues: string[] = [];

      // Parse current time slot
      const [h1, m1] = a1.startTime.split(':').map(Number);
      const start1 = h1 * 60 + m1;
      const end1 = start1 + a1.duration;

      // Check Holiday
      const isHoliday = holidays.find((h) => h.date === a1.date);
      if (isHoliday) {
        issues.push(`Holiday Block: Clinic closed for ${isHoliday.name}`);
      }

      // Check maintenance blocks
      maintenanceBlocks.forEach((b) => {
        if (b.chair === a1.chair && b.date === a1.date) {
          const [sh, sm] = b.startTime.split(':').map(Number);
          const [eh, em] = b.endTime.split(':').map(Number);
          const bStart = sh * 60 + sm;
          const bEnd = eh * 60 + em;

          const overlaps = start1 < bEnd && bStart < end1;
          if (overlaps) {
            issues.push(`Chair Maintenance: ${b.chair} blocked for '${b.reason}'`);
          }
        }
      });

      // Check doctor unavailability
      doctorUnavailabilities.forEach((un) => {
        if (un.doctorId === a1.doctor.id && un.date === a1.date) {
          const [sh, sm] = un.startTime.split(':').map(Number);
          const [eh, em] = un.endTime.split(':').map(Number);
          const uStart = sh * 60 + sm;
          const uEnd = eh * 60 + em;

          const overlaps = start1 < uEnd && uStart < end1;
          if (overlaps) {
            issues.push(`Doctor Unavailable: ${a1.doctor.name} blocked for '${un.reason}'`);
          }
        }
      });

      // Check overlaps with other appointments
      appointments.forEach((a2) => {
        if (a1.id === a2.id || a2.status === 'Cancelled' || a1.date !== a2.date) return;

        const [h2, m2] = a2.startTime.split(':').map(Number);
        const start2 = h2 * 60 + m2;
        const end2 = start2 + a2.duration;

        const overlaps = start1 < end2 && start2 < end1;
        if (overlaps) {
          if (a1.chair === a2.chair) {
            issues.push(`Chair Clash: Overlap with ${a2.patient.name} in ${a1.chair}`);
          }
          if (a1.doctor.id === a2.doctor.id) {
            issues.push(`Clinician Clash: ${a1.doctor.name} double-booked with ${a2.patient.name}`);
          }
        }
      });

      if (issues.length > 0) {
        conflicts[a1.id] = issues;
      }
    });

    return conflicts;
  }, [appointments, holidays, maintenanceBlocks, doctorUnavailabilities]);

  // AI predicts no show probability logic (Req 17)
  const predictNoShow = (appt: AppointmentMock) => {
    // Basic calculation model
    let baseChance = 100 - appt.patient.historyScore;

    // High priority is less likely to no-show
    if (appt.priority === 'Urgent') baseChance -= 10;
    // Late appointments have slightly higher risk
    const hour = parseInt(appt.startTime.split(':')[0]);
    if (hour >= 16) baseChance += 12;
    // Fridays have higher risk
    const dayOfWeek = new Date(appt.date).getDay();
    if (dayOfWeek === 5) baseChance += 15;

    const finalProb = Math.max(2, Math.min(98, baseChance));
    let rating: 'Low' | 'Medium' | 'High' = 'Low';
    if (finalProb > 35) rating = 'High';
    else if (finalProb > 15) rating = 'Medium';

    return { probability: finalProb, rating };
  };

  // === CORE CALENDAR MATHEMATICS ===
  const getWeekDays = (midDate: Date) => {
    const startOfWeek = new Date(midDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Align Mon
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getMonthDays = (midDate: Date) => {
    const yr = midDate.getFullYear();
    const mo = midDate.getMonth();
    const firstDay = new Date(yr, mo, 1);
    const lastDay = new Date(yr, mo + 1, 0);

    const days = [];
    const startDayOfWeek = firstDay.getDay();
    const prefixDiff = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    for (let i = prefixDiff; i > 0; i--) {
      days.push({ date: new Date(yr, mo, 1 - i), currentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(yr, mo, d), currentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(yr, mo + 1, i), currentMonth: false });
    }
    return days;
  };

  // === FILTER CHIPS / COMPUTED STATE ===
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (filterDoctor !== 'All' && appt.doctor.id !== filterDoctor) return false;
      if (filterChair !== 'All' && appt.chair !== filterChair) return false;
      if (filterStatus !== 'All' && appt.status !== filterStatus) return false;
      if (filterProcedure !== 'All' && appt.procedure !== filterProcedure) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          appt.patient.name.toLowerCase().includes(query) ||
          appt.procedure.toLowerCase().includes(query) ||
          appt.doctor.name.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [appointments, filterDoctor, filterChair, filterStatus, filterProcedure, searchQuery]);

  // Hours spectrum (08:00 to 20:00)
  const timelineHours = useMemo(() => {
    const hours = [];
    for (let h = 8; h <= 20; h++) {
      const displayHour = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      hours.push({ value: `${String(h).padStart(2, '0')}:00`, label: `${displayHour}:00 ${ampm}` });
    }
    return hours;
  }, []);

  // === CHARS & DOCTORS OCCUPANCY VISUALIZATIONS (Req 6 & Req 7) ===
  const chairOccupancy = useMemo(() => {
    const occ: Record<string, { minutes: number; percent: number }> = {};
    MOCK_CHAIRS.forEach((c) => {
      const activeMinutes = appointments
        .filter((a) => a.chair === c && a.date === currentDayString && a.status !== 'Cancelled')
        .reduce((sum, current) => sum + current.duration, 0);

      // Available clinic day limit is 12 hours = 720 minutes
      const percent = Math.round((activeMinutes / 720) * 100);
      occ[c] = { minutes: activeMinutes, percent: Math.min(100, percent) };
    });
    return occ;
  }, [appointments, currentDayString]);

  const doctorOccupancy = useMemo(() => {
    const occ: Record<string, { minutes: number; percent: number }> = {};
    MOCK_DOCTORS.forEach((d) => {
      const activeMinutes = appointments
        .filter((a) => a.doctor.id === d.id && a.date === currentDayString && a.status !== 'Cancelled')
        .reduce((sum, current) => sum + current.duration, 0);

      // Available daily capacity is 8 hours = 480 minutes
      const percent = Math.round((activeMinutes / 480) * 100);
      occ[d.id] = { minutes: activeMinutes, percent: Math.min(100, percent) };
    });
    return occ;
  }, [appointments, currentDayString]);

  // === DAILY PRODUCTION STATISTICS (Req 20) ===
  const dailyProduction = useMemo(() => {
    const todayActive = appointments.filter((a) => a.date === currentDayString && a.status !== 'Cancelled');
    const projected = todayActive.reduce((sum, appt) => {
      const spec = MOCK_PROCEDURES.find((p) => p.name === appt.procedure);
      return sum + (spec?.value || 150);
    }, 0);

    const completed = todayActive
      .filter((a) => a.status === 'Completed')
      .reduce((sum, appt) => {
        const spec = MOCK_PROCEDURES.find((p) => p.name === appt.procedure);
        return sum + (spec?.value || 150);
      }, 0);

    const target = 7500; // Daily Goal
    const progressPercent = Math.min(100, Math.round((projected / target) * 100));

    return { projected, completed, progressPercent, target };
  }, [appointments, currentDayString]);

  // === RESCHEDULE & RECURRENCE ACTION ENGINE ===
  const updateAppointmentSlot = (apptId: string, updates: Partial<AppointmentMock>) => {
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === apptId ? { ...appt, ...updates } : appt))
    );
  };

  // Drag & Drop handlers (Req 1)
  const handleDragStart = (e: React.DragEvent, apptId: string) => {
    e.dataTransfer.setData('text/plain', apptId);
  };

  const handleDropSlot = (e: React.DragEvent, targetChair: string, targetTime: string, targetDate: string) => {
    e.preventDefault();
    const apptId = e.dataTransfer.getData('text/plain');
    if (!apptId) return;

    // Check if this doctor or chair is blocked for target time
    updateAppointmentSlot(apptId, {
      chair: targetChair,
      startTime: targetTime,
      date: targetDate
    });
  };

  // Double Click Creation Handler (Req 3)
  const handleDoubleClickEmpty = (chair: string, time: string, date: string) => {
    setNewApptChair(chair);
    setNewApptTime(time);
    setNewApptDate(date);
    setIsWizardOpen(true);
    setActiveStep(1);
  };

  // Recurrency Slot Builder (Req 12)
  const executeRecurringInsert = (baseAppt: AppointmentMock) => {
    const extraAppts: AppointmentMock[] = [];
    const recurrenceGroupId = `rec-${Date.now()}`;

    // Create 3 additional appointments weekly
    for (let w = 1; w <= 3; w++) {
      const d = new Date(baseAppt.date);
      d.setDate(d.getDate() + w * 7);
      const futureDateStr = getFormattedDate(d);

      extraAppts.push({
        ...baseAppt,
        id: `A-${Math.floor(Math.random() * 90000) + 10000}`,
        date: futureDateStr,
        isRecurring: true,
        recurrenceId: recurrenceGroupId
      });
    }

    setAppointments((prev) => [...prev, { ...baseAppt, isRecurring: true, recurrenceId: recurrenceGroupId }, ...extraAppts]);
  };

  // Emergency Slot Insertion Handler (Req 19)
  const handleInsertEmergency = () => {
    const randomPatient = MOCK_PATIENTS[Math.floor(Math.random() * MOCK_PATIENTS.length)];
    const emergencyAppt: AppointmentMock = {
      id: `EMERG-${Date.now()}`,
      patient: randomPatient,
      doctor: MOCK_DOCTORS[1], // Chen (Implant/Surgeon)
      procedure: 'Emergency Diagnostic',
      chair: 'Surgery Suite A',
      date: currentDayString,
      startTime: '11:00', // Slot directly in morning
      duration: 60,
      status: 'Confirmed',
      category: 'Surgery',
      priority: 'Urgent',
      isEmergency: true
    };

    setAppointments((prev) => [emergencyAppt, ...prev]);
  };

  // AI suggestion generator algorithm (Req 16)
  const triggerAiOptimalSlots = () => {
    if (!aiSugPatient || !aiSugProcedure) return;
    const procSpec = MOCK_PROCEDURES.find((p) => p.name === aiSugProcedure);
    const duration = procSpec?.duration || 45;

    // Search empty slots over the next 3 days
    const results: { date: string; time: string; chair: string; score: number; reason: string }[] = [];
    const daysToScan = [currentDayString, '2026-07-18', '2026-07-19'];
    const possibleHours = ['09:00', '11:00', '14:00', '16:00'];

    daysToScan.forEach((dateVal) => {
      // Avoid Holidays
      if (holidays.some((h) => h.date === dateVal)) return;

      MOCK_CHAIRS.forEach((chairVal) => {
        possibleHours.forEach((timeVal) => {
          // See if it overlaps anything
          const isOverlap = appointments.some((a) => {
            if (a.date !== dateVal || a.chair !== chairVal || a.status === 'Cancelled') return false;
            // Overlap check
            const [sh, sm] = a.startTime.split(':').map(Number);
            const aStart = sh * 60 + sm;
            const aEnd = aStart + a.duration;

            const [th, tm] = timeVal.split(':').map(Number);
            const tStart = th * 60 + tm;
            const tEnd = tStart + duration;

            return tStart < aEnd && aStart < tEnd;
          });

          if (!isOverlap && results.length < 3) {
            results.push({
              date: dateVal,
              time: timeVal,
              chair: chairVal,
              score: Math.floor(Math.random() * 15) + 84, // AI confidence score
              reason: `Optimized: ${chairVal} is open, operator available with ideal patient prep buffer.`
            });
          }
        });
      });
    });

    setAiSuggestions(results);
  };

  // Add Custom Holiday handler (Req 9)
  const handleAddHoliday = () => {
    const name = prompt('Enter Holiday Title:');
    const date = prompt('Enter Holiday Date (YYYY-MM-DD):', currentDayString);
    if (name && date) {
      setHolidays((prev) => [...prev, { date, name }]);
    }
  };

  // Add Chair Block handler (Req 10)
  const handleAddChairBlock = () => {
    const chair = prompt('Enter Chair to Block:', MOCK_CHAIRS[0]);
    const reason = prompt('Maintenance Reason:');
    if (chair && reason) {
      setMaintenanceBlocks((prev) => [
        ...prev,
        {
          id: `M-${Date.now()}`,
          chair,
          date: currentDayString,
          startTime: '09:00',
          endTime: '11:00',
          reason
        }
      ]);
    }
  };

  // Add Doctor block handler (Req 11)
  const handleAddDocBlock = () => {
    const docId = prompt('Enter Clinician ID (D-1, D-2, D-3, D-4):', 'D-1');
    const reason = prompt('Unavailability Reason:');
    if (docId && reason) {
      setDoctorUnavailabilities((prev) => [
        ...prev,
        {
          id: `DU-${Date.now()}`,
          doctorId: docId,
          date: currentDayString,
          startTime: '13:00',
          endTime: '15:00',
          reason
        }
      ]);
    }
  };

  // New Appointment Submission
  const handleWizardSubmit = () => {
    const pObj = MOCK_PATIENTS.find((p) => p.id === newApptPatient) || MOCK_PATIENTS[0];
    const dObj = MOCK_DOCTORS.find((d) => d.id === newApptDoctor) || MOCK_DOCTORS[0];
    const procObj = MOCK_PROCEDURES.find((pr) => pr.name === newApptProcedure) || MOCK_PROCEDURES[0];

    const baseAppt: AppointmentMock = {
      id: `A-${Math.floor(Math.random() * 9000) + 1000}`,
      patient: pObj,
      doctor: dObj,
      procedure: newApptProcedure,
      chair: newApptChair || MOCK_CHAIRS[0],
      date: newApptDate,
      startTime: newApptTime,
      duration: newApptDuration || procObj.duration,
      status: 'Confirmed',
      category: procObj.category,
      priority: newApptPriority
    };

    if (newApptIsRecurring) {
      executeRecurringInsert(baseAppt);
    } else {
      setAppointments((prev) => [...prev, baseAppt]);
    }

    setIsWizardOpen(false);
    setActiveStep(1);
  };

  // Color mapper helper (Req 5)
  const getCategoryColor = (category: AppointmentMock['category']) => {
    switch (category) {
      case 'Consultation':
        return {
          border: 'border-blue-500/40',
          bg: 'bg-blue-950/40 text-blue-300',
          dot: 'bg-blue-400',
          hover: 'hover:bg-blue-900/30'
        };
      case 'Treatment':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/40 text-emerald-300',
          dot: 'bg-emerald-400',
          hover: 'hover:bg-emerald-900/30'
        };
      case 'Surgery':
        return {
          border: 'border-purple-500/40',
          bg: 'bg-purple-950/40 text-purple-300',
          dot: 'bg-purple-400',
          hover: 'hover:bg-purple-900/30'
        };
      case 'Lab':
        return {
          border: 'border-orange-500/40',
          bg: 'bg-orange-950/40 text-orange-300',
          dot: 'bg-orange-400',
          hover: 'hover:bg-orange-900/30'
        };
      case 'Recall':
      default:
        return {
          border: 'border-zinc-700',
          bg: 'bg-zinc-900/60 text-zinc-300',
          dot: 'bg-zinc-400',
          hover: 'hover:bg-zinc-800/50'
        };
    }
  };

  // === RESIZE IMPLEMENTATION (Req 2) ===
  const handleResizeStart = (e: React.MouseEvent, apptId: string, direction: 'horizontal' | 'vertical') => {
    e.stopPropagation();
    e.preventDefault();
    setResizingApptId(apptId);

    const startX = e.clientX;
    const startY = e.clientY;
    const targetAppt = appointments.find((a) => a.id === apptId);
    if (!targetAppt) return;
    const startDuration = targetAppt.duration;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (direction === 'horizontal') {
        const deltaX = moveEvent.clientX - startX;
        // 80px horizontal grid cell ~ 60 minutes
        const minuteDelta = Math.round(deltaX / 80) * 30;
        const finalDur = Math.max(15, startDuration + minuteDelta);
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, duration: finalDur } : a))
        );
      } else {
        const deltaY = moveEvent.clientY - startY;
        // 50px vertical row cell ~ 30 minutes
        const minuteDelta = Math.round(deltaY / 50) * 15;
        const finalDur = Math.max(15, startDuration + minuteDelta);
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, duration: finalDur } : a))
        );
      }
    };

    const handleMouseUp = () => {
      setResizingApptId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Helper for today's appointment count
  const todaysAppointmentsCount = useMemo(() => {
    return appointments.filter((a) => a.date === currentDayString && a.status !== 'Cancelled').length;
  }, [appointments, currentDayString]);

  // Helper for confirmed appointments today
  const confirmedAppointmentsCount = useMemo(() => {
    return appointments.filter((a) => a.date === currentDayString && a.status === 'Confirmed').length;
  }, [appointments, currentDayString]);

  // Helper for average chair utilization percent
  const avgChairUtilization = useMemo(() => {
    const values = Object.values(chairOccupancy).map((o) => o.percent);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  }, [chairOccupancy]);

  return (
    <div className="space-y-6 text-zinc-100 min-h-screen bg-zinc-950 p-4 rounded-3xl border border-zinc-900 relative">
      
      {/* 5. COLOR LEGEND AND HEADER (Req 5) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase rounded-full">
              PRO CORE V5
            </span>
            <span className="text-xs text-zinc-500 font-mono">Precision Chair Scheduler</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Clinical Operatory Planner & Scheduler
          </h2>
          <p className="text-zinc-400 text-xs">
            Manage dental operatories, implant surgeons, digital prosthetics, and patient notifications.
          </p>
        </div>

        {/* Procedure Color Legend */}
        <div className="p-3 bg-zinc-900/30 rounded-2xl border border-zinc-900 flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold mr-1">Procedure Legend:</span>
          {(['Consultation', 'Treatment', 'Surgery', 'Lab', 'Recall'] as const).map((cat) => {
            const colors = getCategoryColor(cat);
            return (
              <div key={cat} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${colors.bg} border ${colors.border}`}>
                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <span>{cat}</span>
              </div>
            );
          })}
        </div>

        {/* Top Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> AI Suggestions
          </button>
          <button
            onClick={() => setIsWaitingDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <User className="w-4 h-4" /> Waiting List ({waitingList.length})
          </button>
          <button
            onClick={handleInsertEmergency}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5 animate-pulse"
          >
            <AlertCircle className="w-4 h-4" /> Insert Emergency
          </button>
          <button
            onClick={() => {
              setIsWizardOpen(true);
              setActiveStep(1);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* REDUCED KEY KPIS FOR UX CLARITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Today's Appointments */}
        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Appointments</span>
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{todaysAppointmentsCount}</span>
            <span className="text-[10px] text-zinc-500 font-mono">visits today</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            Active patient appointments on the planner today.
          </p>
        </div>

        {/* KPI 2: Waiting Patients */}
        <div 
          onClick={() => setIsWaitingDrawerOpen(true)}
          className="p-4 rounded-2xl bg-zinc-900/20 hover:bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Waiting Patients</span>
            <User className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{waitingList.length}</span>
            <span className="text-[10px] text-zinc-500 font-mono">on waitlist</span>
          </div>
          <p className="text-[10px] text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1">
            Click to manage or fill open slots <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* KPI 3: Chair Utilization */}
        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Chair Utilization</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{avgChairUtilization}%</span>
            <span className="text-[10px] text-zinc-500 font-mono">avg occupancy</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            Current operatory capacity utilized today.
          </p>
        </div>

        {/* KPI 4: Confirmed Appointments */}
        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Appointments</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{confirmedAppointmentsCount}</span>
            <span className="text-[10px] text-zinc-500 font-mono">confirmed today</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            Visits locked and verified by patient response.
          </p>
        </div>

      </div>

      {/* ACTIVE CONFLICTS WATCH (Req 8) */}
      {Object.keys(conflictMap).length > 0 && (
        <div className="p-4 bg-red-950/10 border border-red-500/25 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-5 h-5 shrink-0 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider font-mono">Clinician / Operatory Conflicts Detected ({Object.keys(conflictMap).length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(conflictMap).map(([id, issues]) => {
              const appt = appointments.find((a) => a.id === id);
              return (
                <div key={id} className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1 mb-1">
                    <span className="font-bold text-white">{appt?.patient.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">{appt?.startTime}</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-zinc-400">
                    {issues.map((issue, idx) => (
                      <li key={idx} className="list-disc list-inside leading-normal">{issue}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (appt) {
                        const [h, m] = appt.startTime.split(':').map(Number);
                        const nextTime = `${String((h + 2) % 20).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                        updateAppointmentSlot(appt.id, { startTime: nextTime });
                      }
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors pt-1.5 block"
                  >
                    Auto-Resolve: Move 2h Later &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRIMARY CALENDAR PLOTTER */}
      <div className="space-y-6">
          
          {/* ADVANCED COMBINED FILTER PANEL */}
          <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Multi-Criteria Search & Filter</span>
              </div>
              <button
                onClick={() => {
                  setFilterDoctor('All');
                  setFilterChair('All');
                  setFilterStatus('All');
                  setFilterProcedure('All');
                  setSearchQuery('');
                }}
                className="text-[10px] text-zinc-500 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-white placeholder-zinc-500 focus:border-zinc-800 outline-none"
                />
              </div>

              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 focus:border-zinc-800 outline-none cursor-pointer"
              >
                <option value="All">All Clinicians</option>
                {MOCK_DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={filterChair}
                onChange={(e) => setFilterChair(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 focus:border-zinc-800 outline-none cursor-pointer"
              >
                <option value="All">All Chairs</option>
                {MOCK_CHAIRS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={filterProcedure}
                onChange={(e) => setFilterProcedure(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 focus:border-zinc-800 outline-none cursor-pointer"
              >
                <option value="All">All Workflows</option>
                {MOCK_PROCEDURES.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 focus:border-zinc-800 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* VIEW SWITCH BAR & CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/10 p-3 rounded-2xl border border-zinc-900">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">
                {selectedView === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                {selectedView === 'week' && `Week of ${getWeekDays(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${getWeekDays(currentDate)[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                {selectedView === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {selectedView === 'agenda' && 'All Bookings Agenda'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950 p-0.5">
                <button onClick={() => {
                  const d = new Date(currentDate);
                  if (selectedView === 'day') d.setDate(d.getDate() - 1);
                  else if (selectedView === 'week') d.setDate(d.getDate() - 7);
                  else d.setMonth(d.getMonth() - 1);
                  setCurrentDate(d);
                }} className="p-1 text-zinc-400 hover:text-white transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentDate(new Date('2026-07-17'))} className="px-2 py-0.5 text-[10px] uppercase font-mono text-zinc-400 hover:text-white transition-all">
                  Today
                </button>
                <button onClick={() => {
                  const d = new Date(currentDate);
                  if (selectedView === 'day') d.setDate(d.getDate() + 1);
                  else if (selectedView === 'week') d.setDate(d.getDate() + 7);
                  else d.setMonth(d.getMonth() + 1);
                  setCurrentDate(d);
                }} className="p-1 text-zinc-400 hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950 p-0.5">
                <button
                  onClick={() => { setActiveLayout('calendar'); setSelectedView('week'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeLayout === 'calendar' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => { setActiveLayout('timeline'); setSelectedView('day'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeLayout === 'timeline' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Chair Timeline
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CALENDAR PANEL & WORKSPACE */}
          {activeLayout === 'calendar' ? (
            <div className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-2xl min-h-[450px]">
              
              {/* WEEK VIEW PANEL */}
              {selectedView === 'week' && (
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDays(currentDate).map((day) => {
                    const dateStr = getFormattedDate(day);
                    const isToday = dateStr === '2026-07-17';
                    const isHolidayObj = holidays.find((h) => h.date === dateStr);
                    const dayAppts = filteredAppointments.filter((a) => a.date === dateStr);

                    return (
                      <div
                        key={dateStr}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropSlot(e, MOCK_CHAIRS[0], '10:00', dateStr)}
                        onDoubleClick={() => handleDoubleClickEmpty(MOCK_CHAIRS[0], '09:00', dateStr)}
                        className={`p-2.5 rounded-2xl border min-h-[380px] flex flex-col transition-all relative ${
                          isToday ? 'bg-zinc-900/40 border-emerald-500/30' : 'bg-zinc-950/20 border-zinc-900'
                        } ${isHolidayObj ? 'opacity-70 bg-red-950/5 border-red-900/20' : ''}`}
                      >
                        {/* Day Title */}
                        <div className="text-center pb-2 border-b border-zinc-900 mb-2">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase block tracking-wider">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className={`text-xs font-bold font-mono inline-block px-1.5 py-0.2 rounded mt-0.5 ${
                            isToday ? 'bg-emerald-500 text-zinc-950 font-black' : 'text-white'
                          }`}>
                            {day.getDate()}
                          </span>
                        </div>

                        {/* Holiday Marker */}
                        {isHolidayObj && (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20">
                              CLOSED
                            </span>
                            <span className="text-[9px] text-zinc-500 mt-1">{isHolidayObj.name}</span>
                          </div>
                        )}

                        {/* List appointments */}
                        {!isHolidayObj && (
                          <div className="flex-1 space-y-2 overflow-y-auto max-h-[310px] scrollbar-none">
                            {dayAppts.length > 0 ? (
                              dayAppts.map((appt) => {
                                const colors = getCategoryColor(appt.category);
                                const isConflicting = conflictMap[appt.id];
                                const probInfo = predictNoShow(appt);

                                return (
                                  <div
                                    key={appt.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, appt.id)}
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      setContextMenu({ x: e.clientX, y: e.clientY, apptId: appt.id });
                                    }}
                                    onClick={() => setSelectedAppointmentId(appt.id)}
                                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all relative group ${colors.bg} ${colors.border} ${colors.hover}`}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-mono font-bold text-zinc-400">{appt.startTime}</span>
                                      <div className="flex items-center gap-1">
                                        {/* Emergency Badge */}
                                        {appt.isEmergency && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                      </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-white truncate leading-tight">
                                      {appt.patient.name}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                                      {appt.procedure}
                                    </p>

                                    {/* Warnings if conflict detected */}
                                    {isConflicting && (
                                      <div className="mt-1.5 flex items-center gap-1 text-[8px] text-red-400 bg-red-500/10 px-1 rounded">
                                        <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                                        <span className="font-bold uppercase tracking-wider">Conflict</span>
                                      </div>
                                    )}

                                    {/* AI No-Show Predictor Indicator */}
                                    <div className="mt-1 flex items-center justify-between text-[8px] text-zinc-500 border-t border-zinc-900 pt-1">
                                      <span>AI Risk</span>
                                      <span className={`font-mono font-bold ${
                                        probInfo.rating === 'High' ? 'text-red-400' : probInfo.rating === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                                      }`}>
                                        {probInfo.probability}%
                                      </span>
                                    </div>

                                    {/* RESIZE DRAG HANDLE (ns) (Req 2) */}
                                    <div
                                      onPointerDown={(e) => handleResizeStart(e, appt.id, 'vertical')}
                                      className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize bg-zinc-800/40 hover:bg-emerald-400/50 rounded-b-xl"
                                    />
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-zinc-600 italic block text-center py-10">Empty</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MONTH VIEW PANEL */}
              {selectedView === 'month' && (
                <div className="grid grid-cols-7 gap-1 border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((header) => (
                    <div key={header} className="p-2 border-b border-zinc-900 text-center text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500">
                      {header}
                    </div>
                  ))}

                  {getMonthDays(currentDate).map((cell, idx) => {
                    const formattedDate = getFormattedDate(cell.date);
                    const isToday = formattedDate === '2026-07-17';
                    const isHolidayObj = holidays.find((h) => h.date === formattedDate);
                    const cellAppts = filteredAppointments.filter((a) => a.date === formattedDate);

                    return (
                      <div
                        key={idx}
                        onDoubleClick={() => handleDoubleClickEmpty(MOCK_CHAIRS[0], '09:00', formattedDate)}
                        className={`min-h-[85px] p-2 border-b border-r border-zinc-900 flex flex-col relative transition-colors ${
                          cell.currentMonth ? 'bg-zinc-900/10' : 'bg-zinc-950 text-zinc-600'
                        } ${isToday ? 'bg-emerald-500/5 border-emerald-500/20' : ''} ${isHolidayObj ? 'bg-red-950/5' : ''}`}
                      >
                        <span className={`text-[10px] font-bold font-mono self-end ${
                          isToday ? 'bg-emerald-500 text-zinc-950 px-1 rounded font-black' : 'text-zinc-500'
                        }`}>
                          {cell.date.getDate()}
                        </span>

                        {isHolidayObj ? (
                          <span className="text-[8px] text-red-400 font-bold tracking-tight block truncate mt-1">Closed</span>
                        ) : (
                          <div className="mt-1 space-y-1 overflow-y-auto max-h-[50px] scrollbar-none">
                            {cellAppts.map((appt) => {
                              const colors = getCategoryColor(appt.category);
                              return (
                                <div
                                  key={appt.id}
                                  onClick={() => setSelectedAppointmentId(appt.id)}
                                  className="px-1 py-0.5 rounded text-[9px] truncate border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1"
                                >
                                  <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                                  <span className="truncate">{appt.patient.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            
            // CHAIR TIMELINE PLOTTER (Req 1, 2, 10)
            <div className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-2xl min-h-[450px] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Daily Chair Schedule Timeline (Today)</h3>
                  <p className="text-xs text-zinc-500">Drag to move appointments between chairs, or drag right edge to resize.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleAddChairBlock} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white">
                    + Block Chair
                  </button>
                  <button onClick={handleAddDocBlock} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white">
                    + Block Doctor
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div className="min-w-[900px] space-y-3">
                  {/* Hours Headers */}
                  <div className="grid grid-cols-13 gap-1 border-b border-zinc-900 pb-2 text-center">
                    <div className="text-left text-[10px] font-mono text-zinc-500 font-bold uppercase">Operatory</div>
                    {timelineHours.map((h) => (
                      <div key={h.value} className="text-[9px] font-mono text-zinc-400 font-bold">
                        {h.label.replace(':00', '')}
                      </div>
                    ))}
                  </div>

                  {/* Chair Rows */}
                  <div className="divide-y divide-zinc-900 space-y-3">
                    {MOCK_CHAIRS.map((chair) => {
                      const chairAppts = filteredAppointments.filter(
                        (a) => a.date === currentDayString && a.chair === chair
                      );

                      const isChairMaintenance = maintenanceBlocks.filter(
                        (m) => m.chair === chair && m.date === currentDayString
                      );

                      return (
                        <div key={chair} className="grid grid-cols-13 gap-1 py-3 items-center">
                          {/* Chair Name Column */}
                          <div className="text-xs font-bold text-white pr-2 truncate">
                            {chair.split(' ')[0]}
                            <span className="block text-[9px] text-zinc-500 font-normal truncate">
                              {chair.includes('Suite') ? 'Surgical Room' : 'Dental Unit'}
                            </span>
                          </div>

                          {/* 12 Hour Slot Cells */}
                          {timelineHours.map((hObj, hourIdx) => {
                            const blockHour = parseInt(hObj.value.split(':')[0]);

                            // Check Maintenance Overlap
                            const isMaintBlocked = isChairMaintenance.find((m) => {
                              const sh = parseInt(m.startTime.split(':')[0]);
                              const eh = parseInt(m.endTime.split(':')[0]);
                              return blockHour >= sh && blockHour < eh;
                            });

                            if (isMaintBlocked) {
                              return (
                                <div
                                  key={hObj.value}
                                  className="border border-red-500/20 bg-red-950/15 rounded-xl h-[85px] flex flex-col items-center justify-center text-center p-1 cursor-not-allowed group relative"
                                >
                                  <Wrench className="w-4.5 h-4.5 text-red-400 animate-spin" />
                                  <span className="text-[8px] text-red-300 font-bold block truncate mt-1">MAINTENANCE</span>
                                </div>
                              );
                            }

                            // Match Appointment
                            const appt = chairAppts.find((a) => {
                              const [ah] = a.startTime.split(':').map(Number);
                              const start = ah;
                              const end = ah + Math.ceil(a.duration / 60);
                              return blockHour >= start && blockHour < end;
                            });

                            if (appt) {
                              const [ah] = appt.startTime.split(':').map(Number);
                              const isStartCell = ah === blockHour;

                              if (isStartCell) {
                                const colors = getCategoryColor(appt.category);
                                const blockSpan = Math.max(1, Math.ceil(appt.duration / 60));
                                const isConflicting = conflictMap[appt.id];

                                return (
                                  <div
                                    key={hObj.value}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, appt.id)}
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      setContextMenu({ x: e.clientX, y: e.clientY, apptId: appt.id });
                                    }}
                                    onClick={() => setSelectedAppointmentId(appt.id)}
                                    style={{ gridColumn: `span ${Math.min(12 - hourIdx, blockSpan)}` }}
                                    className={`p-2 rounded-xl border ${colors.bg} ${colors.border} cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between h-[85px] z-10 relative group`}
                                  >
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-white truncate block">
                                          {appt.patient.name}
                                        </span>
                                        <span className="text-[8px] font-mono text-zinc-400">{appt.startTime}</span>
                                      </div>
                                      <span className="text-[9px] text-zinc-400 block truncate leading-tight">
                                        {appt.procedure}
                                      </span>
                                    </div>

                                    {isConflicting && (
                                      <span className="text-[8px] text-red-400 bg-red-500/10 px-1 py-0.2 rounded font-bold uppercase tracking-wider self-start flex items-center gap-0.5 mt-1">
                                        <ShieldAlert className="w-2.5 h-2.5" /> Conflict
                                      </span>
                                    )}

                                    <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 border-t border-zinc-900/50 pt-1 mt-1">
                                      <span>{appt.doctor.name.split(' ').pop()}</span>
                                      <span className="font-bold">{appt.status.toUpperCase()}</span>
                                    </div>

                                    {/* RESIZE HANDLE HORIZONTAL (ew) (Req 2) */}
                                    <div
                                      onPointerDown={(e) => handleResizeStart(e, appt.id, 'horizontal')}
                                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-zinc-800/40 hover:bg-emerald-400/50 rounded-r-xl"
                                    />
                                  </div>
                                );
                              }
                              return null; // spanned cell placeholder
                            }

                            return (
                              <div
                                key={hObj.value}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDropSlot(e, chair, hObj.value, currentDayString)}
                                onDoubleClick={() => handleDoubleClickEmpty(chair, hObj.value, currentDayString)}
                                className="border border-zinc-900 bg-zinc-950/20 rounded-xl h-[85px] flex items-center justify-center group hover:bg-zinc-900/10 cursor-pointer transition-colors"
                              >
                                <span className="text-[9px] text-zinc-700 group-hover:text-zinc-500 font-mono">+ Book</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI SUGGESTIONS DRAWER */}
        <AnimatePresence>
          {isAiDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
              <div className="absolute inset-0" onClick={() => setIsAiDrawerOpen(false)} />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 shadow-2xl p-6 space-y-6 overflow-y-auto flex flex-col z-50"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-black text-white">AI Suggestion Engine</h3>
                      <p className="text-xs text-zinc-500">Precision operatory & clinician matching</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAiDrawerOpen(false)} className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form elements for suggestion */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Target Patient</label>
                    <select
                      value={aiSugPatient}
                      onChange={(e) => setAiSugPatient(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-zinc-700 outline-none cursor-pointer"
                    >
                      <option value="">Select Target Patient...</option>
                      {MOCK_PATIENTS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Procedure Category</label>
                    <select
                      value={aiSugProcedure}
                      onChange={(e) => setAiSugProcedure(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-zinc-700 outline-none cursor-pointer"
                    >
                      <option value="">Select Targeted Procedure...</option>
                      {MOCK_PROCEDURES.map((p) => (
                        <option key={p.name} value={p.name}>{p.name} ({p.duration}m)</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={triggerAiOptimalSlots}
                    disabled={!aiSugPatient || !aiSugProcedure}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-30 disabled:hover:bg-emerald-500 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Scan Clinical Openings
                  </button>
                </div>

                {/* AI suggestions output */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] scrollbar-none pt-4 border-t border-zinc-900">
                  {aiSuggestions.length > 0 ? (
                    aiSuggestions.map((rec, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const pObj = MOCK_PATIENTS.find((p) => p.id === aiSugPatient);
                          if (pObj) {
                            const newAppt: AppointmentMock = {
                              id: `A-${Math.floor(Math.random() * 9000) + 1000}`,
                              patient: pObj,
                              doctor: MOCK_DOCTORS[0],
                              procedure: aiSugProcedure,
                              chair: rec.chair,
                              date: rec.date,
                              startTime: rec.time,
                              duration: 45,
                              status: 'Confirmed',
                              category: 'Treatment',
                              priority: 'Routine'
                            };
                            setAppointments((prev) => [...prev, newAppt]);
                            alert(`Booked ${pObj.name} for ${rec.date} at ${rec.time}!`);
                            setAiSuggestions([]);
                            setIsAiDrawerOpen(false);
                          }
                        }}
                        className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-900 hover:border-emerald-500/40 cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-400 font-mono font-bold">{rec.time}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{rec.date}</span>
                        </div>
                        <p className="text-sm text-zinc-200 font-bold">{rec.chair}</p>
                        <p className="text-xs text-zinc-400 leading-normal group-hover:text-zinc-300">{rec.reason}</p>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                          <span>Match score: {rec.score}%</span>
                          <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-zinc-600 text-xs italic">
                      {!aiSugPatient || !aiSugProcedure ? "Select a patient and procedure to begin the AI suggestion analysis." : "No recommended slots found yet. Click Scan Clinical Openings above."}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* WAITING LIST DRAWER */}
        <AnimatePresence>
          {isWaitingDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
              <div className="absolute inset-0" onClick={() => setIsWaitingDrawerOpen(false)} />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 shadow-2xl p-6 space-y-6 overflow-y-auto flex flex-col z-50"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-black text-white">Waiting List</h3>
                      <p className="text-xs text-zinc-500">Manage high-priority patient wait times</p>
                    </div>
                  </div>
                  <button onClick={() => setIsWaitingDrawerOpen(false)} className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Waiting List content */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] scrollbar-none">
                  {waitingList.length > 0 ? (
                    waitingList.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-3 hover:border-zinc-800 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white">{entry.patient.name}</h4>
                            <p className="text-xs text-zinc-400">{entry.procedure}</p>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mt-1">
                              {entry.preferredTimeOfDay} Preferred
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const newAppt: AppointmentMock = {
                                id: `A-${Math.floor(Math.random() * 9000) + 1000}`,
                                patient: entry.patient,
                                doctor: MOCK_DOCTORS[0],
                                procedure: entry.procedure,
                                chair: MOCK_CHAIRS[0],
                                date: currentDayString,
                                startTime: '11:00',
                                duration: 45,
                                status: 'Confirmed',
                                category: 'Treatment',
                                priority: 'Medium'
                              };
                              setAppointments((prev) => [...prev, newAppt]);
                              setWaitingList((prev) => prev.filter((w) => w.id !== entry.id));
                              alert(`Inserted ${entry.patient.name} to schedule from waiting list!`);
                              setIsWaitingDrawerOpen(false);
                            }}
                            className="px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold transition-all cursor-pointer"
                          >
                            Fill Vacancy
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-zinc-600 text-xs italic">
                      No patients currently on waiting list.
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* === ABSOLUTE CUSTOM CONTEXT MENU (Req 4) === */}
      <AnimatePresence>
        {contextMenu && (
          <div
            className="fixed z-50 bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl p-1.5 w-56 text-left"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[9px] uppercase font-mono text-zinc-500 block px-2.5 py-1">Quick Actions</span>
            
            <button
              onClick={() => {
                updateAppointmentSlot(contextMenu.apptId, { status: 'In-Progress' });
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-900 transition-colors flex items-center gap-2 text-zinc-300"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Start Appointment
            </button>
            <button
              onClick={() => {
                updateAppointmentSlot(contextMenu.apptId, { status: 'Completed' });
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-900 transition-colors flex items-center gap-2 text-zinc-300"
            >
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Complete Treatment
            </button>
            <button
              onClick={() => {
                const trg = appointments.find((a) => a.id === contextMenu.apptId);
                if (trg) {
                  setSimAppt(trg);
                  setSimType('sms');
                  setSimulatorOpen(true);
                }
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-900 transition-colors flex items-center gap-2 text-zinc-300 border-t border-zinc-900 mt-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> Trigger Reminders...
            </button>
            <button
              onClick={() => {
                updateAppointmentSlot(contextMenu.apptId, { status: 'Cancelled' });
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-red-950/40 text-red-400 hover:bg-zinc-900 transition-colors flex items-center gap-2"
            >
              <UserX className="w-3.5 h-3.5" /> Cancel Appointment
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* === SMS, WHATSAPP, EMAIL REMINDER SIMULATOR OVERLAY (Req 13, 14, 15) === */}
      <AnimatePresence>
        {simulatorOpen && simAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-850 bg-zinc-900 p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Dynamic Patient Reminder Simulator</h3>
                  <p className="text-[10px] text-zinc-400">Preview clinical notification templates</p>
                </div>
                <button onClick={() => setSimulatorOpen(false)} className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selector Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl">
                {(['sms', 'whatsapp', 'email'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSimType(t)}
                    className={`py-1.5 rounded-lg text-xs font-bold uppercase font-mono transition-all ${
                      simType === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Simulation Content */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 min-h-[160px] flex flex-col justify-center">
                {simType === 'sms' && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">SMS Outbound (555-123-8945)</span>
                    <div className="bg-zinc-900 border border-zinc-850 p-3 rounded-2xl text-xs max-w-[85%] text-zinc-200">
                      Hi {simAppt.patient.name}, this is Dental Core. Friendly reminder that your <b>{simAppt.procedure}</b> is scheduled for {simAppt.date} at <b>{simAppt.startTime}</b>. Text C to confirm.
                    </div>
                    <span className="text-[9px] text-zinc-600 block self-end">Delivered via Telco V2</span>
                  </div>
                )}

                {simType === 'whatsapp' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>WhatsApp Business Core API</span>
                    </div>
                    <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-2xl text-xs text-zinc-200 space-y-2">
                      <p>🦷 <b>PROSTHO SCHEDULING SYSTEM</b></p>
                      <p>Dear {simAppt.patient.name}, your upcoming clinical visit is locked. Let us know if you can attend:</p>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button onClick={() => { updateAppointmentSlot(simAppt.id, { status: 'Confirmed' }); alert('Confirmed!'); setSimulatorOpen(false); }} className="p-1 rounded bg-emerald-500 text-zinc-950 text-[10px] font-bold">
                          Confirm Yes
                        </button>
                        <button onClick={() => { alert('Rescheduling suggested'); setSimulatorOpen(false); }} className="p-1 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {simType === 'email' && (
                  <div className="space-y-2 text-xs">
                    <div className="border-b border-zinc-900 pb-1.5 text-zinc-400">
                      <b>From:</b> appointments@dentalcore.io <br />
                      <b>To:</b> {simAppt.patient.email}
                    </div>
                    <p className="text-white font-bold">Subject: Dental Core Appointment Confirmation</p>
                    <div className="p-2 bg-zinc-900 rounded text-zinc-400 leading-normal">
                      Dear {simAppt.patient.name}, thank you for choosing our Digital Smile & Prosthetic Suite. Your scheduled Crown Preparation with {simAppt.doctor.name} is verified for {simAppt.date} at {simAppt.startTime}.
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  alert(`Simulation broadcasted to ${simAppt.patient.name}!`);
                  setSimulatorOpen(false);
                }}
                className="w-full py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                Send Mock Transmission
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === MULTI-STEP NEW BOOKING WIZARD DIALOG (Req 12) === */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Create New Appointment</h3>
                  <p className="text-xs text-zinc-400">Step {activeStep} of 4</p>
                </div>
                <button onClick={() => setIsWizardOpen(false)} className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${activeStep >= s ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                ))}
              </div>

              <div className="min-h-[160px] flex flex-col justify-center">
                {activeStep === 1 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Step 1: Patient Record</label>
                    <select
                      value={newApptPatient}
                      onChange={(e) => setNewApptPatient(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:border-zinc-700 outline-none cursor-pointer"
                    >
                      <option value="">Select Target Patient...</option>
                      {MOCK_PATIENTS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Step 2: Clinician & Workflow</label>
                    <select
                      value={newApptDoctor}
                      onChange={(e) => setNewApptDoctor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-zinc-700 outline-none mb-2"
                    >
                      <option value="">Select Doctor...</option>
                      {MOCK_DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                      ))}
                    </select>
                    <select
                      value={newApptProcedure}
                      onChange={(e) => setNewApptProcedure(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-zinc-700 outline-none"
                    >
                      <option value="">Select Procedure...</option>
                      {MOCK_PROCEDURES.map((p) => (
                        <option key={p.name} value={p.name}>{p.name} - ${p.value}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Step 3: Operatory & Schedule</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Date</span>
                        <input
                          type="date"
                          value={newApptDate}
                          onChange={(e) => setNewApptDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-zinc-750 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block mb-1">Time</span>
                        <input
                          type="time"
                          value={newApptTime}
                          onChange={(e) => setNewApptTime(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-zinc-750 outline-none"
                        />
                      </div>
                    </div>
                    <select
                      value={newApptChair}
                      onChange={(e) => setNewApptChair(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-zinc-750 outline-none mt-2 cursor-pointer"
                    >
                      <option value="">Select Chair...</option>
                      {MOCK_CHAIRS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Step 4: Recurring Logic & Confirm</label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-850">
                      <input
                        type="checkbox"
                        id="recurringCheck"
                        checked={newApptIsRecurring}
                        onChange={(e) => setNewApptIsRecurring(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-0 outline-none cursor-pointer"
                      />
                      <label htmlFor="recurringCheck" className="text-xs text-zinc-300 font-semibold cursor-pointer">
                        Repeat Weekly (Book for 4 consecutive weeks)
                      </label>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 text-[11px] text-zinc-500">
                      Creates an initial appointment today, and copies identical slots on the following 3 weeks automatically.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold disabled:opacity-20"
                >
                  Back
                </button>
                {activeStep < 4 ? (
                  <button
                    onClick={() => {
                      if (activeStep === 1 && !newApptPatient) { alert('Select a patient'); return; }
                      if (activeStep === 2 && (!newApptDoctor || !newApptProcedure)) { alert('Select doc & procedure'); return; }
                      setActiveStep((prev) => prev + 1);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleWizardSubmit}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold"
                  >
                    Confirm & Book
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === RIGID PATIENT DOSSIER DRAWER WITH RETINAL DETAIL === */}
      <AnimatePresence>
        {selectedAppointmentId && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setSelectedAppointmentId(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 shadow-2xl p-6 space-y-6 overflow-y-auto"
            >
              {(() => {
                const details = appointments.find((a) => a.id === selectedAppointmentId);
                if (!details) return null;
                const probInfo = predictNoShow(details);

                return (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Clinical Dossier</span>
                        <h3 className="text-base font-black text-white">{details.patient.name}</h3>
                        <p className="text-xs text-zinc-500">ID: {details.patient.id} &bull; DOB: {details.patient.dob}</p>
                      </div>
                      <button onClick={() => setSelectedAppointmentId(null)} className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Medical Alerts (Req 17) */}
                    {details.patient.medicalAlerts.length > 0 && (
                      <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
                        <span className="text-[10px] text-red-400 font-black uppercase tracking-wider block">CRITICAL ALERTS</span>
                        <ul className="list-disc list-inside text-xs text-zinc-300">
                          {details.patient.medicalAlerts.map((al, i) => <li key={i}>{al}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* AI Show No-Show Predictor Gauge */}
                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">AI No-Show Risk Score</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          probInfo.rating === 'High' ? 'bg-red-500/10 text-red-400' : probInfo.rating === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {probInfo.rating} Risk
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{probInfo.probability}%</span>
                        <span className="text-xs text-zinc-500">probability of absence</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${
                          probInfo.rating === 'High' ? 'bg-red-500' : probInfo.rating === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} style={{ width: `${probInfo.probability}%` }} />
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        Based on historical attendance rate ({details.patient.historyScore}%), scheduled operatory time, and procedural stress index. Recommended priority contact 24 hours prior.
                      </p>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-zinc-900/20 p-4 rounded-xl border border-zinc-900 text-xs">
                      <div>
                        <span className="text-zinc-500 block">Procedure</span>
                        <span className="text-white font-bold text-emerald-400">{details.procedure}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Clinician</span>
                        <span className="text-white font-bold">{details.doctor.name}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-zinc-500 block">Chair & Operatory</span>
                        <span className="text-white font-bold">{details.chair}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-zinc-500 block">Date & Time</span>
                        <span className="text-white font-mono">{details.date} &bull; {details.startTime}</span>
                      </div>
                    </div>

                    {/* Treatment Plan */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Active Treatment Plan</span>
                      <p className="text-xs text-zinc-300 bg-zinc-900/10 p-3 rounded-xl border border-zinc-900 leading-relaxed">
                        {details.patient.currentTreatment}
                      </p>
                    </div>

                    {/* Financial balance */}
                    <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-900 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider">Financial Balance</span>
                        <span className="text-sm font-bold text-white">{details.patient.financialBalance}</span>
                      </div>
                      <DollarSign className="w-5 h-5 text-zinc-500" />
                    </div>

                    {/* Trigger Reminders Simulator */}
                    <div className="space-y-2 pt-2 border-t border-zinc-900">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Clinical Communication Simulator</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => { setSimAppt(details); setSimType('sms'); setSimulatorOpen(true); }} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs flex flex-col items-center gap-1 text-zinc-300">
                          <MessageSquare className="w-4 h-4 text-emerald-400" /> SMS
                        </button>
                        <button onClick={() => { setSimAppt(details); setSimType('whatsapp'); setSimulatorOpen(true); }} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs flex flex-col items-center gap-1 text-zinc-300">
                          <Phone className="w-4 h-4 text-emerald-400" /> WhatsApp
                        </button>
                        <button onClick={() => { setSimAppt(details); setSimType('email'); setSimulatorOpen(true); }} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs flex flex-col items-center gap-1 text-zinc-300">
                          <Mail className="w-4 h-4 text-emerald-400" /> Email
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
