import { SupabaseClient } from '@supabase/supabase-js';

// Types
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
  duration: number; // minutes
  status: 'Confirmed' | 'Pending' | 'In-Progress' | 'Completed' | 'Cancelled';
  category: 'Consultation' | 'Treatment' | 'Surgery' | 'Lab' | 'Recall';
  isRecurring: boolean;
}

export interface TreatmentItem {
  toothNumber: string;
  procedure: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  estimatedCost: number;
  assignedDoctor: string;
  appointmentDate?: string;
  completionDate?: string;
}

export interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  remainingBalance: number;
  priority: 'Urgent' | 'High' | 'Standard' | 'Low';
  progress: number; // Completion percentage
  treatingDoctor: string;
  createdDate: string;
  items: TreatmentItem[];
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  issueDate: string;
  dueDate: string;
  treatmentItems: { code: string; name: string; fee: number; insurance: number; copay: number }[];
  insuranceCoveragePercent: number;
  insuranceClaimStatus: 'None' | 'Pending' | 'Approved' | 'Rejected' | 'Resubmitted';
  insuranceProvider: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid' | 'Refunded';
  amountPaid: number;
  notes: string;
  attachments: string[];
}

export interface BillingPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Online Gateway';
  recordedAt: string;
  type: 'Payment' | 'Refund' | 'Partial';
  receiptNumber: string;
}

export interface PatientCase {
  id: string;
  name: string;
  status: 'In Design' | 'Milling' | 'Sintering' | 'Finished' | 'Delivered' | 'On Hold';
  priority: 'Urgent' | 'High' | 'Standard' | 'Low';
  clinician: string;
  stage: string;
  progress: number;
  createdDate: string;
  dueDate: string;
  notes: string;
}

export interface ClinicalNote {
  id: string;
  title: string;
  timestamp: string;
  author: string;
  locked: boolean;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  attachments: string[];
}

export interface PatientDocument {
  id: string;
  name: string;
  type: 'Consent Form' | 'Lab Prescription' | 'Referral Letter' | 'Medical Report' | 'STL File' | 'Clinical Photo';
  url: string;
  date: string;
  status?: 'Pending' | 'Accepted' | 'Rejected' | 'Info Requested';
  referralTimeline?: { date: string; action: string; note: string; actor: string }[];
}

// Default Seed Data Generators
const getDefaultAppointments = (patientId: string): Appointment[] => [
  {
    id: `APT-${patientId}-1`,
    patientId,
    patientName: "Arthur Pendragon",
    doctorId: "DR-01",
    doctorName: "Dr. Ahmed",
    procedure: "Crown Preparation",
    chair: "Chair A",
    date: "2026-08-10",
    startTime: "09:00",
    duration: 60,
    status: "Confirmed",
    category: "Treatment",
    isRecurring: false
  },
  {
    id: `APT-${patientId}-2`,
    patientId,
    patientName: "Arthur Pendragon",
    doctorId: "DR-01",
    doctorName: "Dr. Ahmed",
    procedure: "Veneer Delivery",
    chair: "Chair A",
    date: "2026-08-17",
    startTime: "10:15",
    duration: 90,
    status: "Pending",
    category: "Treatment",
    isRecurring: false
  },
  {
    id: `APT-${patientId}-3`,
    patientId,
    patientName: "Arthur Pendragon",
    doctorId: "DR-02",
    doctorName: "Dr. Sarah Jenkins",
    procedure: "Implant Consultation",
    chair: "Chair B",
    date: "2026-08-25",
    startTime: "11:30",
    duration: 45,
    status: "Pending",
    category: "Consultation",
    isRecurring: false
  }
];

