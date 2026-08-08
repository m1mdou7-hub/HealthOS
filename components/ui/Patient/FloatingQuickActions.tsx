import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Calendar, FileText, Clipboard, DollarSign, CreditCard, FlaskConical, Layers, Camera, Send, FileDown } from 'lucide-react';
import { Button, Card } from '@/components/ui/design-system';

interface FloatingQuickActionsProps {
  onActionTrigger: (actionType: 'appointment' | 'note' | 'treatment' | 'invoice' | 'payment' | 'lab' | 'radiology' | 'photo' | 'referral' | 'prescription') => void;
}

type Tone = 'info' | 'success' | 'warning' | 'accent' | 'error' | 'neutral';

const toneClasses: Record<Tone, string> = {
  info: 'text-[var(--velvet-info)] bg-[var(--velvet-info-bg)] border-[var(--velvet-info-border)]',
  success: 'text-[var(--velvet-success)] bg-[var(--velvet-success-bg)] border-[var(--velvet-success-border)]',
  warning: 'text-[var(--velvet-warning)] bg-[var(--velvet-warning-bg)] border-[var(--velvet-warning-border)]',
  accent: 'text-[var(--velvet-accent)] bg-[var(--velvet-accent-glow2)] border-[var(--velvet-border-strong)]',
  error: 'text-[var(--velvet-error)] bg-[var(--velvet-error-bg)] border-[var(--velvet-error-border)]',
  neutral: 'text-[var(--velvet-text-sub)] bg-[var(--velvet-surface-2)] border-[var(--velvet-border)]',
};

export default function FloatingQuickActions({ onActionTrigger }: FloatingQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: { label: string; type: 'appointment' | 'note' | 'treatment' | 'invoice' | 'payment' | 'lab' | 'radiology' | 'photo' | 'referral' | 'prescription'; icon: typeof Calendar; tone: Tone }[] = [
    { label: "New Appointment", type: "appointment", icon: Calendar, tone: "info" },
    { label: "Clinical SOAP Note", type: "note", icon: FileText, tone: "success" },
    { label: "Treatment Plan", type: "treatment", icon: Clipboard, tone: "warning" },
    { label: "New Invoice", type: "invoice", icon: DollarSign, tone: "accent" },
    { label: "Record Payment", type: "payment", icon: CreditCard, tone: "success" },
    { label: "Lab Order / Case", type: "lab", icon: FlaskConical, tone: "error" },
    { label: "Radiology (CBCT)", type: "radiology", icon: Layers, tone: "info" },
    { label: "Clinical Photo", type: "photo", icon: Camera, tone: "neutral" },
    { label: "Specialist Referral", type: "referral", icon: Send, tone: "info" },
    { label: "Write Prescription", type: "prescription", icon: FileDown, tone: "error" },
  ];

  const handleActionClick = (type: any) => {
    setIsOpen(false);
    onActionTrigger(type);
  };

  return (
    <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
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
              className="z-40 w-56 text-start"
            >
              <Card variant="glass-heavy" hover={false} className="p-3 shadow-[var(--velvet-shadow-pop)]">
                <div className="px-2.5 pb-2 border-b" style={{ borderColor: 'var(--velvet-border)' }}>
                  <span className="text-2xs font-mono text-[var(--velvet-text-muted)] uppercase tracking-widest font-bold">Quick Patient Intake</span>
                </div>
                <div className="flex flex-col max-h-[380px] overflow-y-auto scrollbar-none gap-0.5 mt-2">
                  {actions.map((act) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={act.type}
                        onClick={() => handleActionClick(act.type)}
                        className="w-full text-start px-2 py-2.5 rounded-xl transition-all flex items-center gap-3 text-xs text-[var(--velvet-text-sub)] hover:text-[var(--velvet-text)] hover:bg-[var(--velvet-surface-2)]"
                      >
                        <div className={`p-1.5 rounded-lg border shrink-0 ${toneClasses[act.tone]}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold">{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Primary Toggle FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        className="w-12 h-12 rounded-full p-0 flex items-center justify-center z-40 shadow-[var(--velvet-shadow-pop)] active:scale-95"
        variant={isOpen ? 'secondary' : 'primary'}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  );
}
