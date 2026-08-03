import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Calendar, FileText, Clipboard, DollarSign, CreditCard, FlaskConical, Layers, Camera, Send, FileDown } from 'lucide-react';

interface FloatingQuickActionsProps {
  onActionTrigger: (actionType: 'appointment' | 'note' | 'treatment' | 'invoice' | 'payment' | 'lab' | 'radiology' | 'photo' | 'referral' | 'prescription') => void;
}

export default function FloatingQuickActions({ onActionTrigger }: FloatingQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: "New Appointment", type: "appointment" as const, icon: Calendar, color: "text-purple-400 bg-purple-950/40 border-purple-500/20" },
    { label: "Clinical SOAP Note", type: "note" as const, icon: FileText, color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20" },
    { label: "Treatment Plan", type: "treatment" as const, icon: Clipboard, color: "text-amber-400 bg-amber-950/40 border-amber-500/20" },
    { label: "New Invoice", type: "invoice" as const, icon: DollarSign, color: "text-teal-400 bg-teal-950/40 border-teal-500/20" },
    { label: "Record Payment", type: "payment" as const, icon: CreditCard, color: "text-green-400 bg-green-950/40 border-green-500/20" },
    { label: "Lab Order / Case", type: "lab" as const, icon: FlaskConical, color: "text-pink-400 bg-pink-950/40 border-pink-500/20" },
    { label: "Radiology (CBCT)", type: "radiology" as const, icon: Layers, color: "text-blue-400 bg-blue-950/40 border-blue-500/20" },
    { label: "Clinical Photo", type: "photo" as const, icon: Camera, color: "text-cyan-400 bg-cyan-950/40 border-cyan-500/20" },
    { label: "Specialist Referral", type: "referral" as const, icon: Send, color: "text-indigo-400 bg-indigo-950/40 border-indigo-500/20" },
    { label: "Write Prescription", type: "prescription" as const, icon: FileDown, color: "text-rose-400 bg-rose-950/40 border-rose-500/20" },
  ];

  const handleActionClick = (type: any) => {
    setIsOpen(false);
    onActionTrigger(type);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Action Buttons list */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click blocker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col gap-2 z-40 bg-zinc-950/95 border border-zinc-900 p-3 rounded-2xl shadow-2xl w-56 text-left"
            >
              <div className="px-2.5 pb-2 border-b border-zinc-900">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Quick Patient Intake</span>
              </div>
              <div className="flex flex-col max-h-[380px] overflow-y-auto scrollbar-none gap-0.5">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.type}
                      onClick={() => handleActionClick(act.type)}
                      className="w-full text-left px-2 py-2.5 rounded-xl hover:bg-zinc-900/80 transition-all flex items-center gap-3 text-xs text-zinc-300 hover:text-white"
                    >
                      <div className={`p-1.5 rounded-lg border ${act.color} shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Primary Toggle FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all shadow-xl active:scale-95 z-40 ${
          isOpen
            ? "bg-zinc-900 border-zinc-800 text-white"
            : "bg-emerald-500 border-emerald-400 text-black hover:bg-emerald-400 shadow-emerald-500/10"
        }`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
