import React from 'react';
import { motion } from 'motion/react';

interface WorkspaceTabPanelProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function WorkspaceTabPanel({ children, className = "h-full flex flex-col justify-between", id }: WorkspaceTabPanelProps) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
