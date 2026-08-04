export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import BillingWorkspace from '@/components/ui/BillingWorkspace';

export default async function BillingPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const demoMode = Boolean((user as any).isDevBypass);
  const [
    { data: invoiceRows },
    { data: estimateRows },
    { data: claimRows },
    { data: paymentRows },
    { data: timelineRows },
    { data: settingsRow },
    { data: patientRows }
  ] = demoMode
    ? [
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: null },
        { data: [] }
      ]
    : await Promise.all([
        (supabase as any)
          .from('healthos_billing_invoices')
          .select('*')
          .order('issue_date', { ascending: false }),
        (supabase as any)
          .from('healthos_billing_estimates')
          .select('*')
          .order('issue_date', { ascending: false }),
        (supabase as any)
          .from('healthos_billing_claims')
          .select('*')
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('healthos_billing_payments')
          .select('*')
          .order('recorded_at', { ascending: false }),
        (supabase as any)
          .from('healthos_billing_timeline_events')
          .select('*')
          .order('occurred_at', { ascending: false }),
        (supabase as any)
          .from('healthos_billing_settings')
          .select('*')
          .maybeSingle(),
        (supabase as any)
          .from('healthos_patients')
          .select('id, name')
          .order('name', { ascending: true })
      ]);

  const initialInvoices = (invoiceRows || []).map((row: any) => ({
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
  }));

  const initialEstimates = (estimateRows || []).map((row: any) => ({
    id: row.id,
    estimateNumber: row.estimate_number,
    patientId: row.patient_id,
    patientName: row.patient_name,
    doctorName: row.doctor_name,
    clinicName: row.clinic_name,
    issueDate: row.issue_date,
    expirationDate: row.expiration_date,
    treatmentItems: row.treatment_items || [],
    approvalStatus: row.approval_status
  }));

  const initialClaims = (claimRows || []).map((row: any) => ({
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
  }));

  const initialPayments = (paymentRows || []).map((row: any) => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    patientName: row.patient_name,
    amount: Number(row.amount || 0),
    paymentMethod: row.payment_method,
    timestamp: String(row.recorded_at).replace('T', ' ').slice(0, 16),
    type: row.type,
    receiptNumber: row.receipt_number
  }));

  const initialTimelineEvents = (timelineRows || []).map((row: any) => ({
    id: row.id,
    type: row.event_type,
    title: row.title,
    description: row.description,
    timestamp: String(row.occurred_at).replace('T', ' ').slice(0, 16),
    amount: row.amount == null ? undefined : Number(row.amount),
    user: row.actor_name
  }));

  const tBill = await getTranslations('BillingWorkspace');

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl font-sans">
            {tBill('headerTitle')}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm font-sans">
            Configure patient invoices, handle ADA procedure code validations, submit claims, record cash/credit cards, and review financial reports.
          </p>
        </div>

        <BillingWorkspace
          demoMode={demoMode}
          initialInvoices={initialInvoices}
          initialEstimates={initialEstimates}
          initialClaims={initialClaims}
          initialPayments={initialPayments}
          initialTimelineEvents={initialTimelineEvents}
          initialPatients={patientRows || []}
          initialSettings={settingsRow ? {
            currency: settingsRow.currency,
            taxRatePercent: Number(settingsRow.tax_rate_percent || 0),
            invoicePrefix: settingsRow.invoice_prefix,
            autoSubmitInsurance: settingsRow.auto_submit_insurance
          } : undefined}
        />
      </div>
    </DashboardShell>
  );
}
