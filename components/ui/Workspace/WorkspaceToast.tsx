import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface WorkspaceToastProps {
  message: string;
}

export function WorkspaceToast({ message }: WorkspaceToastProps) {
  return (
    <div className="fixed bottom-6 end-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-3xl shadow-pop flex items-center gap-2 border border-emerald-500/30">
      <CheckCircle2 className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
