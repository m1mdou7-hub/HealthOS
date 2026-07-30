'use client';

import { WorkspaceSidebarNav } from './Workspace/WorkspaceSidebarNav';
import { WorkspaceTabPanel } from './Workspace/WorkspaceTabPanel';
import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  User,
  Activity,
  Sparkles,
  Percent,
  Sliders,
  History,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  PlusCircle,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  Bookmark,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Receipt,
  RotateCcw,
  SlidersHorizontal,
  Send,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// --- ENTERPRISE BILLING INTERFACES ---
interface TreatmentItem {
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage
  tax: number; // percentage
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  clinicName: string;
  issueDate: string;
  dueDate: string;
  treatmentItems: TreatmentItem[];
  insuranceCoveragePercent: number; // e.g., 80
  insuranceClaimStatus: 'None' | 'Pending' | 'Approved' | 'Rejected' | 'Resubmitted';
  insuranceProvider: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid' | 'Refunded';
  amountPaid: number;
  notes: string;
  attachments: string[];
}

interface Estimate {
  id: string;
  estimateNumber: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  issueDate: string;
  expirationDate: string;
  treatmentItems: TreatmentItem[];
  approvalStatus: 'Pending Approval' | 'Approved' | 'Expired';
}

interface InsuranceClaim {
  id: string;
  invoiceNumber: string;
  patientName: string;
  provider: string;
  policyNumber: string;
  preAuthRequired: boolean;
  preAuthStatus: 'Approved' | 'Not Required' | 'Pending' | 'Denied';
  amountClaimed: number;
  amountApproved: number;
  status: 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
  timeline: { title: string; date: string; description: string }[];
}

interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Online Gateway';
  timestamp: string;
  type: 'Payment' | 'Refund' | 'Partial';
  receiptNumber: string;
}

interface TimelineEvent {
  id: string;
  type: 'invoice_created' | 'payment_received' | 'claim_submitted' | 'claim_approved' | 'refund_issued';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  user: string;
}

// --- INITIAL REALISTIC ENTERPRISE MOCK DATA ---
const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'I-101',
    invoiceNumber: 'INV-2026-001',
    patientName: 'Demo Patient A',
    patientId: 'PT-9904',
    doctorName: 'Dr. Catherine Avery',
    clinicName: 'HealthOS Main Campus',
    issueDate: '2026-07-10',
    dueDate: '2026-07-24',
    treatmentItems: [
      { code: 'D2740', name: 'Zirconia Crown (Tooth #14)', quantity: 1, unitPrice: 1250, discount: 5, tax: 8.25 },
      { code: 'D9223', name: 'Deep Sedation (First 15m)', quantity: 2, unitPrice: 220, discount: 0, tax: 0 }
    ],
    insuranceCoveragePercent: 80,
    insuranceClaimStatus: 'Approved',
    insuranceProvider: 'Delta Dental',
    paymentStatus: 'Paid',
    amountPaid: 1642.5,
    notes: 'Patient requested premium multi-layer zirconia. Patient responsiblity was paid in full via terminal.',
    attachments: ['DICOM_Preop_tooth14.zip', 'Signed_Fin_Responsibility.pdf']
  },
  {
    id: 'I-102',
    invoiceNumber: 'INV-2026-002',
    patientName: 'Demo Patient B',
    patientId: 'PT-3291',
    doctorName: 'Dr. Elena Rostova',
    clinicName: 'Westside Pediatric Dentistry',
    issueDate: '2026-07-12',
    dueDate: '2026-07-26',
    treatmentItems: [
      { code: 'D2962', name: 'Porcelain Veneer (Tooth #8)', quantity: 2, unitPrice: 1100, discount: 10, tax: 8.25 },
      { code: 'D1110', name: 'Prophylaxis - Adult cleaning', quantity: 1, unitPrice: 150, discount: 0, tax: 0 }
    ],
    insuranceCoveragePercent: 50,
    insuranceClaimStatus: 'Pending',
    insuranceProvider: 'Cigna Dental',
    paymentStatus: 'Pending',
    amountPaid: 0,
    notes: 'Pending insurance pre-auth and main claim payout. Client paid 50% copay on site.',
    attachments: ['Prep_Photos_SlightBite.png']
  },
  {
    id: 'I-103',
    invoiceNumber: 'INV-2026-003',
    patientName: 'Demo Patient C',
    patientId: 'PT-0007',
    doctorName: 'Dr. Catherine Avery',
    clinicName: 'Eastside Surgical Hub',
    issueDate: '2026-07-01',
    dueDate: '2026-07-15',
    treatmentItems: [
      { code: 'D6010', name: 'Surgical Implant Placement', quantity: 1, unitPrice: 2400, discount: 0, tax: 0 },
      { code: 'D6056', name: 'Prefabricated Abutment', quantity: 1, unitPrice: 650, discount: 0, tax: 0 },
      { code: 'D0330', name: 'Panoramic CBCT Radiographic Image', quantity: 1, unitPrice: 350, discount: 0, tax: 8.25 }
    ],
    insuranceCoveragePercent: 0,
    insuranceClaimStatus: 'None',
    insuranceProvider: 'Self-Pay',
    paymentStatus: 'Overdue',
    amountPaid: 1000,
    notes: 'Patient opted for installment structure. Initial deposit processed. Remaining balance past due.',
    attachments: ['CBCT_Maxilla_Scan_V2.stl']
  },
  {
    id: 'I-104',
    invoiceNumber: 'INV-2026-004',
    patientName: 'Demo Patient D',
    patientId: 'PT-4822',
    doctorName: 'Dr. Elena Rostova',
    clinicName: 'HealthOS Main Campus',
    issueDate: '2026-07-15',
    dueDate: '2026-07-29',
    treatmentItems: [
      { code: 'D4341', name: 'Periodontal Scaling & Root Planing', quantity: 4, unitPrice: 180, discount: 15, tax: 0 },
      { code: 'D1208', name: 'Topical Fluoride Application', quantity: 1, unitPrice: 60, discount: 0, tax: 0 }
    ],
    insuranceCoveragePercent: 80,
    insuranceClaimStatus: 'Rejected',
    insuranceProvider: 'MetLife Dental',
    paymentStatus: 'Partially Paid',
    amountPaid: 150,
    notes: 'MetLife rejected claim stating missing clinical charting evidence. Will resubmit with periodontal mapping notes.',
    attachments: ['Full_Mouth_Perio_Chart.pdf']
  },
  {
    id: 'I-105',
    invoiceNumber: 'INV-2026-005',
    patientName: 'Demo Patient E',
    patientId: 'PT-1102',
    doctorName: 'Dr. Robert Carter',
    clinicName: 'North Ward Urgent Care',
    issueDate: '2026-07-16',
    dueDate: '2026-07-30',
    treatmentItems: [
      { code: 'D7140', name: 'Extraction, Erupted Tooth', quantity: 1, unitPrice: 280, discount: 0, tax: 0 },
      { code: 'D9223', name: 'Deep Sedation (First 15m)', quantity: 1, unitPrice: 220, discount: 0, tax: 0 }
    ],
    insuranceCoveragePercent: 90,
    insuranceClaimStatus: 'Pending',
    insuranceProvider: 'Aetna Dental',
    paymentStatus: 'Pending',
    amountPaid: 0,
    notes: 'Emergency dental relief extraction. Claim filed electronically.',
    attachments: []
  }
];

const INITIAL_ESTIMATES: Estimate[] = [
  {
    id: 'E-501',
    estimateNumber: 'EST-2026-401',
    patientId: 'PT-2401',
    patientName: 'Demo Patient G',
    doctorName: 'Dr. Catherine Avery',
    clinicName: 'HealthOS Main Campus',
    issueDate: '2026-07-14',
    expirationDate: '2026-10-14',
    treatmentItems: [
      { code: 'D6010', name: 'Surgical Implant Placement', quantity: 2, unitPrice: 2400, discount: 10, tax: 0 },
      { code: 'D6056', name: 'Prefabricated Abutment', quantity: 2, unitPrice: 650, discount: 10, tax: 0 },
      { code: 'D6058', name: 'Abutment Supported Crown', quantity: 2, unitPrice: 1200, discount: 10, tax: 8.25 }
    ],
    approvalStatus: 'Pending Approval'
  },
  {
    id: 'E-502',
    estimateNumber: 'EST-2026-402',
    patientId: 'PT-2402',
    patientName: 'Demo Patient F',
    doctorName: 'Dr. Robert Carter',
    clinicName: 'North Ward Urgent Care',
    issueDate: '2026-07-15',
    expirationDate: '2026-08-15',
    treatmentItems: [
      { code: 'D2391', name: 'Resin Composite - 1 Surface', quantity: 3, unitPrice: 190, discount: 5, tax: 8.25 },
      { code: 'D1110', name: 'Prophylaxis - Adult cleaning', quantity: 1, unitPrice: 150, discount: 0, tax: 0 }
    ],
    approvalStatus: 'Approved'
  }
];

