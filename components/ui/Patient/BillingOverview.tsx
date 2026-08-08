'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SupabaseClient } from '@supabase/supabase-js';
import { DollarSign, Plus, Printer, ShieldCheck, Calculator, QrCode, Building2 } from 'lucide-react';
import { Button, Card, Badge, Input, Textarea, Select, Modal } from '@/components/ui/design-system';
import { clinicalService, BillingInvoice, BillingPayment, InsuranceClaim } from '../../../utils/services/clinicalService';
import { Patient } from '../PatientWorkspace';

interface BillingOverviewProps {
  supabase: SupabaseClient;
  activePatient: Patient;
  demoMode: boolean;
}

export default function BillingOverview({ supabase, activePatient, demoMode }: BillingOverviewProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('PatientWorkspace');

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<BillingInvoice | null>(null);
  const [installmentMonths, setInstallmentMonths] = useState<number>(3);

  // Forms states
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    clinicName: 'Main Clinic',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    insuranceProvider: 'Delta Dental',
    insuranceCoveragePercent: 60,
    notes: '',
    itemsText: 'D6010 - Surgical Implant Placement (#36) | 2850 | 1800 | 1050'
  });

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: 1050,
    paymentMethod: 'Credit Card' as BillingPayment['paymentMethod'],
    notes: ''
  });

  const [claimForm, setClaimForm] = useState({
    invoiceId: '',
    provider: 'Bupa Healthcare Arabia',
    policyNumber: 'POL-2026-881',
    preAuthRequired: true,
    amountClaimed: 1800
  });

  // 1. Fetch Invoices, Payments, Claims using TanStack Query
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', activePatient.id],
    queryFn: () => clinicalService.getInvoices(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments', activePatient.id],
    queryFn: () => clinicalService.getPayments(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  const { data: claims = [] } = useQuery({
    queryKey: ['claims', activePatient.id],
    queryFn: () => clinicalService.getClaims(supabase, activePatient.id, demoMode),
    enabled: !!activePatient.id
  });

  // Calculate totals
  const totalInvoiced = invoices.reduce((acc, inv) => {
    const feeSum = (inv.treatmentItems || []).reduce((s, item) => s + (item.fee || 0), 0);
    return acc + feeSum;
  }, 0);

  const totalPaid = payments.reduce((acc, pay) => acc + pay.amount, 0);
  const outstandingBalance = Math.max(0, totalInvoiced - totalPaid);

  // 2. Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: (newInv: Omit<BillingInvoice, 'id' | 'patientId' | 'patientName' | 'doctorName'>) =>
      clinicalService.createInvoice(supabase, activePatient.id, activePatient.name, activePatient.primaryDoctor || 'Dr. Ahmed', newInv, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', activePatient.id] });
      setShowInvoiceModal(false);
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (newPay: Omit<BillingPayment, 'id' | 'patientId' | 'patientName'>) =>
      clinicalService.recordPayment(supabase, activePatient.id, activePatient.name, newPay, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', activePatient.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', activePatient.id] });
      setShowPaymentModal(false);
    }
  });

  const submitClaimMutation = useMutation({
    mutationFn: (claimData: Omit<InsuranceClaim, 'id' | 'patientId' | 'patientName' | 'submittedAt'>) =>
      clinicalService.submitClaim(supabase, activePatient.id, activePatient.name, claimData, demoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', activePatient.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', activePatient.id] });
      setShowClaimModal(false);
    }
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = invoiceForm.itemsText.split('\n').filter(Boolean);
    const parsedItems = lines.map(line => {
      const parts = line.split('|').map(s => s.trim());
      const name = parts[0] || 'Clinical Procedure';
      const fee = Number(parts[1]) || 0;
      const insurance = Number(parts[2]) || 0;
      const copay = Number(parts[3]) || (fee - insurance);
      return { code: 'DXXXX', name, fee, insurance, copay };
    });

    createInvoiceMutation.mutate({
      invoiceNumber: invoiceForm.invoiceNumber,
      clinicName: invoiceForm.clinicName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate,
      treatmentItems: parsedItems,
      insuranceCoveragePercent: Number(invoiceForm.insuranceCoveragePercent),
      insuranceClaimStatus: 'Pending',
      insuranceProvider: invoiceForm.insuranceProvider,
      paymentStatus: 'Pending',
      amountPaid: 0,
      notes: invoiceForm.notes,
      attachments: []
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedInvoice = invoices.find(inv => inv.id === paymentForm.invoiceId);
    if (!matchedInvoice) return;

    recordPaymentMutation.mutate({
      invoiceId: paymentForm.invoiceId,
      invoiceNumber: matchedInvoice.invoiceNumber,
      amount: Number(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      recordedAt: new Date().toISOString(),
      type: 'Payment',
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`
    });
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedInvoice = invoices.find(inv => inv.id === claimForm.invoiceId);
    if (!matchedInvoice) return;

    submitClaimMutation.mutate({
      invoiceId: claimForm.invoiceId,
      invoiceNumber: matchedInvoice.invoiceNumber,
      provider: claimForm.provider,
      policyNumber: claimForm.policyNumber,
      preAuthRequired: claimForm.preAuthRequired,
      preAuthStatus: claimForm.preAuthRequired ? 'Approved' : 'Not Required',
      amountClaimed: claimForm.amountClaimed,
      amountApproved: claimForm.amountClaimed,
      status: 'Submitted',
      timeline: [
        { title: 'Electronic Claim Submitted', date: new Date().toISOString().split('T')[0], description: `Submitted to ${claimForm.provider}` }
      ]
    });
  };

  return (
    <div className="space-y-6 text-start">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated" hover={false} className="p-4 rounded-2xl">
          <span className="text-2xs text-[var(--velvet-text-muted)] font-mono uppercase block">{t('total_fees_invoiced')}</span>
          <span className="text-base font-bold text-[var(--velvet-text)] font-mono block mt-1">${totalInvoiced.toLocaleString()}</span>
        </Card>
        <Card variant="elevated" hover={false} className="p-4 rounded-2xl">
          <span className="text-2xs text-[var(--velvet-text-muted)] font-mono uppercase block">{t('amount_paid_settled')}</span>
          <span className="text-base font-bold text-[var(--velvet-success)] font-mono block mt-1">${totalPaid.toLocaleString()}</span>
        </Card>
        <Card variant="gradient" hover={false} className="p-4 rounded-xl relative shadow-[var(--velvet-shadow-pop)]">
          <span className="text-2xs text-[var(--velvet-text-muted)] font-mono uppercase block">{t('outstanding')}</span>
          <span className={`text-base font-bold font-mono block mt-1 ${outstandingBalance > 0 ? 'text-[var(--velvet-warning)]' : 'text-[var(--velvet-success)]'}`}>
            ${outstandingBalance.toLocaleString()}
          </span>
        </Card>
      </div>

      {/* Toolbar actions */}
      <Card variant="elevated" hover={false} className="flex flex-wrap justify-between items-center p-4 rounded-3xl gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--velvet-text)] flex items-center gap-1.5 font-mono">
            <DollarSign className="w-4 h-4 text-[var(--velvet-accent)]" /> {t('patient_ledger_title')}
          </h3>
          <p className="text-xs text-[var(--velvet-text-muted)] mt-0.5">{t('patient_ledger_desc')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {outstandingBalance > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowInstallmentModal(true)}
            >
              <Calculator className="w-3.5 h-3.5" /> {t('btn_installment_plan')}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (invoices.length > 0) {
                setClaimForm({
                  invoiceId: invoices[0].id,
                  provider: invoices[0].insuranceProvider || 'Bupa Healthcare Arabia',
                  policyNumber: 'POL-2026-991',
                  preAuthRequired: true,
                  amountClaimed: invoices[0].treatmentItems.reduce((acc, c) => acc + c.insurance, 0)
                });
                setShowClaimModal(true);
              } else {
                alert("Please create an invoice first.");
              }
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> {t('btn_submit_claim')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInvoiceForm({
                invoiceNumber: `INV-2026-${activePatient.id.split('-')[1] || '0'}-${Math.floor(100 + Math.random() * 900)}`,
                clinicName: 'Main Clinic',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                insuranceProvider: 'Delta Dental',
                insuranceCoveragePercent: 60,
                notes: '',
                itemsText: 'D6010 - Surgical Implant Placement (#36) | 2850 | 1800 | 1050'
              });
              setShowInvoiceModal(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" /> {t('btn_create_invoice')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (invoices.length > 0) {
                setPaymentForm({
                  invoiceId: invoices[0].id,
                  amount: invoices[0].treatmentItems.reduce((acc, curr) => acc + curr.copay, 0) - invoices[0].amountPaid,
                  paymentMethod: 'Credit Card',
                  notes: ''
                });
                setShowPaymentModal(true);
              } else {
                alert("Please create an invoice before recording a payment.");
              }
            }}
          >
            {t('btn_record_payment')}
          </Button>
        </div>
      </Card>

      {/* Ledger list */}
      <div className="space-y-4">
        {isLoadingInvoices || isLoadingPayments ? (
          <div className="text-[var(--velvet-text-muted)] text-xs text-center py-6 animate-pulse">Loading financial records...</div>
        ) : invoices.length === 0 ? (
          <Card variant="elevated" hover={false} className="py-8 rounded-3xl text-center">
            <div className="mx-auto w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--velvet-accent-glow2)', color: 'var(--velvet-accent)' }}>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs" style={{ color: 'var(--velvet-text-muted)' }}>
              {t('no_invoices_logged')}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => {
              const feeTotal = (inv.treatmentItems || []).reduce((s, i) => s + (i.fee || 0), 0);
              const insTotal = (inv.treatmentItems || []).reduce((s, i) => s + (i.insurance || 0), 0);
              const copayTotal = (inv.treatmentItems || []).reduce((s, i) => s + (i.copay || 0), 0);
              const remaining = Math.max(0, copayTotal - (inv.amountPaid || 0));

              return (
                <Card key={inv.id} variant="elevated" hover={false} className="p-5 rounded-3xl space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
                    <div className="text-start">
                      <span className="text-2xs font-mono text-[var(--velvet-text-muted)]">{inv.invoiceNumber}</span>
                      <h4 className="text-xs font-bold text-[var(--velvet-text)] mt-0.5">{inv.clinicName} â€¢ Due {inv.dueDate}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoiceForPrint(inv);
                          setShowPrintModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-2xs"
                      >
                        <Printer className="w-3 h-3 text-[var(--velvet-success)]" /> {t('btn_print_invoice')}
                      </Button>
                      <Badge tone={inv.paymentStatus === 'Paid' ? 'success' : inv.paymentStatus === 'Partially Paid' ? 'warning' : 'default'}>
                        {inv.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Procedures Table */}
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="grid grid-cols-12 text-2xs text-[var(--velvet-text-muted)] font-bold uppercase border-b pb-1" style={{ borderColor: 'var(--velvet-border)' }}>
                      <span className="col-span-6">{t('th_item_desc')}</span>
                      <span className="col-span-2 text-end">{t('th_fee')}</span>
                      <span className="col-span-2 text-end">{t('th_ins_co')}</span>
                      <span className="col-span-2 text-end">{t('th_copay')}</span>
                    </div>
                    {(inv.treatmentItems || []).map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-[var(--velvet-text-sub)] py-0.5 border-b" style={{ borderColor: 'var(--velvet-border)' }}>
                        <span className="col-span-6 font-sans text-xs text-[var(--velvet-text)] truncate">{item.name}</span>
                        <span className="col-span-2 text-end">${item.fee.toLocaleString()}</span>
                        <span className="col-span-2 text-end text-[var(--velvet-accent)]">${item.insurance.toLocaleString()}</span>
                        <span className="col-span-2 text-end text-[var(--velvet-warning)]">${item.copay.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer calculations */}
                  <div className="flex flex-wrap justify-between items-center text-xs font-mono pt-2 border-t p-2 rounded-lg" style={{ borderColor: 'var(--velvet-border)', background: 'var(--velvet-surface-1)' }}>
                    <div className="flex gap-4">
                      <span>{t('th_insurer')}: <strong className="text-[var(--velvet-text-sub)]">{inv.insuranceProvider} ({inv.insuranceClaimStatus})</strong></span>
                      <span>{t('th_paid')}: <strong className="text-[var(--velvet-success)]">${inv.amountPaid.toLocaleString()}</strong></span>
                    </div>
                    <span className={`font-bold ${remaining > 0 ? 'text-[var(--velvet-warning)]' : 'text-[var(--velvet-success)]'}`}>
                      {t('th_remaining_share')}: ${remaining.toLocaleString()}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoices Create Modal */}
      <Modal
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        title={t('modal_create_invoice')}
        size="lg"
        actions={
          <>
            <Button variant="ghost" type="button" onClick={() => setShowInvoiceModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="billing-invoice-form" loading={createInvoiceMutation.isPending}>
              Publish Invoice
            </Button>
          </>
        }
      >
        <form id="billing-invoice-form" onSubmit={handleCreateInvoice} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
          <Input
            label="Invoice Number"
            type="text"
            value={invoiceForm.invoiceNumber}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
            className="font-mono"
          />
          <Input
            label="Due Date"
            type="date"
            value={invoiceForm.dueDate}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
            className="font-mono"
          />
          <Input
            label="Insurer Provider"
            type="text"
            value={invoiceForm.insuranceProvider}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, insuranceProvider: e.target.value })}
          />
          <Input
            label="Insurer Share (%)"
            type="number"
            value={invoiceForm.insuranceCoveragePercent}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, insuranceCoveragePercent: Number(e.target.value) })}
            className="font-mono"
          />
          <Textarea
            label="Items (Format: Name | Fee | Insurer Share | Copay)"
            value={invoiceForm.itemsText}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, itemsText: e.target.value })}
            rows={3}
            className="sm:col-span-2 font-mono"
          />
        </form>
      </Modal>

      {/* Payment Record Modal */}
      <Modal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        title={t('modal_record_payment')}
        size="sm"
        actions={
          <>
            <Button variant="ghost" type="button" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="billing-payment-form" loading={recordPaymentMutation.isPending}>
              Record Payment
            </Button>
          </>
        }
      >
        <form id="billing-payment-form" onSubmit={handleRecordPayment} className="space-y-4 text-start">
          <Select
            label="Target Invoice"
            value={paymentForm.invoiceId}
            onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
            options={invoices.map(inv => ({ value: inv.id, label: `${inv.invoiceNumber} - Due: ${inv.dueDate}` }))}
          />
          <Input
            label="Payment Amount ($)"
            type="number"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
            className="font-mono"
          />
          <Select
            label="Method"
            value={paymentForm.paymentMethod}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
            options={[
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Insurance Claim', label: 'Insurance Claim' },
              { value: 'Bank Transfer', label: 'Bank Transfer' }
            ]}
          />
        </form>
      </Modal>

      {/* e-Claim Submission Modal */}
      <Modal
        open={showClaimModal}
        onOpenChange={setShowClaimModal}
        title={t('btn_submit_claim')}
        size="md"
        actions={
          <>
            <Button variant="ghost" type="button" onClick={() => setShowClaimModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="billing-claim-form" loading={submitClaimMutation.isPending}>
              <ShieldCheck className="w-3.5 h-3.5" /> Submit Claim
            </Button>
          </>
        }
      >
        <form id="billing-claim-form" onSubmit={handleClaimSubmit} className="space-y-4 text-start">
          <Select
            label="Target Invoice"
            value={claimForm.invoiceId}
            onChange={(e) => setClaimForm({ ...claimForm, invoiceId: e.target.value })}
            options={invoices.map(inv => ({ value: inv.id, label: `${inv.invoiceNumber} - ${inv.insuranceProvider}` }))}
          />
          <div className="space-y-1.5">
            <span className="block font-semibold text-sm" style={{ color: 'var(--velvet-text)' }}>{t('claim_provider_policy')}</span>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                value={claimForm.provider}
                onChange={(e) => setClaimForm({ ...claimForm, provider: e.target.value })}
                placeholder="Insurer Name"
              />
              <Input
                type="text"
                value={claimForm.policyNumber}
                onChange={(e) => setClaimForm({ ...claimForm, policyNumber: e.target.value })}
                placeholder="Policy Number"
                className="font-mono"
              />
            </div>
          </div>
          <Input
            label="Amount Claimed ($)"
            type="number"
            value={claimForm.amountClaimed}
            onChange={(e) => setClaimForm({ ...claimForm, amountClaimed: Number(e.target.value) })}
            className="font-mono"
          />
          <div className="p-3 rounded-xl border text-xs space-y-1" style={{ background: 'var(--velvet-info-bg)', borderColor: 'var(--velvet-info-border)', color: 'var(--velvet-info)' }}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{t('claim_status_preauth')}</span>
              <Badge tone="info" className="text-2xs font-mono uppercase px-2 py-0.5">Pre-Authorized (Approved)</Badge>
            </div>
            <p className="text-2xs" style={{ color: 'var(--velvet-info)', opacity: 0.8 }}>Electronic CDT procedure code clearance automatically verified via HealthOS Portal EDI Gateway.</p>
          </div>
        </form>
      </Modal>

      {/* Installment Plan Calculator Modal */}
      <Modal
        open={showInstallmentModal}
        onOpenChange={setShowInstallmentModal}
        title={t('installment_calc_title')}
        size="md"
        actions={
          <Button variant="primary" type="button" onClick={() => setShowInstallmentModal(false)}>
            Close Calculator
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl border flex justify-between items-center" style={{ background: 'var(--velvet-accent-glow2)', borderColor: 'var(--velvet-border-strong)', color: 'var(--velvet-accent)' }}>
            <div>
              <span className="text-2xs uppercase font-mono block">{t('outstanding')}</span>
              <span className="text-lg font-bold font-mono text-[var(--velvet-text)]">${outstandingBalance.toLocaleString()}</span>
            </div>
            <div className="text-end">
              <span className="text-2xs uppercase font-mono block">{t('installment_calc_monthly_val')}</span>
              <span className="text-lg font-bold font-mono">
                ${(outstandingBalance / installmentMonths).toFixed(2)}/mo
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <span className="block font-semibold text-sm" style={{ color: 'var(--velvet-text)' }}>{t('installment_calc_months')}</span>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map(m => (
                <Button
                  key={m}
                  type="button"
                  variant={installmentMonths === m ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setInstallmentMonths(m)}
                  className="w-full font-mono font-bold"
                >
                  {m} Months
                </Button>
              ))}
            </div>
          </div>

          {/* Installments Schedule Breakdown */}
          <div className="space-y-1.5 border-t pt-3" style={{ borderColor: 'var(--velvet-border)' }}>
            <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase font-bold block">Payment Schedule Breakdown</span>
            <div className="space-y-1 max-h-36 overflow-y-auto pe-1">
              {Array.from({ length: installmentMonths }).map((_, idx) => {
                const due = new Date(Date.now() + (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const amount = (outstandingBalance / installmentMonths).toFixed(2);
                return (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg border text-xs font-mono" style={{ background: 'var(--velvet-surface-1)', borderColor: 'var(--velvet-border)' }}>
                    <span className="text-[var(--velvet-text-muted)]">Installment #{idx + 1} â€¢ Due {due}</span>
                    <span className="text-[var(--velvet-text)] font-bold">${amount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* Printable Invoice / Official Receipt Modal */}
      <Modal
        open={showPrintModal && !!selectedInvoiceForPrint}
        onOpenChange={(open) => { if (!open) setShowPrintModal(false); }}
        title={selectedInvoiceForPrint ? selectedInvoiceForPrint.clinicName : t('btn_print_invoice')}
        size="lg"
        actions={
          <>
            <Button variant="ghost" type="button" onClick={() => setShowPrintModal(false)} className="print:hidden">
              Close Preview
            </Button>
            <Button variant="primary" type="button" onClick={() => window.print()} className="print:hidden">
              <Printer className="w-4 h-4" /> Print Receipt PDF
            </Button>
          </>
        }
      >
        {selectedInvoiceForPrint && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: 'var(--velvet-border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[var(--velvet-success)]" />
                  <h2 className="text-lg font-bold text-[var(--velvet-text)]">{selectedInvoiceForPrint.clinicName}</h2>
                </div>
                <p className="text-xs text-[var(--velvet-text-muted)] mt-1">HealthOS Official Dental & Medical Center â€¢ Tax ID: 300921893</p>
              </div>
              <div className="text-end">
                <Badge tone="success" className="font-mono text-xs font-bold">
                  OFFICIAL RECEIPT
                </Badge>
                <span className="block text-xs font-mono text-[var(--velvet-text-muted)] mt-1">{selectedInvoiceForPrint.invoiceNumber}</span>
              </div>
            </div>

            {/* Meta information */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4" style={{ borderColor: 'var(--velvet-border)' }}>
              <div>
                <span className="text-[var(--velvet-text-muted)] uppercase text-2xs font-bold block">Patient Details</span>
                <span className="font-bold text-[var(--velvet-text)] block text-sm">{activePatient.name}</span>
                <span className="text-[var(--velvet-text-muted)] block">ID: {activePatient.id} â€¢ Tel: {activePatient.phone || '+966 50 123 4567'}</span>
              </div>
              <div className="text-end">
                <span className="text-[var(--velvet-text-muted)] uppercase text-2xs font-bold block">Attending Clinician & Date</span>
                <span className="font-bold text-[var(--velvet-text)] block text-sm">{activePatient.primaryDoctor || 'Dr. Ahmed'}</span>
                <span className="text-[var(--velvet-text-muted)] block">Issue Date: {selectedInvoiceForPrint.issueDate}</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="space-y-2">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b text-[var(--velvet-text-muted)] text-2xs uppercase font-bold" style={{ borderColor: 'var(--velvet-border)' }}>
                    <th className="py-2">Procedure Description</th>
                    <th className="py-2 text-end">Fee</th>
                    <th className="py-2 text-end">Insurer Share</th>
                    <th className="py-2 text-end">Patient Co-Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit font-mono" style={{ borderColor: 'var(--velvet-border)' }}>
                  {(selectedInvoiceForPrint.treatmentItems || []).map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 font-sans text-[var(--velvet-text)] font-medium">{item.name}</td>
                      <td className="py-2 text-end text-[var(--velvet-text-muted)]">${item.fee.toLocaleString()}</td>
                      <td className="py-2 text-end text-[var(--velvet-accent)]">${item.insurance.toLocaleString()}</td>
                      <td className="py-2 text-end font-bold text-[var(--velvet-text)]">${item.copay.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total calculation & QR Code */}
            <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: 'var(--velvet-border-strong)' }}>
              <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--velvet-surface-1)', borderColor: 'var(--velvet-border)' }}>
                <QrCode className="w-10 h-10 text-[var(--velvet-text-sub)]" />
                <div className="text-2xs text-[var(--velvet-text-muted)]">
                  <span className="font-bold text-[var(--velvet-text)] block">{t('official_receipt_qr')}</span>
                  <span>Scan to verify authenticity & ZATCA e-invoicing compliance</span>
                </div>
              </div>
              <div className="text-end space-y-1 font-mono text-xs">
                <div className="flex justify-between gap-6 text-[var(--velvet-text-muted)]">
                  <span>Total Invoiced:</span>
                  <span>${(selectedInvoiceForPrint.treatmentItems || []).reduce((s, i) => s + i.fee, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-6 text-[var(--velvet-success)] font-bold">
                  <span>Amount Paid:</span>
                  <span>${selectedInvoiceForPrint.amountPaid.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
