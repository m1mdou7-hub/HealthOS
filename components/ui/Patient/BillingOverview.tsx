'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SupabaseClient } from '@supabase/supabase-js';
import { DollarSign, Plus, CheckCircle2, ShieldAlert, Clock, ArrowUpDown, FileText } from 'lucide-react';
import { clinicalService, BillingInvoice, BillingPayment } from '../../../utils/services/clinicalService';
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

  // 1. Fetch Invoices and Payments using TanStack Query
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

  return (
    <div className="space-y-6 text-left">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40">
          <span className="text-[10px] text-zinc-500 font-mono uppercase block">{t('total_fees_invoiced')}</span>
          <span className="text-base font-bold text-white font-mono block mt-1">${totalInvoiced.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40">
          <span className="text-[10px] text-zinc-500 font-mono uppercase block">{t('amount_paid_settled')}</span>
          <span className="text-base font-bold text-emerald-400 font-mono block mt-1">${totalPaid.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 relative">
          <span className="text-[10px] text-zinc-500 font-mono uppercase block">{t('outstanding')}</span>
          <span className={`text-base font-bold font-mono block mt-1 ${outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ${outstandingBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Toolbar actions */}
      <div className="flex flex-wrap justify-between items-center bg-zinc-900/10 p-4 rounded-2xl border border-zinc-900 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
            <DollarSign className="w-4 h-4 text-emerald-400" /> {t('patient_ledger_title')}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">{t('patient_ledger_desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
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
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1 border border-zinc-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> {t('btn_create_invoice')}
          </button>
          <button
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
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
          >
            {t('btn_record_payment')}
          </button>
        </div>
      </div>

      {/* Ledger list */}
      <div className="space-y-4">
        {isLoadingInvoices || isLoadingPayments ? (
          <div className="text-zinc-500 text-xs text-center py-6 animate-pulse">Loading financial records...</div>
        ) : invoices.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-8 border border-zinc-900 rounded-2xl bg-zinc-950/20">
            {t('no_invoices_logged')}
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => {
              const feeTotal = (inv.treatmentItems || []).reduce((s, i) => s + (i.fee || 0), 0);
              const insTotal = (inv.treatmentItems || []).reduce((s, i) => s + (i.insurance || 0), 0);
              const copayTotal = (inv.treatmentItems || []).reduce((s, i) => s + (i.copay || 0), 0);
              const remaining = Math.max(0, copayTotal - (inv.amountPaid || 0));

              return (
                <div key={inv.id} className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b border-zinc-900/60 pb-3">
                    <div className="text-left">
                      <span className="text-[9px] font-mono text-zinc-500">{inv.invoiceNumber}</span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{inv.clinicName} • Due {inv.dueDate}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-mono font-bold border ${
                        inv.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        inv.paymentStatus === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Procedures Table */}
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="grid grid-cols-12 text-[9px] text-zinc-500 font-bold uppercase border-b border-zinc-900/40 pb-1">
                      <span className="col-span-6">{t('th_item_desc')}</span>
                      <span className="col-span-2 text-right">{t('th_fee')}</span>
                      <span className="col-span-2 text-right">{t('th_ins_co')}</span>
                      <span className="col-span-2 text-right">{t('th_copay')}</span>
                    </div>
                    {(inv.treatmentItems || []).map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-zinc-300 py-0.5 border-b border-zinc-900/20">
                        <span className="col-span-6 font-sans text-xs text-white truncate">{item.name}</span>
                        <span className="col-span-2 text-right">${item.fee.toLocaleString()}</span>
                        <span className="col-span-2 text-right text-purple-400">${item.insurance.toLocaleString()}</span>
                        <span className="col-span-2 text-right text-amber-400">${item.copay.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer calculations */}
                  <div className="flex flex-wrap justify-between items-center text-xs font-mono pt-2 border-t border-zinc-900/60 bg-zinc-950/10 p-2 rounded-lg">
                    <div className="flex gap-4">
                      <span>{t('th_insurer')}: <strong className="text-zinc-300">{inv.insuranceProvider} ({inv.insuranceClaimStatus})</strong></span>
                      <span>{t('th_paid')}: <strong className="text-emerald-400">${inv.amountPaid.toLocaleString()}</strong></span>
                    </div>
                    <span className={`font-bold ${remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {t('th_remaining_share')}: ${remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoices Create Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateInvoice} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-full max-w-lg space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">{t('modal_create_invoice')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-400">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Insurer Provider</label>
                <input
                  type="text"
                  value={invoiceForm.insuranceProvider}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, insuranceProvider: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Insurer Share (%)</label>
                <input
                  type="number"
                  value={invoiceForm.insuranceCoveragePercent}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, insuranceCoveragePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none font-mono"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-zinc-400">Items (Format: Name | Fee | Insurer Share | Copay)</label>
                <textarea
                  value={invoiceForm.itemsText}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, itemsText: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-855 text-zinc-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createInvoiceMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
              >
                Publish Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Record Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRecordPayment} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl w-full max-w-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-zinc-900 pb-2">{t('modal_record_payment')}</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-400">Target Invoice</label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                >
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - Due: {inv.dueDate}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Payment Amount ($)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Insurance Claim">Insurance Claim</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-855 text-zinc-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={recordPaymentMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