const INITIAL_CLAIMS: InsuranceClaim[] = [
  {
    id: 'CLM-001',
    invoiceNumber: 'INV-2026-001',
    patientName: 'Demo Patient A',
    provider: 'Delta Dental',
    policyNumber: 'DD-881290-A',
    preAuthRequired: true,
    preAuthStatus: 'Approved',
    amountClaimed: 1314.0,
    amountApproved: 1314.0,
    status: 'Approved',
    timeline: [
      { title: 'Claim Drafted', date: '2026-07-10 14:12', description: 'Generated from patient chart.' },
      { title: 'Claim Submitted', date: '2026-07-11 09:00', description: 'Transmitted via Clearinghouse API.' },
      { title: 'Adjudication Completed', date: '2026-07-13 16:45', description: 'デルタデンタル Approved with zero reductions.' }
    ]
  },
  {
    id: 'CLM-002',
    invoiceNumber: 'INV-2026-002',
    patientName: 'Demo Patient B',
    provider: 'Cigna Dental',
    policyNumber: 'CG-449102-X',
    preAuthRequired: false,
    preAuthStatus: 'Not Required',
    amountClaimed: 1165.0,
    amountApproved: 0,
    status: 'In Review',
    timeline: [
      { title: 'Claim Submitted', date: '2026-07-12 11:30', description: 'Transmitted via Cigna gateway.' },
      { title: 'In Review', date: '2026-07-14 08:15', description: 'Assigned to clinical evaluator for verification.' }
    ]
  },
  {
    id: 'CLM-004',
    invoiceNumber: 'INV-2026-004',
    patientName: 'Demo Patient D',
    provider: 'MetLife Dental',
    policyNumber: 'ML-992019-B',
    preAuthRequired: true,
    preAuthStatus: 'Pending',
    amountClaimed: 612.0,
    amountApproved: 0,
    status: 'Rejected',
    timeline: [
      { title: 'Claim Submitted', date: '2026-07-15 15:44', description: 'Transmitted electronic claim.' },
      { title: 'Claim Rejected', date: '2026-07-16 10:20', description: 'Rejected. Reason: Code D4341 requires complete periodontal staging chart.' }
    ]
  }
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  { id: 'PAY-881', invoiceNumber: 'INV-2026-001', patientName: 'Demo Patient A', amount: 1642.5, paymentMethod: 'Credit Card', timestamp: '2026-07-11 11:32', type: 'Payment', receiptNumber: 'REC-1192-01' },
  { id: 'PAY-882', invoiceNumber: 'INV-2026-003', patientName: 'Demo Patient C', amount: 1000.0, paymentMethod: 'Bank Transfer', timestamp: '2026-07-03 14:00', type: 'Payment', receiptNumber: 'REC-1192-02' },
  { id: 'PAY-883', invoiceNumber: 'INV-2026-004', patientName: 'Demo Patient D', amount: 150.0, paymentMethod: 'Cash', timestamp: '2026-07-15 17:10', type: 'Payment', receiptNumber: 'REC-1192-03' }
];

const INITIAL_TIMELINE: TimelineEvent[] = [
  { id: 'TL-01', type: 'invoice_created', title: 'Invoice INV-2026-005 generated', description: 'Emergency treatment extraction invoice generated for Demo Patient E.', timestamp: '2026-07-16 14:22', amount: 500, user: 'Dr. Robert Carter' },
  { id: 'TL-02', type: 'claim_submitted', title: 'Claim submitted to Aetna', description: 'Electronic claim submitted for Demo Patient E extraction.', timestamp: '2026-07-16 14:45', user: 'Billing Bot AI' },
  { id: 'TL-03', type: 'payment_received', title: 'Payment received for INV-2026-001', description: 'Credit card payment of $1,642.50 processed for Demo Patient A.', timestamp: '2026-07-11 11:32', amount: 1642.5, user: 'FrontDesk Jane' },
  { id: 'TL-04', type: 'claim_approved', title: 'Claim approved by Delta Dental', description: 'Delta Dental approved claim #DD-88129 for $1,314.00.', timestamp: '2026-07-13 16:45', amount: 1314.0, user: 'Delta Gateway' },
  { id: 'TL-05', type: 'refund_issued', title: 'Refund processed for PT-8821', description: 'Refund of $350.00 processed for overpaid laboratory fee.', timestamp: '2026-07-09 09:12', amount: 350, user: 'Supervisor Avery' }
];

// --- CHARTS & TREND DATA ---
const REVENUE_TREND_DATA = [
  { month: 'Jan', PatientPayment: 42000, InsuranceClaim: 68000, Total: 110000 },
  { month: 'Feb', PatientPayment: 46000, InsuranceClaim: 72000, Total: 118000 },
  { month: 'Mar', PatientPayment: 51000, InsuranceClaim: 80000, Total: 131000 },
  { month: 'Apr', PatientPayment: 49000, InsuranceClaim: 79000, Total: 128000 },
  { month: 'May', PatientPayment: 58000, InsuranceClaim: 94000, Total: 152000 },
  { month: 'Jun', PatientPayment: 62000, InsuranceClaim: 104000, Total: 166000 },
  { month: 'Jul', PatientPayment: 68000, InsuranceClaim: 112000, Total: 180000 }
];

const CLINIC_REVENUE_PIE = [
  { name: 'HealthOS Main Campus', value: 92450, color: '#10b981' },
  { name: 'North Ward Urgent Care', value: 34500, color: '#3b82f6' },
  { name: 'Westside Pediatric', value: 28900, color: '#f59e0b' },
  { name: 'Eastside Surgical Hub', value: 48000, color: '#8b5cf6' }
];

const DOCTOR_REVENUE_BAR = [
  { name: 'Dr. Avery', revenue: 104000 },
  { name: 'Dr. Rostova', revenue: 58000 },
  { name: 'Dr. Carter', revenue: 42000 }
];

const PROCEDURE_REVENUE_BAR = [
  { code: 'D6010 (Implant)', revenue: 84000 },
  { code: 'D2740 (Crown)', revenue: 62000 },
  { code: 'D2962 (Veneer)', revenue: 44000 },
  { code: 'D4341 (Scaling)', revenue: 14500 }
];

interface BillingPatientOption {
  id: string;
  name: string;
}

interface BillingSettings {
  currency: string;
  taxRatePercent: number;
  invoicePrefix: string;
  autoSubmitInsurance: boolean;
}

interface BillingWorkspaceProps {
  demoMode?: boolean;
  initialInvoices?: Invoice[];
  initialEstimates?: Estimate[];
  initialClaims?: InsuranceClaim[];
  initialPayments?: PaymentRecord[];
  initialTimelineEvents?: TimelineEvent[];
  initialPatients?: BillingPatientOption[];
  initialSettings?: BillingSettings;
}

const mapInvoiceRow = (row: any): Invoice => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  patientName: row.patient_name,
  patientId: row.patient_id,
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
  notes: row.notes || '',
  attachments: row.attachments || []
});

const mapClaimRow = (row: any): InsuranceClaim => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  patientName: row.patient_name,
  provider: row.provider,
  policyNumber: row.policy_number,
  preAuthRequired: row.pre_auth_required,
  preAuthStatus: row.pre_auth_status,
  amountClaimed: Number(row.amount_claimed || 0),
  amountApproved: Number(row.amount_approved || 0),
  status: row.status,
  timeline: row.timeline || []
});