const getDefaultInvoices = (patientId: string): BillingInvoice[] => [
  {
    id: `INV-${patientId}-1`,
    invoiceNumber: `INV-2026-${patientId}-1`,
    patientId,
    patientName: "Arthur Pendragon",
    doctorName: "Dr. Ahmed",
    clinicName: "Main Clinic",
    issueDate: "2026-07-20",
    dueDate: "2026-08-03",
    treatmentItems: [
      { code: "D6010", name: "Surgical Implant Placement (#36)", fee: 2850, insurance: 1800, copay: 1050 },
      { code: "D6056", name: "Custom Abutment Fabrication", fee: 1200, insurance: 800, copay: 400 }
    ],
    insuranceCoveragePercent: 60,
    insuranceClaimStatus: "Approved",
    insuranceProvider: "Delta Dental",
    paymentStatus: "Partially Paid",
    amountPaid: 2600,
    notes: "Awaiting final co-pay settlement.",
    attachments: []
  },
  {
    id: `INV-${patientId}-2`,
    invoiceNumber: `INV-2026-${patientId}-2`,
    patientId,
    patientName: "Arthur Pendragon",
    doctorName: "Dr. Ahmed",
    clinicName: "Main Clinic",
    issueDate: "2026-07-28",
    dueDate: "2026-08-11",
    treatmentItems: [
      { code: "D6058", name: "Porcelain/Zirconia Crown (#36)", fee: 1950, insurance: 1200, copay: 750 }
    ],
    insuranceCoveragePercent: 60,
    insuranceClaimStatus: "Pending",
    insuranceProvider: "Delta Dental",
    paymentStatus: "Pending",
    amountPaid: 0,
    notes: "Pre-auth approved. Invoice dispatched to insurer.",
    attachments: []
  }
];

const getDefaultPayments = (patientId: string): BillingPayment[] => [
  {
    id: `PAY-${patientId}-1`,
    invoiceId: `INV-${patientId}-1`,
    invoiceNumber: `INV-2026-${patientId}-1`,
    patientId,
    patientName: "Arthur Pendragon",
    amount: 2600,
    paymentMethod: "Credit Card",
    recordedAt: "2026-07-21T14:30:00Z",
    type: "Payment",
    receiptNumber: `REC-2026-${patientId}-1`
  }
];

const getDefaultTreatmentPlans = (patientId: string): TreatmentPlan[] => [
  {
    id: `TX-${patientId}-1`,
    title: "Premium Maxillary Zirconia Bridge Rehabilitation",
    description: "Multi-stage implant and prosthetic replacement of compromised maxillary posterior teeth.",
    estimatedCost: 15800,
    remainingBalance: 9800,
    priority: "High",
    progress: 35,
    treatingDoctor: "Dr. Ahmed",
    createdDate: "2026-07-10",
    items: [
      { toothNumber: "16", procedure: "Implant Placement D6010", status: "Completed", estimatedCost: 2850, assignedDoctor: "Dr. Ahmed", completionDate: "2026-07-15" },
      { toothNumber: "26", procedure: "Implant Placement D6010", status: "Completed", estimatedCost: 2850, assignedDoctor: "Dr. Ahmed", completionDate: "2026-07-15" },
      { toothNumber: "14", procedure: "Pre-prosthetic Abutment D6056", status: "In Progress", estimatedCost: 1200, assignedDoctor: "Dr. Ahmed", appointmentDate: "2026-08-10" },
      { toothNumber: "15", procedure: "Pre-prosthetic Abutment D6056", status: "In Progress", estimatedCost: 1200, assignedDoctor: "Dr. Ahmed", appointmentDate: "2026-08-10" },
      { toothNumber: "11", procedure: "CAD/CAM Crown prep D6058", status: "Pending", estimatedCost: 1950, assignedDoctor: "Dr. Ahmed" },
      { toothNumber: "21", procedure: "CAD/CAM Crown prep D6058", status: "Pending", estimatedCost: 1950, assignedDoctor: "Dr. Ahmed" }
    ]
  }
];

