import React from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the WorkspaceTabPanel component.
 * @param children - The content to render inside the panel.
 * @param className - Optional CSS class name for styling the panel.
 * @param id - Optional unique identifier for the panel, used for animation keys.
 */
interface WorkspaceTabPanelProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const WorkspaceTabPanel = React.memo(function WorkspaceTabPanel({ children, className = "h-full flex flex-col justify-between", id }: WorkspaceTabPanelProps) {
  return (
    <motion.div
      id={id}
      key={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
      role="tabpanel"
      aria-labelledby={id ? `${id}-tab` : undefined}
    >
      {children}
    </motion.div>
  );
});