export default function BillingWorkspace({
  demoMode = false,
  initialInvoices = [],
  initialEstimates = [],
  initialClaims = [],
  initialPayments = [],
  initialTimelineEvents = [],
  initialPatients = [],
  initialSettings
}: BillingWorkspaceProps) {
  // Navigation Tabs matching 10 requested areas
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'Invoices' | 'InvoiceDetails' | 'Payments' | 'Insurance' | 'Estimates' | 'Reports' | 'AIAssistant' | 'Timeline' | 'Settings'
  >('Dashboard');

  const [invoices, setInvoices] = useState<Invoice[]>(
    demoMode ? INITIAL_INVOICES : initialInvoices
  );
  const [estimates, setEstimates] = useState<Estimate[]>(
    demoMode ? INITIAL_ESTIMATES : initialEstimates
  );
  const [claims, setClaims] = useState<InsuranceClaim[]>(
    demoMode ? INITIAL_CLAIMS : initialClaims
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(
    demoMode ? INITIAL_PAYMENTS : initialPayments
  );
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(
    demoMode ? INITIAL_TIMELINE : initialTimelineEvents
  );
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState('');

  // Active Invoice selected for details view
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    (demoMode ? INITIAL_INVOICES[1]?.id : initialInvoices[0]?.id) || ''
  );

  // Interactive Form States (Invoice builder/detail, Payment creator, claim editor, etc)
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [invoiceDoctorFilter, setInvoiceDoctorFilter] = useState('All');
  const [invoiceClinicFilter, setInvoiceClinicFilter] = useState('All');

  // Quick payment form state
  const [payInvoiceNumber, setPayInvoiceNumber] = useState(
    (demoMode ? INITIAL_INVOICES[1]?.invoiceNumber : initialInvoices[0]?.invoiceNumber) || ''
  );
  const [payAmount, setPayAmount] = useState('1165.00');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Credit Card' | 'Bank Transfer' | 'Online Gateway'>('Credit Card');

  // Claim Resubmission Drawer / Model State
  const [resubmitClaimId, setResubmitClaimId] = useState<string | null>(null);
  const [resubmitCode, setResubmitCode] = useState('D4341');
  const [resubmitNotes, setResubmitNotes] = useState('Attached deep periodontal probing chart showing 5-7mm pocket depths.');

  // AI Assistant action states
  const [aiReportText, setAiReportText] = useState<string>('');
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);

  // Billing Settings configurations
  const [selectedCurrency, setSelectedCurrency] = useState(initialSettings?.currency || 'USD ($)');
  const [taxRatePercent, setTaxRatePercent] = useState(initialSettings?.taxRatePercent ?? 8.25);
  const [invoicePrefix, setInvoicePrefix] = useState(initialSettings?.invoicePrefix || 'INV-');
  const [autoSubmitInsurance, setAutoSubmitInsurance] = useState(initialSettings?.autoSubmitInsurance ?? false);

  // Calculate dynamic dashboard stats based on state
  const stats = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    const todayRevenue = payments
      .filter(payment => payment.timestamp.substring(0, 10) === today)
      .reduce((sum, payment) => sum + payment.amount, 0);
    let outstandingBalance = 0;
    let totalInvoiced = 0;
    let paidCount = 0;
    let pendingCount = 0;
    
    invoices.forEach(inv => {
      // Calculate total invoice value
      const totalVal = inv.treatmentItems.reduce((acc, item) => {
        const itemSub = item.quantity * item.unitPrice;
        const discountAmt = itemSub * (item.discount / 100);
        const taxableAmt = itemSub - discountAmt;
        const taxAmt = taxableAmt * (item.tax / 100);
        return acc + taxableAmt + taxAmt;
      }, 0);

      const balanceRemaining = totalVal - inv.amountPaid;
      totalInvoiced += totalVal;
      outstandingBalance += Math.max(balanceRemaining, 0);

      if (inv.paymentStatus === 'Paid') paidCount++;
      if (inv.paymentStatus === 'Pending' || inv.paymentStatus === 'Partially Paid') pendingCount++;
    });

    const activeClaims = claims.length;
    const averageInvoice = invoices.length ? totalInvoiced / invoices.length : 0;

    return {
      todayRevenue,
      outstandingBalance,
      paidCount,
      pendingCount,
      activeClaims,
      averageInvoice,
      totalInvoiced
    };
  }, [invoices, claims, payments]);

  const revenueTrendData = useMemo(() => {
    if (demoMode) return REVENUE_TREND_DATA;

    const months = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date();
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth() - (6 - offset));
      return {
        key: date.toISOString().slice(0, 7),
        month: date.toLocaleString('en', { month: 'short', timeZone: 'UTC' })
      };
    });

    return months.map(({ key, month }) => {
      const patientPayment = payments
        .filter(payment => payment.timestamp.substring(0, 7) === key)
        .reduce((sum, payment) => sum + payment.amount, 0);
      const insuranceClaim = key === new Date().toISOString().slice(0, 7)
        ? claims
            .filter(claim => claim.status === 'Approved')
            .reduce((sum, claim) => sum + claim.amountApproved, 0)
        : 0;
      return {
        month,
        PatientPayment: patientPayment,
        InsuranceClaim: insuranceClaim,
        Total: patientPayment + insuranceClaim
      };
    });
  }, [claims, demoMode, payments]);

  const clinicRevenueData = useMemo(() => {
    if (demoMode) return CLINIC_REVENUE_PIE;
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
    return Array.from(new Set(invoices.map(invoice => invoice.clinicName)))
      .map((name, index) => ({
        name,
        value: invoices
          .filter(invoice => invoice.clinicName === name)
          .reduce((sum, invoice) => sum + invoice.amountPaid, 0),
        color: colors[index % colors.length]
      }));
  }, [demoMode, invoices]);

  const doctorRevenueData = useMemo(() => {
    if (demoMode) return DOCTOR_REVENUE_BAR;
    return Array.from(new Set(invoices.map(invoice => invoice.doctorName))).map(name => ({
      name,
      revenue: invoices
        .filter(invoice => invoice.doctorName === name)
        .reduce((sum, invoice) => sum + invoice.amountPaid, 0)
    }));
  }, [demoMode, invoices]);

  const procedureRevenueData = useMemo(() => {
    if (demoMode) return PROCEDURE_REVENUE_BAR;
    const totals = new Map<string, number>();
    invoices.forEach(invoice => invoice.treatmentItems.forEach(item => {
      const key = `${item.code} (${item.name})`;
      totals.set(key, (totals.get(key) || 0) + item.quantity * item.unitPrice);
    }));
    return Array.from(totals, ([code, revenue]) => ({ code, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [demoMode, invoices]);

  // Selected Invoice reference
  const selectedInvoice = useMemo(() => {
    return invoices.find(inv => inv.id === selectedInvoiceId) || invoices[0];
  }, [invoices, selectedInvoiceId]);

  // Handle invoice detail calculations
  const invoiceCalculations = useMemo(() => {
    if (!selectedInvoice) return { subtotal: 0, discountTotal: 0, taxTotal: 0, grandTotal: 0, patientResponsibility: 0, insuranceCoverage: 0 };
    
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    selectedInvoice.treatmentItems.forEach(item => {
      const itemSub = item.quantity * item.unitPrice;
      const discAmt = itemSub * (item.discount / 100);
      const taxable = itemSub - discAmt;
      const taxAmt = taxable * (item.tax / 100);

      subtotal += itemSub;
      discountTotal += discAmt;
      taxTotal += taxAmt;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;
    const insuranceCoverage = (selectedInvoice.insuranceCoveragePercent / 100) * (subtotal - discountTotal);
    const patientResponsibility = grandTotal - insuranceCoverage;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      insuranceCoverage,
      patientResponsibility
    };
  }, [selectedInvoice]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = inv.patientName.toLowerCase().includes(invoiceSearch.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          inv.patientId.toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchStatus = invoiceStatusFilter === 'All' || inv.paymentStatus === invoiceStatusFilter;
      const matchDoctor = invoiceDoctorFilter === 'All' || inv.doctorName === invoiceDoctorFilter;
      const matchClinic = invoiceClinicFilter === 'All' || inv.clinicName === invoiceClinicFilter;
      return matchSearch && matchStatus && matchDoctor && matchClinic;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter, invoiceDoctorFilter, invoiceClinicFilter]);

  // Add custom payment
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBillingError('');
    if (!payInvoiceNumber.trim() || !payAmount.trim()) return;

    const matchedInvoice = invoices.find(inv => inv.invoiceNumber === payInvoiceNumber.trim());
    if (!matchedInvoice) return;

    const amt = parseFloat(payAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setBillingError('Enter a payment amount greater than zero.');
      return;
    }

    if (!demoMode) {
      setBillingBusy(true);
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const { data, error } = await (createClient() as any).rpc(
          'healthos_record_billing_payment',
          {
            target_invoice_id: matchedInvoice.id,
            payment_amount: amt,
            selected_payment_method: payMethod
          }
        );

        if (error) throw error;

        const paymentRow = data?.payment;
        const newPay: PaymentRecord = {
          id: paymentRow.id,
          invoiceNumber: paymentRow.invoice_number,
          patientName: paymentRow.patient_name,
          amount: Number(paymentRow.amount),
          paymentMethod: paymentRow.payment_method,
          timestamp: String(paymentRow.recorded_at).replace('T', ' ').slice(0, 16),
          type: paymentRow.type,
          receiptNumber: paymentRow.receipt_number
        };
        const log: TimelineEvent = {
          id: crypto.randomUUID(),
          type: 'payment_received',
          title: `Payment on ${matchedInvoice.invoiceNumber}`,
          description: `${payMethod} payment recorded for ${matchedInvoice.patientName}.`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          amount: amt,
          user: 'Practice Admin'
        };

        setPayments(prev => [newPay, ...prev]);
        setInvoices(prev => prev.map(inv => inv.id === matchedInvoice.id
          ? {
              ...inv,
              amountPaid: Number(data.amount_paid),
              paymentStatus: data.payment_status
            }
          : inv
        ));
        setTimelineEvents(prev => [log, ...prev]);
        setPayAmount('');
        alert(`Payment of $${amt.toFixed(2)} recorded successfully.`);
      } catch (error: any) {
        setBillingError(error?.message || 'Payment could not be recorded.');
      } finally {
        setBillingBusy(false);
      }
      return;
    }
    
    // Add payment history record
    const newPay: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-3)}`,
      invoiceNumber: payInvoiceNumber.trim(),
      patientName: matchedInvoice.patientName,
      amount: amt,
      paymentMethod: payMethod,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      type: 'Payment',
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setPayments(prev => [newPay, ...prev]);

    // Update Invoice payment state
    setInvoices(prev => prev.map(inv => {
      if (inv.invoiceNumber === payInvoiceNumber) {
        const totalPaid = inv.amountPaid + amt;
        // Calculate dynamic total
        const invTotal = inv.treatmentItems.reduce((acc, item) => {
          const s = item.quantity * item.unitPrice;
          return acc + (s - (s * item.discount / 100)) * (1 + item.tax / 100);
        }, 0);
        const status = totalPaid >= invTotal ? 'Paid' : 'Partially Paid';
        return {
          ...inv,
          amountPaid: totalPaid,
          paymentStatus: status
        };
      }
      return inv;
    }));

    // Add event log
    const log: TimelineEvent = {
      id: `TL-${Date.now()}`,
      type: 'payment_received',
      title: `Payment on ${payInvoiceNumber}`,
      description: `Successfully processed ${payMethod} payment of $${amt.toFixed(2)} from ${matchedInvoice.patientName}.`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      amount: amt,
      user: 'Practice Admin'
    };
    setTimelineEvents(prev => [log, ...prev]);

    // Reset Form
    setPayAmount('');
    alert(`Payment of $${amt.toFixed(2)} recorded successfully.`);
  };

  // Convert Estimate to Invoice
  const handleConvertEstimate = async (estId: string) => {
    const est = estimates.find(e => e.id === estId);
    if (!est) return;

    if (!demoMode) {
      setBillingBusy(true);
      setBillingError('');
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient() as any;
        const { data: createdInvoice, error: createError } = await supabase.rpc(
          'healthos_convert_billing_estimate',
          {
            target_estimate_id: est.id
          }
        );
        if (createError) throw createError;

        const newInvoice = mapInvoiceRow(createdInvoice);
        setInvoices(prev => [newInvoice, ...prev]);
        setEstimates(prev => prev.map(item => item.id === est.id
          ? { ...item, approvalStatus: 'Approved' }
          : item
        ));
        setTimelineEvents(prev => [{
          id: crypto.randomUUID(),
          type: 'invoice_created',
          title: `${newInvoice.invoiceNumber} converted from Estimate`,
          description: `Converted approved estimate ${est.estimateNumber} for ${est.patientName}.`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          user: 'Practice Admin'
        }, ...prev]);
        alert(`Estimate ${est.estimateNumber} converted to ${newInvoice.invoiceNumber}.`);
      } catch (error: any) {
        setBillingError(error?.message || 'Estimate could not be converted.');
      } finally {
        setBillingBusy(false);
      }
      return;
    }

    const newInvoiceNumber = `INV-2026-00${invoices.length + 1}`;
    const newInv: Invoice = {
      id: `I-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      patientName: est.patientName,
      patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: est.doctorName,
      clinicName: est.clinicName,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      treatmentItems: est.treatmentItems,
      insuranceCoveragePercent: 80,
      insuranceClaimStatus: 'Pending',
      insuranceProvider: 'Delta Dental',
      paymentStatus: 'Pending',
      amountPaid: 0,
      notes: `Converted from treatment plan estimate ${est.estimateNumber}.`,
      attachments: []
    };

    setInvoices(prev => [newInv, ...prev]);
    setEstimates(prev => prev.map(e => e.id === estId ? { ...e, approvalStatus: 'Approved' } : e));

    // Add Timeline event
    const log: TimelineEvent = {
      id: `TL-${Date.now()}`,
      type: 'invoice_created',
      title: `${newInvoiceNumber} converted from Estimate`,
      description: `Successfully converted approved estimate ${est.estimateNumber} for ${est.patientName}.`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      user: 'Clinical Director'
    };
    setTimelineEvents(prev => [log, ...prev]);
    
    alert(`Estimate ${est.estimateNumber} converted to active Invoice ${newInvoiceNumber}!`);
  };

  // Claim Resubmission handler
  const handleResubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitClaimId) return;

    if (!demoMode) {
      setBillingBusy(true);
      setBillingError('');
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const { data, error } = await (createClient() as any).rpc(
          'healthos_resubmit_billing_claim',
          {
            target_claim_id: resubmitClaimId,
            procedure_code: resubmitCode.trim(),
            resubmission_notes: resubmitNotes.trim()
          }
        );
        if (error) throw error;

        const updatedClaim = mapClaimRow(data);
        setClaims(prev => prev.map(claim => claim.id === updatedClaim.id ? updatedClaim : claim));
        setInvoices(prev => prev.map(invoice =>
          invoice.invoiceNumber === updatedClaim.invoiceNumber
            ? { ...invoice, insuranceClaimStatus: 'Resubmitted' }
            : invoice
        ));
        setTimelineEvents(prev => [{
          id: crypto.randomUUID(),
          type: 'claim_submitted',
          title: `Claim resubmitted for ${updatedClaim.invoiceNumber}`,
          description: `Corrected procedure code ${resubmitCode} sent to ${updatedClaim.provider}.`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          user: 'Practice Admin'
        }, ...prev]);
        setResubmitClaimId(null);
        alert('Claim resubmitted successfully.');
      } catch (error: any) {
        setBillingError(error?.message || 'Claim could not be resubmitted.');
      } finally {
        setBillingBusy(false);
      }
      return;
    }

    setClaims(prev => prev.map(claim => {
      if (claim.id === resubmitClaimId) {
        return {
          ...claim,
          status: 'In Review',
          timeline: [
            ...claim.timeline,
            {
              title: 'Claim Resubmitted',
              date: new Date().toISOString().substring(0, 10) + ' ' + new Date().toTimeString().substring(0, 5),
              description: `Corrected procedure code ${resubmitCode}. Note: ${resubmitNotes}`
            }
          ]
        };
      }
      return claim;
    }));

    setInvoices(prev => prev.map(inv => {
      const matchClaim = claims.find(c => c.id === resubmitClaimId);
      if (matchClaim && inv.invoiceNumber === matchClaim.invoiceNumber) {
        return { ...inv, insuranceClaimStatus: 'Resubmitted' };
      }
      return inv;
    }));

    setResubmitClaimId(null);
    alert('Claim resubmitted successfully to provider!');
  };

  const handleIssueInvoice = async () => {
    setBillingError('');

    if (demoMode) {
      const newNum = `INV-2026-00${invoices.length + 1}`;
      const newInv: Invoice = {
        id: `I-${Date.now()}`,
        invoiceNumber: newNum,
        patientName: 'Demo Patient',
        patientId: 'PT-DEMO',
        doctorName: 'Dr. Demo',
        clinicName: 'HealthOS Demo Clinic',
        issueDate: new Date().toISOString().substring(0, 10),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        treatmentItems: [
          { code: 'D1110', name: 'Adult Cleaning & Polish', quantity: 1, unitPrice: 150, discount: 0, tax: 0 }
        ],
        insuranceCoveragePercent: 0,
        insuranceClaimStatus: 'None',
        insuranceProvider: 'Self-Pay',
        paymentStatus: 'Pending',
        amountPaid: 0,
        notes: 'Demo invoice.',
        attachments: []
      };
      setInvoices(prev => [newInv, ...prev]);
      alert(`New Demo invoice ${newNum} created.`);
      return;
    }

    const patient = initialPatients[0];
    if (!patient) {
      setBillingError('Add a patient before creating an invoice.');
      return;
    }

    setBillingBusy(true);
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const { data, error } = await (createClient() as any).rpc(
        'healthos_create_billing_invoice',
        {
          target_patient_id: patient.id,
          invoice_doctor_name: 'Unassigned',
          invoice_clinic_name: 'Main Clinic',
          invoice_treatment_items: [
            {
              code: 'D1110',
              name: 'Adult Cleaning & Polish',
              quantity: 1,
              unitPrice: 150,
              discount: 0,
              tax: taxRatePercent
            }
          ],
          invoice_due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString().substring(0, 10),
          invoice_insurance_coverage: 0,
          invoice_insurance_provider: 'Self-Pay',
          invoice_notes: 'New billing draft.'
        }
      );
      if (error) throw error;

      const newInvoice = mapInvoiceRow(data);
      setInvoices(prev => [newInvoice, ...prev]);
      setSelectedInvoiceId(newInvoice.id);
      setPayInvoiceNumber(newInvoice.invoiceNumber);
      setTimelineEvents(prev => [{
        id: crypto.randomUUID(),
        type: 'invoice_created',
        title: `Invoice ${newInvoice.invoiceNumber} created`,
        description: `Invoice created for ${newInvoice.patientName}.`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        amount: 150 * (1 + taxRatePercent / 100),
        user: 'Practice Admin'
      }, ...prev]);
      alert(`Invoice ${newInvoice.invoiceNumber} created for ${patient.name}.`);
    } catch (error: any) {
      setBillingError(error?.message || 'Invoice could not be created.');
    } finally {
      setBillingBusy(false);
    }
  };

  const handleSaveSettings = async () => {
    if (demoMode) {
      alert('Demo billing settings updated for this session.');
      return;
    }

    setBillingBusy(true);
    setBillingError('');
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const { error } = await (createClient() as any)
        .from('healthos_billing_settings')
        .upsert({
          currency: selectedCurrency,
          tax_rate_percent: taxRatePercent,
          invoice_prefix: invoicePrefix.trim() || 'INV-',
          auto_submit_insurance: autoSubmitInsurance
        });
      if (error) throw error;
      alert('Billing settings saved.');
    } catch (error: any) {
      setBillingError(error?.message || 'Billing settings could not be saved.');
    } finally {
      setBillingBusy(false);
    }
  };

  // Trigger AI Report Generator
  const generateAIReport = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      if (!demoMode) {
        const overdueInvoices = invoices.filter(invoice => invoice.paymentStatus === 'Overdue');
        const rejectedClaims = claims.filter(claim => claim.status === 'Rejected');
        const collectionRate = stats.totalInvoiced > 0
          ? ((stats.totalInvoiced - stats.outstandingBalance) / stats.totalInvoiced) * 100
          : 0;
        setAiReportText(
          `**HEALTHOS FINANCIAL DIAGNOSTIC**\n\n` +
          `**COLLECTIONS**\n` +
          `• Total invoiced: **$${stats.totalInvoiced.toFixed(2)}**\n` +
          `• Outstanding balance: **$${stats.outstandingBalance.toFixed(2)}**\n` +
          `• Collection rate: **${collectionRate.toFixed(1)}%**\n\n` +
          `**FOLLOW-UP QUEUE**\n` +
          `• Overdue invoices: **${overdueInvoices.length}**\n` +
          `• Rejected insurance claims: **${rejectedClaims.length}**\n\n` +
          `This summary is calculated from the signed-in account's owner-isolated ledger.`
        );
        setAiAnalyzing(false);
        return;
      }

      setAiReportText(
        `**HEALTHOS FINANCIAL AI ENGINE - EXECUTIVE REPORT**\n\n` +
        `**1. REVENUE INSIGHTS & LEAKAGES:**\n` +
        `• Average treatment plan acceptance stands at **78.4%**. However, implant procedure conversions show a 12% delay cycle due to out-of-pocket ticket size ($4,300+).\n` +
        `• **Collection Rate Analysis**: Practice has a strong **96.8% collection rate**, primarily due to upfront co-pays and real-time eligibility checks.\n\n` +
        `**2. PAYOR & INSURANCE CLAIMS METRICS:**\n` +
        `• MetLife claims show a high return-to-provider (RTP) rate of 14% on procedure code **D4341 (Scaling & Planing)**. *Correction plan implemented*: Automating attachments of periodontal pocket depths and radiographic findings prior to EDI gateway transmission.\n` +
        `• Cigna Dental adjudication is averaging **4.2 days**, down from 8.0, due to direct clearinghouse mapping.\n\n` +
        `**3. RISK MITIGATION & ACTIONABLE PLAN:**\n` +
        `• **Demo Patient (INV-DEMO-003)** holds an overdue balance. Suggesting an automated installment reminder.\n` +
        `• **Recommend procedure pricing hike**: Zirconia Crown (D2740) currently sits 8% below local regional mean averages. Adjusting standard schedule by +$100 would generate an estimated **+$14,200.00** annually without patient churn.`
      );
      setAiAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[780px] font-sans antialiased text-zinc-100 relative">
      
      {/* BRAND & HEADER STATUS BAR */}
      <div className="bg-zinc-900/85 border-b border-zinc-900 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">HealthOS Portal Billing</h2>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-black px-2 py-0.5 rounded-full">
                LEDGER CORE
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">
              Enterprise Billing Node ID: <span className="text-zinc-300 font-bold">FIN-7701-X22</span> • {demoMode ? 'Demo gateways active' : 'Owner-isolated ledger active'}
            </p>
          </div>
        </div>

        {/* TOP STATUS ROW */}
        <div className="hidden lg:flex items-center gap-4 bg-zinc-950/80 border border-zinc-800 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400 font-bold">EDI Eligibility check:</span>
            <span className="text-emerald-400 font-extrabold">ONLINE (100%)</span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <Receipt className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-400 font-bold">Payment Methods:</span>
            <span className="text-white">Active (Stripe Terminal/Cash/ACH)</span>
          </div>
        </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] bg-zinc-950 border border-zinc-850 text-zinc-300 px-3 py-1.5 rounded-full font-mono font-bold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {selectedCurrency} Active
            </div>
        </div>
      </div>

      {/* WORKSPACE SIDEBAR NAVIGATION */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* BILLING MODULE LEFT MENU */}
        <div className="w-60 bg-zinc-900 border-r border-zinc-900 flex flex-col shrink-0 overflow-hidden select-none">
          <div className="p-4 border-b border-zinc-900 shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-1">Financial Sections</span>
            <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">Select specialized workspace ledger:</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
            {[
              { id: 'Dashboard', label: '1. Billing Dashboard', icon: CreditCard, badge: 'Unified' },
              { id: 'Invoices', label: '2. Invoice Control', icon: FileText, badge: `${invoices.length} Items` },
              { id: 'InvoiceDetails', label: '3. Invoice Workspace', icon: Sliders, badge: 'Focus' },
              { id: 'Payments', label: '4. Cash Desk', icon: DollarSign, badge: 'Terminal' },
              { id: 'Insurance', label: '5. Insurance Center', icon: ShieldCheck, badge: `${claims.length} Claims` },
              { id: 'Estimates', label: '6. Estimates & Quotes', icon: FileSpreadsheet, badge: `${estimates.length} Plans` },
              { id: 'Reports', label: '7. Revenue Reports', icon: TrendingUp, badge: 'Audit' },
              { id: 'AIAssistant', label: '8. AI Assistant', icon: Sparkles, badge: 'Insight', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
              { id: 'Timeline', label: '9. Audit Timeline', icon: History, badge: 'Live Log' },
              { id: 'Settings', label: '10. Billing Settings', icon: SlidersHorizontal, badge: 'Rules' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between border cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md' 
                      : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-950/40 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md border ${
                      item.badgeColor || (isActive ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-500 border-zinc-850')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-zinc-950/80 border-t border-zinc-900 shrink-0 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Billing Controller</span>
            <div className="flex items-center gap-2.5 p-2 bg-zinc-900 border border-zinc-850 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-md">
                BO
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-[11px] font-bold text-white truncate">Admin Ledger</h5>
                <p className="text-[9px] text-zinc-500 font-mono truncate">Role: Billing Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE VIEW CONTAINER */}
        <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {billingError && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
                <span>{billingError}</span>
                <button
                  type="button"
                  onClick={() => setBillingError('')}
                  className="text-rose-300 hover:text-white"
                  aria-label="Dismiss billing error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <AnimatePresence mode="wait">
              
              {/* ==================================================
                  1. BILLING DASHBOARD
                  ================================================== */}
              {activeTab === 'Dashboard' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight font-sans">Billing & Revenue Operations</h3>
                      <p className="text-xs text-zinc-500 font-mono">Consolidated overview of practice health, active insurance payouts, and payment collection loops.</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                      Real-time API Synchronized
                    </span>
                  </div>

                  {/* High Quality Bento Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[105px]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Today's Revenue</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white font-mono">${stats.todayRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +18.2% vs last Friday
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[105px]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Outstanding Balance</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-zinc-300 font-mono">${stats.outstandingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <p className="text-[9px] text-red-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Awaiting collections
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[105px]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Paid / Pending Invoices</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white font-mono">{stats.paidCount} Paid</span>
                        <span className="text-xs text-zinc-500 font-mono">/ {stats.pendingCount} Pend</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-mono">
                        Avg value: ${stats.averageInvoice}/invoice
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[105px]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Insurance Claims</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white font-mono">{stats.activeClaims} Active</span>
                      </div>
                      <p className="text-[9px] text-purple-400 font-semibold">
                        4.2 days average payout
                      </p>
                    </div>
                  </div>

                  {/* Chart Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recharts Area Chart */}
                    <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl col-span-2 flex flex-col justify-between h-[280px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Monthly Revenue Trend (YTD)</span>
                        <div className="flex gap-4 text-[10px] font-mono">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Patient Paid</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> Insurance Claims</span>
                        </div>
                      </div>
                      <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueTrendData}>
                            <defs>
                              <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="insGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                            <XAxis dataKey="month" stroke="#52525b" style={{ fontSize: '10px' }} />
                            <YAxis stroke="#52525b" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                            <Area type="monotone" dataKey="PatientPayment" stroke="#10b981" fillOpacity={1} fill="url(#patGrad)" name="Patient Paid" />
                            <Area type="monotone" dataKey="InsuranceClaim" stroke="#3b82f6" fillOpacity={1} fill="url(#insGrad)" name="Insurance Claims" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Quick actions panel */}
                    <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[280px]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-3">Quick Ledger Dispatches</span>
                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed mb-4">Direct dispatch links for immediate patient billing operations.</p>
                      </div>

                      <div className="space-y-2">
                        <button 
                          onClick={() => { setActiveTab('Invoices') }}
                          className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-emerald-500 rounded-xl flex items-center gap-3 transition-colors text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-[11px]">Generate Invoice</p>
                            <p className="text-[9px] text-zinc-500">Draft new treatment fees</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setActiveTab('Payments') }}
                          className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-emerald-500 rounded-xl flex items-center gap-3 transition-colors text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-[11px]">Collect Payment</p>
                            <p className="text-[9px] text-zinc-500">Swipe terminal or log cash copay</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setActiveTab('AIAssistant') }}
                          className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-emerald-500 rounded-xl flex items-center gap-3 transition-colors text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-[11px]">Audit claims with AI</p>
                            <p className="text-[9px] text-zinc-500">Validate clinical diagnostics code</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM TELEMETRY BAR */}
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Cleared Batch Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Synchronized with US Clearinghouse Gateways
                    </span>
                    <span className="text-zinc-400">Total Invoiced: <span className="text-white font-bold">${stats.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  2. INVOICE MANAGEMENT
                  ================================================== */}
              {activeTab === 'Invoices' && (
                <WorkspaceTabPanel
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Active Accounts Ledger</h3>
                      <p className="text-xs text-zinc-500 font-mono">Manage and filter enterprise wide practice invoices and eligibility reports.</p>
                    </div>
                    <button
                      onClick={handleIssueInvoice}
                      disabled={billingBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Issue New Invoice
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-900/30 p-4 border border-zinc-900 rounded-2xl">
                    <div className="relative md:col-span-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                        placeholder="Patient, ID, Invoice #..."
                        className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-650"
                      />
                    </div>

                    <div>
                      <select
                        value={invoiceStatusFilter}
                        onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-emerald-500"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Partially Paid">Partially Paid</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={invoiceDoctorFilter}
                        onChange={(e) => setInvoiceDoctorFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-emerald-500"
                      >
                        <option value="All">All Doctors</option>
                        <option value="Dr. Catherine Avery">Dr. Avery</option>
                        <option value="Dr. Elena Rostova">Dr. Rostova</option>
                        <option value="Dr. Robert Carter">Dr. Carter</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={invoiceClinicFilter}
                        onChange={(e) => setInvoiceClinicFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-emerald-500"
                      >
                        <option value="All">All Clinics</option>
                        <option value="HealthOS Main Campus">Main Campus</option>
                        <option value="North Ward Urgent Care">North Ward</option>
                        <option value="Eastside Surgical Hub">Eastside</option>
                        <option value="Westside Pediatric Dentistry">Westside</option>
                      </select>
                    </div>
                  </div>

                  {/* Large Financial Table */}
                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-zinc-900/60 text-zinc-400 font-mono text-[10px] uppercase border-b border-zinc-850">
                        <tr>
                          <th className="p-3.5">Invoice #</th>
                          <th className="p-3.5">Patient</th>
                          <th className="p-3.5">Clinician & Site</th>
                          <th className="p-3.5">Issue Date</th>
                          <th className="p-3.5">Due Date</th>
                          <th className="p-3.5 text-right">Total Fee</th>
                          <th className="p-3.5 text-center">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 font-mono text-[11px] text-zinc-300">
                        {filteredInvoices.map((inv) => {
                          const sub = inv.treatmentItems.reduce((acc, x) => acc + (x.quantity * x.unitPrice), 0);
                          return (
                            <tr key={inv.id} className="hover:bg-zinc-900/30 transition-all">
                              <td className="p-3.5 text-white font-bold">{inv.invoiceNumber}</td>
                              <td className="p-3.5">
                                <div>
                                  <p className="font-semibold text-zinc-200">{inv.patientName}</p>
                                  <p className="text-[10px] text-zinc-500">{inv.patientId}</p>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <div>
                                  <p className="text-zinc-300">{inv.doctorName}</p>
                                  <p className="text-[9px] text-zinc-500">{inv.clinicName}</p>
                                </div>
                              </td>
                              <td className="p-3.5">{inv.issueDate}</td>
                              <td className="p-3.5 text-zinc-400">{inv.dueDate}</td>
                              <td className="p-3.5 text-right text-white font-bold">${sub.toFixed(2)}</td>
                              <td className="p-3.5 text-center">
                                <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border ${
                                  inv.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  inv.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  inv.paymentStatus === 'Overdue' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {inv.paymentStatus}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedInvoiceId(inv.id);
                                    setActiveTab('InvoiceDetails');
                                  }}
                                  className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold font-sans cursor-pointer"
                                >
                                  Open Workspace
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  3. INVOICE WORKSPACE (Focus view for single item)
                  ================================================== */}
              {activeTab === 'InvoiceDetails' && selectedInvoice && (
                <WorkspaceTabPanel
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-1 rounded-lg">
                        {selectedInvoice.invoiceNumber}
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Active Billing Workspace</h3>
                        <p className="text-xs text-zinc-500 font-mono">Detailed procedure code breakdown, eligibility logs, and copay calculations.</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          alert('Invoice PDF Generated & Printed to local network printer.');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-xs text-zinc-300 font-bold transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button 
                        onClick={() => {
                          setPayInvoiceNumber(selectedInvoice.invoiceNumber);
                          setPayAmount(invoiceCalculations.patientResponsibility.toFixed(2));
                          setActiveTab('Payments');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Process Payment
                      </button>
                    </div>
                  </div>

                  {/* Grid split */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Patient info & line items */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Patient metadata card */}
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Patient Details</span>
                          <p className="text-sm font-bold text-white font-mono">{selectedInvoice.patientName}</p>
                          <p className="text-xs text-zinc-400 font-mono">ID: {selectedInvoice.patientId}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Payer Reference</span>
                          <p className="text-xs font-bold text-zinc-250 font-mono">Provider: {selectedInvoice.insuranceProvider}</p>
                          <p className="text-xs text-zinc-400 font-mono">Eligibility: Approved (Copay 20%)</p>
                        </div>
                      </div>

                      {/* Line items table */}
                      <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-3">ADA Code Treatment Breakdown</span>
                        
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead className="text-[9px] uppercase text-zinc-500 border-b border-zinc-850">
                            <tr>
                              <th className="pb-2">ADA Code</th>
                              <th className="pb-2">Procedure</th>
                              <th className="pb-2 text-center">Qty</th>
                              <th className="pb-2 text-right">Unit Price</th>
                              <th className="pb-2 text-right">Disc %</th>
                              <th className="pb-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900">
                            {selectedInvoice.treatmentItems.map((item, idx) => {
                              const sub = item.quantity * item.unitPrice;
                              const disc = sub * (item.discount / 100);
                              const total = sub - disc;
                              return (
                                <tr key={idx} className="hover:bg-zinc-900/10">
                                  <td className="py-2.5 text-emerald-400 font-semibold">{item.code}</td>
                                  <td className="py-2.5 text-white">{item.name}</td>
                                  <td className="py-2.5 text-center">{item.quantity}</td>
                                  <td className="py-2.5 text-right">${item.unitPrice.toFixed(2)}</td>
                                  <td className="py-2.5 text-right text-zinc-500">{item.discount}%</td>
                                  <td className="py-2.5 text-right font-bold text-zinc-200">${total.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Notes & Attachments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Clinical Ledger Notes</span>
                          <textarea 
                            value={selectedInvoice.notes}
                            readOnly
                            className="w-full h-20 p-2 bg-zinc-950 border border-zinc-850 text-[10px] rounded-xl outline-none focus:border-emerald-500 text-zinc-300 font-mono resize-none"
                          />
                        </div>

                        <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">PACS DICOM Attachments</span>
                          <div className="space-y-1.5 overflow-y-auto h-20 pr-1">
                            {selectedInvoice.attachments.length > 0 ? (
                              selectedInvoice.attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-[9px] font-mono text-zinc-400">
                                  <span className="truncate">{file}</span>
                                  <Download className="w-3.5 h-3.5 text-zinc-500 hover:text-white cursor-pointer" />
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-zinc-600 font-mono italic">No radiographic scan attachments linked.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Calculations ledger summary */}
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[380px]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-4">Calculation Ledger Summary</span>
                        
                        <div className="space-y-3 font-mono text-xs">
                          <div className="flex justify-between text-zinc-400">
                            <span>Subtotal Fee:</span>
                            <span>${invoiceCalculations.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Discounts Applied:</span>
                            <span className="text-red-400">-${invoiceCalculations.discountTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Taxation ({taxRatePercent}%):</span>
                            <span>${invoiceCalculations.taxTotal.toFixed(2)}</span>
                          </div>
                          <div className="h-[1px] bg-zinc-800" />
                          <div className="flex justify-between text-white font-bold">
                            <span>Total Grand Cost:</span>
                            <span>${invoiceCalculations.grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-blue-400">
                            <span>Insurance Copay Coverage:</span>
                            <span>-${invoiceCalculations.insuranceCoverage.toFixed(2)}</span>
                          </div>
                          <div className="h-[1px] bg-zinc-800" />
                          <div className="flex justify-between text-emerald-400 font-black text-sm">
                            <span>Patient Responsibility:</span>
                            <span>${invoiceCalculations.patientResponsibility.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Ledger Status</p>
                          <p className="text-xs font-bold text-white font-mono mt-0.5">{selectedInvoice.paymentStatus}</p>
                        </div>
                        <span className={`w-3 h-3 rounded-full ${
                          selectedInvoice.paymentStatus === 'Paid' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                        }`} />
                      </div>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {activeTab === 'InvoiceDetails' && !selectedInvoice && (
                <WorkspaceTabPanel className="flex min-h-[320px] items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                    <h3 className="text-sm font-bold text-white">No invoice selected</h3>
                    <p className="mt-1 text-xs text-zinc-500">Create an invoice before opening the invoice workspace.</p>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  4. PAYMENTS & CASH DESK
                  ================================================== */}
              {activeTab === 'Payments' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Practice Cash Desk & Terminal Terminal</h3>
                      <p className="text-xs text-zinc-500 font-mono">Process patient copayments and direct insurance disbursement checks.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment dispatch form */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl h-[380px] flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Collect Payment</span>

                      <form onSubmit={handleProcessPayment} className="space-y-3 flex-1 justify-center mt-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Invoice Number</label>
                          <input
                            type="text"
                            value={payInvoiceNumber}
                            onChange={(e) => setPayInvoiceNumber(e.target.value)}
                            placeholder="e.g. INV-2026-002"
                            className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Payment Amount</label>
                          <input
                            type="text"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="e.g. 1165.00"
                            className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono placeholder:text-zinc-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Terminal Gateway Method</label>
                          <select
                            value={payMethod}
                            onChange={(e) => setPayMethod(e.target.value as any)}
                            className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-zinc-300 font-mono"
                          >
                            <option value="Credit Card">Credit Card Terminal</option>
                            <option value="Cash">Cash Drawer</option>
                            <option value="Bank Transfer">ACH Bank Transfer</option>
                            <option value="Online Gateway">Stripe Online Portal</option>
                          </select>
                        </div>

                        <button 
                          type="submit"
                          disabled={billingBusy || invoices.length === 0}
                          className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all mt-4 cursor-pointer"
                        >
                          Record Receipt & Clear Balance
                        </button>
                      </form>
                    </div>

                    {/* Payment History and Receipts table */}
                    <div className="lg:col-span-2 p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex flex-col justify-between h-[380px]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-3">Settlement Receipts Journal</span>
                        <div className="overflow-y-auto max-h-[280px] pr-1">
                          <table className="w-full text-left font-mono text-[10px]">
                            <thead className="text-[9px] text-zinc-500 uppercase border-b border-zinc-850">
                              <tr>
                                <th className="pb-2">Receipt #</th>
                                <th className="pb-2">Invoice</th>
                                <th className="pb-2 font-semibold">Patient</th>
                                <th className="pb-2">Method</th>
                                <th className="pb-2">Date</th>
                                <th className="pb-2 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                              {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-zinc-900/20">
                                  <td className="py-2.5 font-bold text-white">{p.receiptNumber}</td>
                                  <td className="py-2.5 text-zinc-400">{p.invoiceNumber}</td>
                                  <td className="py-2.5 font-semibold text-zinc-300">{p.patientName}</td>
                                  <td className="py-2.5 text-emerald-400">{p.paymentMethod}</td>
                                  <td className="py-2.5 text-zinc-500">{p.timestamp}</td>
                                  <td className="py-2.5 text-right font-bold text-white">${p.amount.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl flex justify-between items-center text-[10px] font-mono text-zinc-500">
                        <span>ONLINE GATEWAY STATUS: <span className="text-emerald-400 font-bold">READY (MOCK)</span></span>
                        <span>DAILY DEPOSITS SETTLED</span>
                      </div>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  5. INSURANCE CENTER & CLAIMS
                  ================================================== */}
              {activeTab === 'Insurance' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Insurance Claims Adjudication Portal</h3>
                      <p className="text-xs text-zinc-500 font-mono">Track clearinghouse submissions, pre-authorization validations, and claim appeals.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Claims Journal List */}
                    <div className="lg:col-span-2 p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl h-[380px] overflow-y-auto pr-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-3">Clearinghouse Claim Logs</span>
                      
                      <table className="w-full text-left font-mono text-[10px]">
                        <thead className="text-[9px] text-zinc-500 uppercase border-b border-zinc-850">
                          <tr>
                            <th className="pb-2">Claim ID</th>
                            <th className="pb-2">Invoice #</th>
                            <th className="pb-2">Payer Network</th>
                            <th className="pb-2 text-right">Fee Claimed</th>
                            <th className="pb-2 text-center">Status</th>
                            <th className="pb-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-zinc-300">
                          {claims.map((claim) => (
                            <tr key={claim.id} className="hover:bg-zinc-900/20">
                              <td className="py-2.5 text-white font-bold">{claim.id}</td>
                              <td className="py-2.5 text-zinc-400">{claim.invoiceNumber}</td>
                              <td className="py-2.5">
                                <div>
                                  <p className="font-semibold text-zinc-200">{claim.provider}</p>
                                  <p className="text-[9px] text-zinc-500">Policy: {claim.policyNumber}</p>
                                </div>
                              </td>
                              <td className="py-2.5 text-right font-bold">${claim.amountClaimed.toFixed(2)}</td>
                              <td className="py-2.5 text-center">
                                <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-full border ${
                                  claim.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  claim.status === 'In Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                  {claim.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-right">
                                {claim.status === 'Rejected' ? (
                                  <button
                                    onClick={() => {
                                      setResubmitClaimId(claim.id);
                                    }}
                                    className="px-2 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-[9px] text-rose-400 font-bold hover:bg-rose-500/20 cursor-pointer"
                                  >
                                    Appeal & Resubmit
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-zinc-500 font-bold italic">Standard Review</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Resubmission Appeal Form (Conditional rendering inside panel) */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl h-[380px] flex flex-col justify-between">
                      {resubmitClaimId ? (
                        <form onSubmit={handleResubmitClaim} className="space-y-3 flex-1 justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Appeals & Resubmission</span>
                          <p className="text-[10px] text-zinc-400 font-mono">Appealing Claim ID: <strong className="text-white">{resubmitClaimId}</strong></p>

                          <div className="space-y-1 mt-3">
                            <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Corrected ADA Code</label>
                            <input
                              type="text"
                              value={resubmitCode}
                              onChange={(e) => setResubmitCode(e.target.value)}
                              className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Compliance Arguments / Evidence Notes</label>
                            <textarea
                              value={resubmitNotes}
                              onChange={(e) => setResubmitNotes(e.target.value)}
                              className="w-full h-24 p-2 bg-zinc-950 border border-zinc-850 text-[10px] rounded-xl outline-none focus:border-emerald-500 text-zinc-300 font-mono resize-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button 
                              type="button"
                              onClick={() => setResubmitClaimId(null)}
                              className="flex-1 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-bold font-sans cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button 
                          type="submit"
                          disabled={billingBusy}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold font-sans cursor-pointer"
                            >
                              Dispatch Appeal
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                          <ShieldCheck className="w-8 h-8 text-zinc-500 mb-2" />
                          <h4 className="text-xs font-bold text-white uppercase font-mono">Appeals Workspace</h4>
                          <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Select an active claim with a "Rejected" status to open the electronic appeals and compliance resubmission engine.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  6. ESTIMATES & QUOTATIONS
                  ================================================== */}
              {activeTab === 'Estimates' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Prosthodontics Treatment Estimates</h3>
                      <p className="text-xs text-zinc-500 font-mono">Build comprehensive visual dental cost breakdowns and convert approved quotes to active ledgers.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {estimates.map((est) => {
                      const totalVal = est.treatmentItems.reduce((acc, x) => acc + (x.quantity * x.unitPrice * (1 - x.discount/100)), 0);
                      return (
                        <div key={est.id} className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[280px]">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold bg-zinc-950 border border-zinc-800 text-emerald-400 px-1.5 py-0.5 rounded-md">
                                    {est.estimateNumber}
                                  </span>
                                  <h4 className="text-xs font-black text-white">{est.patientName}</h4>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1">Doctor: {est.doctorName} • Site: {est.clinicName}</p>
                              </div>
                              <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border ${
                                est.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {est.approvalStatus}
                              </span>
                            </div>

                            {/* Procedure List Breakdown */}
                            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 max-h-[110px] overflow-y-auto space-y-1.5 scrollbar-thin">
                              {est.treatmentItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                                  <span>{item.code} - {item.name}</span>
                                  <span className="text-white font-bold">${(item.quantity * item.unitPrice * (1 - item.discount/100)).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-zinc-900 text-[11px] font-mono">
                            <div>
                              <p className="text-[9px] text-zinc-500">Estimate Total cost</p>
                              <p className="text-sm font-black text-white">${totalVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                            </div>
                            
                            {est.approvalStatus === 'Approved' ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Convert completed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleConvertEstimate(est.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer"
                              >
                                Accept & Convert to Invoice <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  7. FINANCIAL REPORTS & ANALYTICS
                  ================================================== */}
              {activeTab === 'Reports' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Practice Revenue & Audit Reports</h3>
                      <p className="text-xs text-zinc-500 font-mono">Interactive breakdown of revenue allocations by clinician, facility, and specific procedure codes.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue by Clinic Site */}
                    <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[280px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono mb-2">Revenue Share by Clinic</span>
                      <div className="flex-1 w-full min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={clinicRevenueData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {clinicRevenueData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[8px] font-mono text-zinc-400">
                        {clinicRevenueData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="truncate">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Revenue by Doctor */}
                    <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[280px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono mb-2">Revenue Generation by Doctor</span>
                      <div className="flex-1 w-full min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={doctorRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                            <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: '9px' }} />
                            <YAxis stroke="#52525b" style={{ fontSize: '9px' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '10px' }} />
                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Revenue by Specific Procedure */}
                    <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[280px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono mb-2">Top Yield ADA Procedure Codes</span>
                      <div className="flex-1 w-full min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={procedureRevenueData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                            <XAxis type="number" stroke="#52525b" style={{ fontSize: '9px' }} />
                            <YAxis dataKey="code" type="category" stroke="#52525b" style={{ fontSize: '9px' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '10px' }} />
                            <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  8. AI FINANCIAL ASSISTANT & RISK ANALYSIS
                  ================================================== */}
              {activeTab === 'AIAssistant' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">AI Co-Pilot Practice Auditor</h3>
                      <p className="text-xs text-zinc-500 font-mono">Use deep generative models to audit clinical treatment codes and forecast insurance risk profiles.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Diagnostic flags / parameters */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4 h-[380px] flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Auditing Engine Configurations</span>
                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">Run a complete review of historical clearinghouse codes and patient balances.</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-white font-mono">ADA claim validation</p>
                            <p className="text-[9px] text-zinc-500">Auto cross-reference diagnoses</p>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">Enabled</span>
                        </div>

                        <div className="flex justify-between items-center p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-white font-mono">Risk Scoring threshold</p>
                            <p className="text-[9px] text-zinc-500">Overdue alerts on &gt; $1000</p>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400 font-bold">&gt; 15 Days</span>
                        </div>
                      </div>

                      <button 
                        onClick={generateAIReport}
                        disabled={aiAnalyzing}
                        className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" /> 
                        {aiAnalyzing ? 'AI Model Auditing...' : 'Run Financial Diagnostic Summary'}
                      </button>
                    </div>

                    {/* Report Output Area */}
                    <div className="lg:col-span-2 p-5 bg-zinc-900/20 border border-zinc-900 rounded-2xl h-[380px] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-3">AI Diagnostic Telemetry Report</span>
                        <div className="overflow-y-auto max-h-[290px] pr-1">
                          {aiReportText ? (
                            <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                              {aiReportText}
                            </pre>
                          ) : (
                            <div className="flex flex-col justify-center items-center text-center p-12 text-zinc-600 font-mono h-[240px]">
                              <Sparkles className="w-8 h-8 mb-2 animate-pulse" />
                              <p className="text-xs">Ledger Diagnostic Idle.</p>
                              <p className="text-[9px] mt-1">Click the button on the left to invoke the generative analysis core on practice records.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  9. AUDIT TIMELINE
                  ================================================== */}
              {activeTab === 'Timeline' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Active PCI Ledger Timeline</h3>
                      <p className="text-xs text-zinc-500 font-mono">Immutable audit timeline recording every transaction, submission, and refund processed in HealthOS.</p>
                    </div>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-4">
                    {timelineEvents.map((evt) => (
                      <div key={evt.id} className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex gap-4 text-xs">
                        <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl h-9 w-9 flex items-center justify-center shrink-0">
                          {evt.type === 'payment_received' ? (
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                          ) : evt.type === 'claim_submitted' ? (
                            <Send className="w-4 h-4 text-blue-400" />
                          ) : evt.type === 'claim_approved' ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-white">{evt.title}</h4>
                            <span className="text-[9px] font-mono text-zinc-500">{evt.timestamp}</span>
                          </div>
                          <p className="text-zinc-400 text-[11px] font-mono leading-relaxed">{evt.description}</p>
                          <div className="flex justify-between text-[10px] text-zinc-500 font-mono pt-1">
                            <span>Operator: <strong className="text-zinc-350">{evt.user}</strong></span>
                            {evt.amount && <span className="text-emerald-400 font-bold">${evt.amount.toFixed(2)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  10. BILLING SETTINGS
                  ================================================== */}
              {activeTab === 'Settings' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Ledger & Invoicing Control Panel</h3>
                      <p className="text-xs text-zinc-500 font-mono">Adjust tax compliance schedules, standard EDI gateway routes, and base currency formats.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Currency & Taxation Settings</span>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Standard Currency Symbol</label>
                          <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-zinc-300 font-mono"
                          >
                            <option value="USD ($)">United States Dollar (USD - $)</option>
                            <option value="EUR (€)">European Euro (EUR - €)</option>
                            <option value="GBP (£)">Great Britain Pound (GBP - £)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase">State sales tax rate (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={taxRatePercent}
                            onChange={(e) => setTaxRatePercent(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Clearinghouse & Numbering Settings</span>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Invoice Prefix Format</label>
                          <input
                            type="text"
                            value={invoicePrefix}
                            onChange={(e) => setInvoicePrefix(e.target.value)}
                            className="w-full p-2 bg-zinc-950 border border-zinc-850 text-xs rounded-xl outline-none focus:border-emerald-500 text-white font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-white font-mono">Automate insurance dispatch</p>
                            <p className="text-[9px] text-zinc-500">Submit claim immediately upon invoice generation</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={autoSubmitInsurance}
                            onChange={(e) => setAutoSubmitInsurance(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 accent-emerald-500 focus:ring-emerald-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="max-w-4xl flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={billingBusy}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {billingBusy ? 'Saving...' : 'Save Billing Settings'}
                    </button>
                  </div>
                </WorkspaceTabPanel>
              )}

            </AnimatePresence>
          </div>

          {/* SHARED CONTROL BOTTOM PANEL */}
          <div className="p-4 bg-zinc-900/50 border-t border-zinc-900 shrink-0 flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>HealthOS Ledger Version: v1.4.22</span>
            <span className="text-emerald-400 font-bold">● CLOUD SERVER LINK ACTIVE</span>
            <span>Operator IP Logged: 192.168.1.1</span>
          </div>

        </div>

      </div>

    </div>
  );
}