// Service Implementations
export const clinicalService = {
  // --- PATIENTS DIRECTORY ---
  async getPatients(supabase: SupabaseClient, demoMode: boolean): Promise<any[]> {
    if (demoMode) {
      const key = `healthos_patients_list`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const defaults = [
        {
          id: "PTS-9412",
          name: "Arthur Pendragon",
          photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
          age: 52,
          gender: "Male",
          bloodGroup: "O+",
          allergyStatus: "Penicillin Allergy",
          medicalAlerts: ["Type II Diabetes", "Hypertension", "Penicillin Hypersensitivity"],
          phone: "+1 (555) 381-9921",
          email: "arthur.p@camelot.org",
          primaryDoctor: "Dr. Ahmed",
          currentTreatment: "Full Arch Zirconia Bridge",
          status: "Under Treatment",
          lastVisit: "2026-07-10",
          nextAppointment: "2026-07-18 09:00 AM (Crown Preparation)",
          aiRiskFlag: "High",
          riskDescription: "Elevated periodontal inflammation score; diabetic clearance advised.",
          summary: "Patient presents with generalized tooth mobility in the maxillary arch. Seeking a fixed, high-aesthetic solution.",
          medicalHistory: ["Type II Diabetes diagnosed in 2018 (controlled)", "Hypertension under Lisinopril therapy"],
          medications: ["Metformin 500mg BID", "Lisinopril 10mg QD"],
          allergies: ["Penicillin (severe hives)", "Latex (mild contact dermatitis)"],
          timeline: [
            { date: "Jul 10, 2026", title: "CBCT Double Arch Scan Completed", category: "Imaging", description: "CBCT reveals 7.5mm alveolar bone depth in anterior segments." }
          ],
          cases: [
            {
              id: "CASE-9412",
              name: "Full Arch Maxillary Zirconia Bridge",
              status: "In Design",
              priority: "High",
              clinician: "Dr. Ahmed",
              stage: "Virtual Articulation & STL Alignment",
              progress: 35,
              createdDate: "2026-07-10",
              dueDate: "2026-07-25",
              notes: "Keep minimum facial connector area at 12mm^2."
            }
          ]
        }
      ];
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    const { data, error } = await (supabase as any)
      .from('healthos_patients')
      .select('*, healthos_patient_cases(*)');

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      photoUrl: row.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
      age: row.age,
      gender: row.gender,
      bloodGroup: row.blood_group,
      allergyStatus: row.allergy_status,
      medicalAlerts: row.medical_alerts || [],
      phone: row.phone,
      email: row.email,
      primaryDoctor: row.primary_doctor,
      currentTreatment: row.current_treatment,
      status: row.status,
      lastVisit: row.last_visit,
      nextAppointment: row.next_appointment,
      aiRiskFlag: row.ai_risk_flag,
      riskDescription: row.risk_description,
      summary: row.summary,
      medicalHistory: row.medical_history || [],
      medications: row.medications || [],
      allergies: row.allergies || [],
      timeline: row.timeline || [],
      cases: (row.healthos_patient_cases || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        priority: c.priority,
        clinician: c.clinician,
        stage: c.stage,
        progress: c.progress,
        createdDate: c.created_date,
        dueDate: c.due_date,
        notes: c.notes
      }))
    }));
  },

  async getAllAppointments(supabase: SupabaseClient, demoMode: boolean): Promise<Appointment[]> {
    if (demoMode) {
      const defaultPatients = await this.getPatients(supabase, true);
      const appts: Appointment[] = [];
      for (const p of defaultPatients) {
        const pAppts = await this.getAppointments(supabase, p.id, true);
        appts.push(...pAppts);
      }
      return appts;
    }

    const { data, error } = await (supabase as any)
      .from('healthos_appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      procedure: row.procedure,
      chair: row.chair,
      date: row.appointment_date,
      startTime: String(row.start_time).slice(0, 5),
      duration: row.duration_minutes,
      status: row.status,
      category: row.category,
      isRecurring: row.is_recurring
    }));
  },

  // --- APPOINTMENTS ---
  async getAppointments(supabase: SupabaseClient, patientId: string, demoMode: boolean): Promise<Appointment[]> {
    if (demoMode) {
      const key = `healthos_appts_${patientId}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const defaults = getDefaultAppointments(patientId);
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    const { data, error } = await supabase
      .from('healthos_appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      procedure: row.procedure,
      chair: row.chair,
      date: row.appointment_date,
      startTime: String(row.start_time).slice(0, 5),
      duration: row.duration_minutes,
      status: row.status,
      category: row.category,
      isRecurring: row.is_recurring
    }));
  },

  async updateAppointmentStatus(supabase: SupabaseClient, patientId: string, appointmentId: string, status: Appointment['status'], demoMode: boolean): Promise<void> {
    if (demoMode) {
      const key = `healthos_appts_${patientId}`;
      const appts = await this.getAppointments(supabase, patientId, true);
      const updated = appts.map(a => a.id === appointmentId ? { ...a, status } : a);
      localStorage.setItem(key, JSON.stringify(updated));
      return;
    }

    // Map custom UI statuses to allowed database constraints
    let dbStatus = status;
    const { error } = await supabase
      .from('healthos_appointments')
      .update({ status: dbStatus })
      .eq('id', appointmentId);

    if (error) throw error;
  },

  async rescheduleAppointment(supabase: SupabaseClient, patientId: string, appointmentId: string, date: string, startTime: string, doctorId: string, doctorName: string, chair: string, demoMode: boolean): Promise<void> {
    if (demoMode) {
      const key = `healthos_appts_${patientId}`;
      const appts = await this.getAppointments(supabase, patientId, true);
      const updated = appts.map(a => a.id === appointmentId ? { ...a, date, startTime, doctorId, doctorName, chair } : a);
      localStorage.setItem(key, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('healthos_appointments')
      .update({
        appointment_date: date,
        start_time: startTime,
        doctor_id: doctorId,
        doctor_name: doctorName,
        chair: chair
      })
      .eq('id', appointmentId);

    if (error) throw error;
  },

  async createAppointment(supabase: SupabaseClient, patientId: string, patientName: string, appointment: Omit<Appointment, 'id' | 'patientId' | 'patientName'>, demoMode: boolean): Promise<Appointment> {
    const newId = `APT-${patientId}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullAppt: Appointment = {
      ...appointment,
      id: newId,
      patientId,
      patientName
    };

    if (demoMode) {
      const key = `healthos_appts_${patientId}`;
      const appts = await this.getAppointments(supabase, patientId, true);
      const updated = [fullAppt, ...appts];
      localStorage.setItem(key, JSON.stringify(updated));
      return fullAppt;
    }

    const { error } = await supabase
      .from('healthos_appointments')
      .insert({
        id: fullAppt.id,
        patient_id: fullAppt.patientId,
        patient_name: fullAppt.patientName,
        doctor_id: fullAppt.doctorId,
        doctor_name: fullAppt.doctorName,
        procedure: fullAppt.procedure,
        chair: fullAppt.chair,
        appointment_date: fullAppt.date,
        start_time: fullAppt.startTime,
        duration_minutes: fullAppt.duration,
        status: fullAppt.status,
        category: fullAppt.category,
        is_recurring: fullAppt.isRecurring
      });

    if (error) throw error;
    return fullAppt;
  },

  // --- BILLING INVOICES & PAYMENTS ---
  async getInvoices(supabase: SupabaseClient, patientId: string, demoMode: boolean): Promise<BillingInvoice[]> {
    if (demoMode) {
      const key = `healthos_invoices_${patientId}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const defaults = getDefaultInvoices(patientId);
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    const { data, error } = await supabase
      .from('healthos_billing_invoices')
      .select('*')
      .eq('patient_id', patientId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      patientId: row.patient_id,
      patientName: row.patient_name,
      doctorName: row.doctor_name,
      clinicName: row.clinic_name,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      treatmentItems: row.treatment_items || [],
      insuranceCoveragePercent: Number(row.insurance_coverage_percent || 0),
      insuranceClaimStatus: row.insurance_claim_status,
      insuranceProvider: row.insurance_provider,
      paymentStatus: row.payment_status,
      amountPaid: Number(row.amount_paid || 0),
      notes: row.notes,
      attachments: row.attachments || []
    }));
  },

  async createInvoice(supabase: SupabaseClient, patientId: string, patientName: string, doctorName: string, invoice: Omit<BillingInvoice, 'id' | 'patientId' | 'patientName' | 'doctorName'>, demoMode: boolean): Promise<BillingInvoice> {
    const newId = `inv_id_${Math.floor(100000 + Math.random() * 900000)}`;
    const fullInvoice: BillingInvoice = {
      ...invoice,
      id: newId,
      patientId,
      patientName,
      doctorName
    };

    if (demoMode) {
      const key = `healthos_invoices_${patientId}`;
      const invoices = await this.getInvoices(supabase, patientId, true);
      const updated = [fullInvoice, ...invoices];
      localStorage.setItem(key, JSON.stringify(updated));
      return fullInvoice;
    }

    const { error } = await supabase
      .from('healthos_billing_invoices')
      .insert({
        invoice_number: fullInvoice.invoiceNumber,
        patient_id: fullInvoice.patientId,
        patient_name: fullInvoice.patientName,
        doctor_name: fullInvoice.doctorName,
        clinic_name: fullInvoice.clinicName,
        issue_date: fullInvoice.issueDate,
        due_date: fullInvoice.dueDate,
        treatment_items: fullInvoice.treatmentItems,
        insurance_coverage_percent: fullInvoice.insuranceCoveragePercent,
        insurance_claim_status: fullInvoice.insuranceClaimStatus,
        insurance_provider: fullInvoice.insuranceProvider,
        payment_status: fullInvoice.paymentStatus,
        amount_paid: fullInvoice.amountPaid,
        notes: fullInvoice.notes,
        attachments: fullInvoice.attachments
      });

    if (error) throw error;
    return fullInvoice;
  },

  async getPayments(supabase: SupabaseClient, patientId: string, demoMode: boolean): Promise<BillingPayment[]> {
    if (demoMode) {
      const key = `healthos_payments_${patientId}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const defaults = getDefaultPayments(patientId);
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    const { data, error } = await supabase
      .from('healthos_billing_payments')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      invoiceId: row.invoice_id,
      invoiceNumber: row.invoice_number,
      patientId: row.patient_id,
      patientName: row.patient_name,
      amount: Number(row.amount || 0),
      paymentMethod: row.payment_method,
      recordedAt: row.recorded_at,
      type: row.type,
      receiptNumber: row.receipt_number
    }));
  },

  async recordPayment(supabase: SupabaseClient, patientId: string, patientName: string, payment: Omit<BillingPayment, 'id' | 'patientId' | 'patientName'>, demoMode: boolean): Promise<BillingPayment> {
    const newId = `pay_id_${Math.floor(100000 + Math.random() * 900000)}`;
    const fullPayment: BillingPayment = {
      ...payment,
      id: newId,
      patientId,
      patientName
    };

    if (demoMode) {
      const paymentsKey = `healthos_payments_${patientId}`;
      const invoicesKey = `healthos_invoices_${patientId}`;
      const payments = await this.getPayments(supabase, patientId, true);
      const invoices = await this.getInvoices(supabase, patientId, true);

      // Save payment
      const updatedPayments = [fullPayment, ...payments];
      localStorage.setItem(paymentsKey, JSON.stringify(updatedPayments));

      // Update invoice amountPaid and paymentStatus
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === fullPayment.invoiceId) {
          const totalPaid = inv.amountPaid + fullPayment.amount;
          const totalFee = inv.treatmentItems.reduce((acc, curr) => acc + curr.fee, 0);
          const claimAmt = inv.insuranceClaimStatus === 'Approved' ? inv.treatmentItems.reduce((acc, curr) => acc + curr.insurance, 0) : 0;
          const userShare = totalFee - claimAmt;
          
          let paymentStatus: BillingInvoice['paymentStatus'] = inv.paymentStatus;
          if (totalPaid >= userShare) {
            paymentStatus = 'Paid';
          } else if (totalPaid > 0) {
            paymentStatus = 'Partially Paid';
          }
          return {
            ...inv,
            amountPaid: totalPaid,
            paymentStatus
          };
        }
        return inv;
      });
      localStorage.setItem(invoicesKey, JSON.stringify(updatedInvoices));
      return fullPayment;
    }

    // 1. Record payment
    const { error: payError } = await supabase
      .from('healthos_billing_payments')
      .insert({
        invoice_id: fullPayment.invoiceId,
        invoice_number: fullPayment.invoiceNumber,
        patient_id: fullPayment.patientId,
        patient_name: fullPayment.patientName,
        amount: fullPayment.amount,
        payment_method: fullPayment.paymentMethod,
        recorded_at: fullPayment.recordedAt,
        type: fullPayment.type,
        receipt_number: fullPayment.receiptNumber
      });

    if (payError) throw payError;

    // 2. Fetch invoice to update
    const { data: invRow, error: getError } = await supabase
      .from('healthos_billing_invoices')
      .select('*')
      .eq('id', fullPayment.invoiceId)
      .single();

    if (!getError && invRow) {
      const newPaid = Number(invRow.amount_paid || 0) + fullPayment.amount;
      const items = (invRow.treatment_items || []) as any[];
      const totalFee = items.reduce((acc, curr) => acc + (curr.fee || 0), 0);
      const claimAmt = invRow.insurance_claim_status === 'Approved' ? items.reduce((acc, curr) => acc + (curr.insurance || 0), 0) : 0;
      const userShare = totalFee - claimAmt;
      
      let newStatus: BillingInvoice['paymentStatus'] = 'Pending';
      if (newPaid >= userShare) {
        newStatus = 'Paid';
      } else if (newPaid > 0) {
        newStatus = 'Partially Paid';
      }

      await supabase
        .from('healthos_billing_invoices')
        .update({
          amount_paid: newPaid,
          payment_status: newStatus
        })
        .eq('id', fullPayment.invoiceId);
    }

    return fullPayment;
  },

  // --- TREATMENT PLANS ---
  async getTreatmentPlans(supabase: SupabaseClient, patientId: string, demoMode: boolean): Promise<TreatmentPlan[]> {
    if (demoMode) {
      const key = `healthos_tx_plans_${patientId}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const defaults = getDefaultTreatmentPlans(patientId);
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    const { data, error } = await supabase
      .from('healthos_patient_records')
      .select('treatment_plans')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) throw error;
    return data?.treatment_plans || [];
  },

  async saveTreatmentPlans(supabase: SupabaseClient, patientId: string, plans: TreatmentPlan[], demoMode: boolean): Promise<void> {
    if (demoMode) {
      const key = `healthos_tx_plans_${patientId}`;
      localStorage.setItem(key, JSON.stringify(plans));
      return;
    }

    const { error } = await supabase
      .from('healthos_patient_records')
      .upsert({
        patient_id: patientId,
        treatment_plans: plans,
        updated_at: new Date().toISOString()
      }, { onConflict: 'patient_id' });

    if (error) throw error;
  },

  // --- SOAP CLINICAL NOTES ---
  async getClinicalNotes(supabase: SupabaseClient, patientId: string, demoMode: boolean): Promise<ClinicalNote[]> {
    if (demoMode) {
      const key = `healthos_soap_${patientId}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const defaults: ClinicalNote[] = [
        {
          id: `NOTE-${patientId}-1`,
          title: "Surgical Implant #36 SOAP Log",
          timestamp: "2026-07-15 11:30 AM",
          author: "Dr. Ahmed",
          locked: true,
          soap: {
            subjective: "Patient Arthur Pendragon reports for surgical follow-up. Zero postoperative bleeding, minor aesthetic complaints on tooth #35 occlusion margin.",
            objective: "Radiographic slice scan verifies osteointegration stability of 35 Ncm torque implant at site #36. Surrounding tissues healthy, pink. Sutures intact.",
            assessment: "Site #36 is healing normally. Integration coefficient D2. Patient is cleared for final abutment preparation course in 4 weeks.",
            plan: "Discharged with post-surgical soft rinse instructions. Scheduled recall in 30 days for prosthetic abutment scan."
          },
          attachments: []
        }
      ];
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    const { data, error } = await supabase
      .from('healthos_patient_records')
      .select('soap_notes')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) throw error;
    return data?.soap_notes || [];
  },

  async saveClinicalNotes(supabase: SupabaseClient, patientId: string, notes: ClinicalNote[], demoMode: boolean): Promise<void> {
    if (demoMode) {
      const key = `healthos_soap_${patientId}`;
      localStorage.setItem(key, JSON.stringify(notes));
      return;
    }

    const { error } = await supabase
      .from('healthos_patient_records')
      .upsert({
        patient_id: patientId,
        soap_notes: notes,
        updated_at: new Date().toISOString()
      }, { onConflict: 'patient_id' });

    if (error) throw error;
  },

  // --- DOCUMENTS ---
  async getDocuments(supabase: SupabaseClient, patientId: string, demoMode: boolean): Promise<PatientDocument[]> {
    if (demoMode) {
      const key = `healthos_docs_${patientId}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const defaults: PatientDocument[] = [
        {
          id: "doc-1",
          name: "Informed Consent for Full-Arch Prosthetics.pdf",
          type: "Consent Form",
          url: "#",
          date: "2026-07-01",
          status: "Accepted",
          referralTimeline: [
            { date: "2026-07-01", action: "Signed", note: "Signed securely via Patient Portal", actor: "Patient" }
          ]
        },
        {
          id: "doc-2",
          name: "CAD_CAM Lab Sintering Prescription Form.pdf",
          type: "Lab Prescription",
          url: "#",
          date: "2026-07-10"
        },
        {
          id: "doc-3",
          name: "Maxillofacial Surgeon Referral Letter.pdf",
          type: "Referral Letter",
          url: "#",
          date: "2026-06-28",
          status: "Pending",
          referralTimeline: [
            { date: "2026-06-28", action: "Received", note: "Referral from Dr. Adams", actor: "Dr. Adams" }
          ]
        }
      ];
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    const { data, error } = await supabase
      .from('healthos_patient_records')
      .select('documents')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) throw error;
    return data?.documents || [];
  },

  async saveDocuments(supabase: SupabaseClient, patientId: string, docs: PatientDocument[], demoMode: boolean): Promise<void> {
    if (demoMode) {
      const key = `healthos_docs_${patientId}`;
      localStorage.setItem(key, JSON.stringify(docs));
      return;
    }

    const { error } = await supabase
      .from('healthos_patient_records')
      .upsert({
        patient_id: patientId,
        documents: docs,
        updated_at: new Date().toISOString()
      }, { onConflict: 'patient_id' });

    if (error) throw error;
  },

  // --- CLINICAL HISTORY ---
  async getClinicalHistory(supabase: SupabaseClient, patientId: string, demoMode: boolean): Promise<any> {
    if (demoMode) {
      const key = `healthos_history_${patientId}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      return {};
    }

    const { data, error } = await supabase
      .from('healthos_clinical_histories')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) throw error;
    return data || {};
  },

  async saveClinicalHistory(supabase: SupabaseClient, patientId: string, history: any, demoMode: boolean): Promise<void> {
    if (demoMode) {
      const key = `healthos_history_${patientId}`;
      localStorage.setItem(key, JSON.stringify(history));
      return;
    }

    const { error } = await supabase
      .from('healthos_clinical_histories')
      .upsert({
        patient_id: patientId,
        ...history,
        updated_at: new Date().toISOString()
      }, { onConflict: 'patient_id' });

    if (error) throw error;
  },

  // --- PATIENTS BASE ---
  async updatePatientStatus(supabase: SupabaseClient, patientId: string, status: 'Active' | 'New' | 'Under Treatment' | 'Completed', demoMode: boolean): Promise<void> {
    if (demoMode) {
      const key = `healthos_patients_list`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const list = JSON.parse(saved) as any[];
        const updated = list.map((p: any) => p.id === patientId ? { ...p, status } : p);
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return;
    }

    const { error } = await supabase
      .from('healthos_patients')
      .update({ status })
      .eq('id', patientId);

    if (error) throw error;
  },

  // --- IMAGING GALLERY ---
  async getImagingGallery(supabase: SupabaseClient, patientId: string, demoMode: boolean): Promise<any[]> {
    if (demoMode) {
      const key = `healthos_imaging_${patientId}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const defaults = [
        { id: "img-1", name: "Maxillary CBCT Double Arch (High-Res)", category: "CBCT", url: "/placeholder-imaging.jpg", date: "2026-07-10" },
        { id: "img-2", name: "3Shape Upper Jaw Arch Scan STL", category: "Intraoral Scan", url: "/placeholder-imaging.jpg", date: "2026-07-03" },
        { id: "img-3", name: "12-Angle Facial Portrait DSD-v2", category: "Clinical Photo", url: "/placeholder-imaging.jpg", date: "2026-07-12" },
        { id: "img-4", name: "Pre-op Alveolar Ridge Radiograph #36", category: "Radiograph", url: "/placeholder-imaging.jpg", date: "2026-07-02" }
      ];
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    const { data, error } = await supabase
      .from('healthos_patient_records')
      .select('imaging_gallery')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) throw error;
    return data?.imaging_gallery || [];
  },

  async saveImagingGallery(supabase: SupabaseClient, patientId: string, gallery: any[], demoMode: boolean): Promise<void> {
    if (demoMode) {
      const key = `healthos_imaging_${patientId}`;
      localStorage.setItem(key, JSON.stringify(gallery));
      return;
    }

    const { error } = await supabase
      .from('healthos_patient_records')
      .upsert({
        patient_id: patientId,
        imaging_gallery: gallery,
        updated_at: new Date().toISOString()
      }, { onConflict: 'patient_id' });

    if (error) throw error;
  }
};
