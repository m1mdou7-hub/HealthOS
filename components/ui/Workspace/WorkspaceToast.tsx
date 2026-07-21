import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Props for the WorkspaceToast component.
 * @param message - The message to display in the toast.
 */
interface WorkspaceToastProps {
  message: string;
}

export const WorkspaceToast = React.memo(function WorkspaceToast({ message }: WorkspaceToastProps) {
  return (
    <div role="alert" aria-live="assertive" className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/30">
      <CheckCircle2 className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
});
