'use client';

import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, ChevronDown, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';

/* ═══════════════════════════════════════════════════════════════
   BUTTONS — Three levels exactly: Primary, Secondary, Ghost
   Danger actions use Secondary shape with error tokens
   ═══════════════════════════════════════════════════════════════ */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, fullWidth = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all cursor-pointer select-none';
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    const variantClasses = {
      primary: 'velvet-btn-primary',
      secondary: 'velvet-btn-secondary',
      ghost: 'velvet-btn-ghost',
      danger: 'velvet-btn-danger',
    };
    const dangerStyles: React.CSSProperties = variant === 'danger' 
      ? { 
          background: 'var(--velvet-error-bg)', 
          color: 'var(--velvet-error)', 
          borderColor: 'var(--velvet-error-border)',
          boxShadow: 'inset 0 1px 0 rgba(248,113,113,0.1)',
        }
      : {};

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        style={{ ...dangerStyles }}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && children}
      </button>
    );
  }
);
Button.displayName = 'Button';

/* ═══════════════════════════════════════════════════════════════
   CARDS — Unified surface primitives
   ═══════════════════════════════════════════════════════════════ */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'gradient' | 'hover' | 'spotlight' | 'gradient-border' | 'glass' | 'glass-heavy';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'elevated', hover = true, children, ...props }, ref) => {
    const variantClasses = {
      elevated: 'velvet-card',
      gradient: 'velvet-card-gradient',
      hover: 'velvet-card velvet-card-hover',
      spotlight: 'velvet-spotlight-card',
      'gradient-border': 'velvet-gradient-border',
      glass: 'velvet-glass',
      'glass-heavy': 'velvet-glass-heavy',
    };
    
    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], hover && variant !== 'hover' && 'velvet-card-hover', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 border-b', className)} style={{ borderColor: 'var(--velvet-border)' }} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
);
CardBody.displayName = 'CardBody';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 border-t', className)} style={{ borderColor: 'var(--velvet-border)', background: 'var(--velvet-surface-2)', color: 'var(--velvet-text-muted)' }} {...props}>
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

/* ═══════════════════════════════════════════════════════════════
   INPUTS — Single global recipe
   ═══════════════════════════════════════════════════════════════ */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, fullWidth = true, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full', className)}>
        {label && (
          <label htmlFor={inputId} className="block font-semibold text-sm" style={{ color: 'var(--velvet-text)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 shrink-0" style={{ color: 'var(--velvet-text-muted)' }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl outline-none transition-all',
              'bg-[var(--velvet-glass-fill)] backdrop-blur-[10px] border',
              'placeholder:text-[var(--velvet-text-muted)] placeholder:opacity-80',
              leftIcon && 'ps-10',
              rightIcon && 'pe-10',
              error 
                ? 'border-[var(--velvet-error-border)] focus:border-[var(--velvet-error)] focus:ring-3 focus:ring-[var(--velvet-error-bg)]'
                : 'border-[var(--velvet-border)] focus:border-[var(--velvet-accent)] focus:ring-3 focus:ring-[var(--velvet-accent-glow2)]',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 shrink-0" style={{ color: 'var(--velvet-text-muted)' }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-sm flex items-center gap-1" role="alert" style={{ color: 'var(--velvet-error)' }}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm" style={{ color: 'var(--velvet-text-muted)' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, fullWidth = true, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full', className)}>
        {label && (
          <label htmlFor={textareaId} className="block font-semibold text-sm" style={{ color: 'var(--velvet-text)' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl outline-none transition-all resize-y min-h-[100px]',
            'bg-[var(--velvet-glass-fill)] backdrop-blur-[10px] border',
            'placeholder:text-[var(--velvet-text-muted)] placeholder:opacity-80',
            error 
              ? 'border-[var(--velvet-error-border)] focus:border-[var(--velvet-error)] focus:ring-3 focus:ring-[var(--velvet-error-bg)]'
              : 'border-[var(--velvet-border)] focus:border-[var(--velvet-accent)] focus:ring-3 focus:ring-[var(--velvet-accent-glow2)]',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm flex items-center gap-1" role="alert" style={{ color: 'var(--velvet-error)' }}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm" style={{ color: 'var(--velvet-text-muted)' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
);
Textarea.displayName = 'Textarea';

/* ═══════════════════════════════════════════════════════════════
   SELECT — Native select with design tokens
   ═══════════════════════════════════════════════════════════════ */

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, fullWidth = true, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2)}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full', className)}>
        {label && (
          <label htmlFor={selectId} className="block font-semibold text-sm" style={{ color: 'var(--velvet-text)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-3.5 py-2.5 pr-10 rounded-xl outline-none transition-all appearance-none',
              'bg-[var(--velvet-glass-fill)] backdrop-blur-[10px] border',
              error 
                ? 'border-[var(--velvet-error-border)] focus:border-[var(--velvet-error)] focus:ring-3 focus:ring-[var(--velvet-error-bg)]'
                : 'border-[var(--velvet-border)] focus:border-[var(--velvet-accent)] focus:ring-3 focus:ring-[var(--velvet-accent-glow2)]',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--velvet-text-muted)' }} />
        </div>
        {error && (
          <p id={errorId} className="text-sm flex items-center gap-1" role="alert" style={{ color: 'var(--velvet-error)' }}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm" style={{ color: 'var(--velvet-text-muted)' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
);
Select.displayName = 'Select';

/* ═══════════════════════════════════════════════════════════════
   TABS — Horizontal workspace tabs with AnimatePresence
   ═══════════════════════════════════════════════════════════════ */

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  grouped?: { id: string; label: string; items: TabItem[] }[];
}

export function Tabs({ tabs, activeTab, onChange, className, grouped }: TabsProps) {
  const allTabs = grouped?.flatMap(g => g.items) || tabs;
  
  return (
    <div className={cn('overflow-x-auto scrollbar-none', className)} role="tablist">
      <div className="flex items-center gap-1.5 shrink-0">
        {grouped ? grouped.map((group, groupIdx) => (
          <div key={group.id} className="flex items-center gap-1.5 shrink-0">
            {groupIdx > 0 && <div className="mx-1.5 h-5 w-px shrink-0" style={{ background: 'var(--velvet-border)' }} />}
            <span className="text-xs font-sans font-semibold select-none shrink-0" style={{ color: 'var(--velvet-text-sub)' }}>
              {group.label}
            </span>
            {group.items.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => !tab.disabled && onChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'velvet-nav-item shrink-0',
                  activeTab === tab.id && 'active',
                  tab.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {tab.icon && <span className="w-[18px] h-[18px] shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-sans font-bold border" style={{ background: 'var(--velvet-surface-2)', color: 'var(--velvet-text-sub)', borderColor: 'var(--velvet-border)' }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )) : (
          allTabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'velvet-nav-item shrink-0',
                activeTab === tab.id && 'active',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.icon && <span className="w-[18px] h-[18px] shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-sans font-bold border" style={{ background: 'var(--velvet-surface-2)', color: 'var(--velvet-text-sub)', borderColor: 'var(--velvet-border)' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export interface TabPanelProps {
  activeTab: string;
  tabs: TabItem[];
  children: (tabId: string) => React.ReactNode;
  className?: string;
}

export function TabPanel({ activeTab, tabs, children, className }: TabPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className={cn('h-full flex flex-col', className)}
        >
          {activeTab === tab.id && children(tab.id)}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BADGES — Pill tags with semantic tones
   ═══════════════════════════════════════════════════════════════ */

export type BadgeTone = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ children, tone = 'default', className, icon }: BadgeProps) {
  const toneStyles: Record<BadgeTone, React.CSSProperties> = {
    default: { background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)', color: 'var(--velvet-text-sub)' },
    accent: { background: 'var(--velvet-accent-glow2)', borderColor: 'var(--velvet-border-strong)', color: 'var(--velvet-accent)' },
    success: { background: 'var(--velvet-success-bg)', borderColor: 'var(--velvet-success-border)', color: 'var(--velvet-success)' },
    warning: { background: 'var(--velvet-warning-bg)', borderColor: 'var(--velvet-warning-border)', color: 'var(--velvet-warning)' },
    error: { background: 'var(--velvet-error-bg)', borderColor: 'var(--velvet-error-border)', color: 'var(--velvet-error)' },
    info: { background: 'var(--velvet-info-bg)', borderColor: 'var(--velvet-info-border)', color: 'var(--velvet-info)' },
    neutral: { background: 'var(--velvet-neutral-bg)', borderColor: 'var(--velvet-neutral-border)', color: 'var(--velvet-neutral)' },
  };
  
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', className)}
      style={toneStyles[tone]}
    >
      {icon}
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AVATARS — Initial-letter monogram in accent pill
   ═══════════════════════════════════════════════════════════════ */

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export function Avatar({ name, src, size = 'md', color, className }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const bgColor = color || `hsl(${name ? Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) * 3.7 % 360 : 0}, 70%, 50%)`;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-bold select-none', sizeClasses[size], className)}
      style={{ background: bgColor, color: 'white' }}
    >
      {initials}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOOLTIP — Radix-based with design tokens
   ═══════════════════════════════════════════════════════════════ */

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, side = 'top', delay = 200 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const childRef = useRef<HTMLElement>(null);

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  }, []);

  useEffect(() => {
    const el = childRef.current;
    if (!el) return;
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
    return () => {
      el.removeEventListener('mouseenter', show);
      el.removeEventListener('mouseleave', hide);
      el.removeEventListener('focus', show);
      el.removeEventListener('blur', hide);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [show, hide]);

  const tooltipContent = (
    <div
      className="z-50 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap pointer-events-none animate-fade-in"
      style={{
        background: 'var(--velvet-surface-solid)',
        color: 'var(--velvet-text)',
        border: '1px solid var(--velvet-border-strong)',
        boxShadow: 'var(--velvet-shadow-pop)',
      }}
    >
      {content}
    </div>
  );

  return (
    <>
      <span ref={childRef} tabIndex={0}>{children}</span>
      {open && createPortal(tooltipContent, document.body)}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ALERTS — Inline/section error cards
   ═══════════════════════════════════════════════════════════════ */

export type AlertTone = 'error' | 'warning' | 'info' | 'success';

export interface AlertProps {
  tone: AlertTone;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const alertIcons: Record<AlertTone, React.ReactNode> = {
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle2 className="w-5 h-5" />,
};

const alertStyles: Record<AlertTone, React.CSSProperties> = {
  error: { background: 'var(--velvet-error-bg)', borderColor: 'var(--velvet-error-border)', color: 'var(--velvet-error)' },
  warning: { background: 'var(--velvet-warning-bg)', borderColor: 'var(--velvet-warning-border)', color: 'var(--velvet-warning)' },
  info: { background: 'var(--velvet-info-bg)', borderColor: 'var(--velvet-info-border)', color: 'var(--velvet-info)' },
  success: { background: 'var(--velvet-success-bg)', borderColor: 'var(--velvet-success-border)', color: 'var(--velvet-success)' },
};

export function Alert({ tone, title, description, actions, className, dismissible, onDismiss }: AlertProps) {
  return (
    <div
      className={cn('p-4 rounded-2xl border flex gap-3', className)}
      style={alertStyles[tone]}
      role="alert"
    >
      <div className="shrink-0" style={{ color: 'currentColor' }}>
        {alertIcons[tone]}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        {description && <p className="text-xs leading-relaxed" style={{ opacity: 0.9 }}>{description}</p>}
        {actions && <div className="pt-2">{actions}</div>}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg transition-colors"
          style={{ color: 'currentColor', opacity: 0.6 }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOASTS — Design token based toasts
   ═══════════════════════════════════════════════════════════════ */

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  default: <Info className="w-5 h-5" />,
  success: <CheckCircle2 className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const toastStyles: Record<ToastType, React.CSSProperties> = {
  default: { background: 'var(--velvet-accent-glow2)', borderColor: 'var(--velvet-border-strong)', color: 'var(--velvet-accent)' },
  success: { background: 'var(--velvet-success-bg)', borderColor: 'var(--velvet-success-border)', color: 'var(--velvet-success)' },
  error: { background: 'var(--velvet-error-bg)', borderColor: 'var(--velvet-error-border)', color: 'var(--velvet-error)' },
  warning: { background: 'var(--velvet-warning-bg)', borderColor: 'var(--velvet-warning-border)', color: 'var(--velvet-warning)' },
  info: { background: 'var(--velvet-info-bg)', borderColor: 'var(--velvet-info-border)', color: 'var(--velvet-info)' },
};

export function Toast({ type = 'default', title, description, action, duration = 5000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className="fixed bottom-6 end-6 z-50 flex items-start gap-3 max-w-sm animate-fade-in"
      style={{ ...toastStyles[type], border: '1px solid', borderRadius: '1.75rem', padding: '1rem', boxShadow: 'var(--velvet-shadow-pop)' }}
      role="alert"
    >
      <div className="shrink-0 mt-0.5" style={{ color: 'currentColor' }}>
        {toastIcons[type]}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        {description && <p className="text-xs leading-relaxed" style={{ opacity: 0.9 }}>{description}</p>}
        {action && <div className="pt-1">{action}</div>}
      </div>
      <button
        onClick={() => { setVisible(false); onClose?.(); }}
        className="shrink-0 p-1 rounded-lg transition-colors"
        style={{ color: 'currentColor', opacity: 0.6 }}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (index: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 end-6 z-50 flex flex-col gap-2" role="region" aria-label="Notifications">
      {toasts.map((toast, index) => (
        <Toast key={index} {...toast} onClose={() => onRemove(index)} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL — Radix-compatible with design tokens
   ═══════════════════════════════════════════════════════════════ */

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeClassesModal = {
  sm: 'max-w-[384px]',
  md: 'max-w-[480px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[800px]',
  full: 'max-w-[90vw]',
};

export function Modal({ open, onOpenChange, title, description, children, actions, size = 'md', closeOnOverlayClick = true, closeOnEscape = true }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onOpenChange(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, closeOnEscape, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        className="fixed inset-0"
        style={{ background: 'var(--velvet-bg)', opacity: 0.6, backdropFilter: 'blur(8px)' }}
      />
      <motion.div
        ref={contentRef}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className={cn('w-full', sizeClassesModal[size], 'animate-scale-in')}
        style={{
          background: 'var(--velvet-surface-solid)',
          backdropFilter: 'blur(44px) saturate(200%)',
          border: '1px solid var(--velvet-border-strong)',
          borderRadius: '1.75rem',
          boxShadow: 'var(--velvet-shadow-pop)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'var(--velvet-border)' }}>
          <div>
            <h2 id="modal-title" className="section-title text-xl">{title}</h2>
            {description && (
              <p id="modal-description" className="text-sm mt-1" style={{ color: 'var(--velvet-text-sub)' }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="shrink-0 p-1 rounded-lg transition-colors"
            style={{ color: 'var(--velvet-text-muted)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        {actions && (
          <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--velvet-border)' }}>
            {actions}
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════
   DRAWER — Slide-in panel from logical start
   ═══════════════════════════════════════════════════════════════ */

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  direction?: 'start' | 'end';
}

const sizeClassesDrawer = {
  sm: 'max-w-[320px] w-full',
  md: 'max-w-[384px] w-full',
  lg: 'max-w-[480px] w-full',
};

export function Drawer({ open, onOpenChange, title, description, children, actions, size = 'md', direction = 'start' }: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 flex-1"
        style={{ background: 'var(--velvet-bg)', opacity: 0.6, backdropFilter: 'blur(4px)' }}
      />
      <motion.div
        initial={{ x: direction === 'start' ? -300 : 300 }}
        animate={{ x: 0 }}
        exit={{ x: direction === 'start' ? -300 : 300 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={cn('relative flex flex-col h-full', sizeClassesDrawer[size])}
        style={{
          background: 'var(--velvet-surface-solid)',
          backdropFilter: 'blur(44px) saturate(180%)',
          borderColor: 'var(--velvet-border-strong)',
          boxShadow: 'var(--velvet-shadow-pop)',
          borderRadius: direction === 'start' ? '0 1.75rem 1.75rem 0' : '1.75rem 0 0 1.75rem',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderTop: 'none',
          borderBottom: 'none',
          [direction === 'start' ? 'borderRight' : 'borderLeft']: '1px solid var(--velvet-border-strong)',
        }}
      >
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'var(--velvet-border)' }}>
          <div>
            <h2 className="section-title text-xl">{title}</h2>
            {description && <p className="text-sm mt-1" style={{ color: 'var(--velvet-text-sub)' }}>{description}</p>}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="shrink-0 p-1 rounded-lg transition-colors"
            style={{ color: 'var(--velvet-text-muted)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        {actions && (
          <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--velvet-border)' }}>
            {actions}
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════
   TABLE — Data-heavy tables with scroll wrapper & sticky column
   ═══════════════════════════════════════════════════════════════ */

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sticky?: boolean;
  align?: 'start' | 'end' | 'center';
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  stickyFirstColumn?: boolean;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
}

export function Table<T>({ 
  columns, 
  data, 
  keyExtractor, 
  emptyState, 
  loading = false, 
  stickyFirstColumn = false, 
  className,
  rowClassName,
}: TableProps<T>) {
  const hasSticky = stickyFirstColumn && columns.length > 0 && columns[0].sticky !== false;
  
  if (loading) {
    return (
      <div className={cn('overflow-x-auto scrollbar-none', className)}>
        <table className="w-full border-collapse" role="table">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--velvet-border)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-start font-mono font-bold uppercase tracking-[0.18em] p-3"
                  style={{ fontSize: '0.625rem', color: 'var(--velvet-text-muted)', whiteSpace: 'nowrap' }}
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--velvet-border)' }}>
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    <div className="velvet-skeleton h-4 w-[120px]" style={{ borderRadius: '0.5rem' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('velvet-card p-12 text-center', className)}>
        {emptyState || (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--velvet-surface-2)', color: 'var(--velvet-text-muted)' }}>
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h4 className="section-title text-lg">No data</h4>
              <p className="text-sm" style={{ color: 'var(--velvet-text-muted)' }}>No matching records found.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto scrollbar-none', className)}>
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--velvet-border)' }}>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={cn(
                  'font-mono font-bold uppercase tracking-[0.18em] p-3 sticky top-0 z-10',
                  'text-start',
                  hasSticky && idx === 0 && 'sticky start-0',
                  col.className
                )}
                style={{ 
                  fontSize: '0.625rem', 
                  color: 'var(--velvet-text-muted)', 
                  whiteSpace: 'nowrap',
                  background: hasSticky && idx === 0 ? 'var(--velvet-surface-solid)' : 'transparent',
                  borderLeft: hasSticky && idx === 0 ? '1px solid var(--velvet-border)' : undefined,
                  borderRight: hasSticky && idx === columns.length - 1 ? '1px solid var(--velvet-border)' : undefined,
                }}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={keyExtractor(row)}
              className={cn('transition-colors', rowClassName?.(row, rowIdx))}
              style={{ 
                borderBottom: '1px solid var(--velvet-border)',
                backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'var(--velvet-surface-2)',
              }}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.key}
                  className={cn(
                    'p-3 text-sm',
                    col.align === 'end' && 'text-end',
                    col.align === 'center' && 'text-center',
                    hasSticky && colIdx === 0 && 'sticky start-0 font-mono font-medium',
                    col.className
                  )}
                  style={{
                    background: hasSticky && colIdx === 0 ? 'var(--velvet-surface-solid)' : 'transparent',
                    borderLeft: hasSticky && colIdx === 0 ? '1px solid var(--velvet-border)' : undefined,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.render ? col.render(row, rowIdx) : String((row as any)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE — Standardized empty states
   ═══════════════════════════════════════════════════════════════ */

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, primaryAction, secondaryAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center gap-6 p-12', className)}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--velvet-surface-2)', color: 'var(--velvet-text-muted)', opacity: 0.4 }}>
        {icon || <Search className="w-6 h-6" />}
      </div>
      <div className="space-y-2 max-w-sm">
        <h4 className="section-title text-lg">{title}</h4>
        {description && <p className="text-sm" style={{ color: 'var(--velvet-text-sub)' }}>{description}</p>}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
        {primaryAction}
        {secondaryAction}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON — Loading placeholders matching final geometry
   ═══════════════════════════════════════════════════════════════ */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';
  lines?: number;
}

export function Skeleton({ className, variant = 'rectangular', lines = 1, ...props }: SkeletonProps) {
  const baseClass = 'velvet-skeleton';
  
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl',
    'table-row': 'h-10',
  };

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {[...Array(lines)].map((_, i) => (
          <div key={i} className={cn(baseClass, variantClasses.text, i === lines - 1 && 'w-3/4')} style={{ borderRadius: '0.5rem' }} />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(baseClass, 'velvet-card p-6 space-y-4', className)} {...props}>
        <div className="flex items-center justify-between">
          <div className={cn(baseClass, 'h-5 w-1/4')} style={{ borderRadius: '0.5rem' }} />
          <div className={cn(baseClass, 'h-9 w-9 rounded-xl')} />
        </div>
        <div className={cn(baseClass, 'h-8 w-1/2')} style={{ borderRadius: '0.5rem' }} />
        <div className={cn(baseClass, 'h-4 w-3/4')} style={{ borderRadius: '0.5rem' }} />
      </div>
    );
  }

  return (
    <div className={cn(baseClass, variantClasses[variant], className)} {...props} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROGRESS INDICATORS
   ═══════════════════════════════════════════════════════════════ */

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  tone?: 'default' | 'success' | 'warning' | 'error';
}

export function Progress({ value, max = 100, size = 'md', showLabel = false, className, tone = 'default' }: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  const sizeStyles = {
    sm: { height: '4px', borderRadius: '2px' },
    md: { height: '8px', borderRadius: '4px' },
    lg: { height: '12px', borderRadius: '6px' },
  };

  const toneColors: Record<string, { bg: string; fill: string }> = {
    default: { bg: 'var(--velvet-surface-2)', fill: 'var(--velvet-accent)' },
    success: { bg: 'var(--velvet-success-bg)', fill: 'var(--velvet-success)' },
    warning: { bg: 'var(--velvet-warning-bg)', fill: 'var(--velvet-warning)' },
    error: { bg: 'var(--velvet-error-bg)', fill: 'var(--velvet-error)' },
  };

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: toneColors[tone].bg, 
          ...sizeStyles[size],
          border: '1px solid var(--velvet-border)',
        }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={showLabel ? `${percentage}%` : undefined}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
          style={{ 
            background: toneColors[tone].fill,
            borderRadius: 'inherit',
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1.5 text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
  tone?: 'default' | 'success' | 'warning' | 'error';
}

export function CircularProgress({ value, max = 100, size = 48, strokeWidth = 4, showLabel = false, className, tone = 'default' }: CircularProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const toneColors: Record<string, string> = {
    default: 'var(--velvet-accent)',
    success: 'var(--velvet-success)',
    warning: 'var(--velvet-warning)',
    error: 'var(--velvet-error)',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-[var(--velvet-surface-2)]"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[var(--velvet-accent)]"
          strokeWidth={strokeWidth}
          stroke={toneColors[tone]}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono" style={{ color: toneColors[tone] }}>
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION TITLE — Re-export for convenience
   ═══════════════════════════════════════════════════════════════ */

export interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'start' | 'center';
  className?: string;
}

export function SectionTitle({ eyebrow, title, description, align = 'start', className }: SectionTitleProps) {
  return (
    <div className={cn('space-y-2', align === 'center' && 'text-center mx-auto', className)}>
      {eyebrow && (
        <div className={cn('eyebrow', align === 'center' && 'flex justify-center')}>
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-current" />
            {eyebrow}
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-current" />
          </span>
        </div>
      )}
      <h2 className="section-title text-2xl sm:text-3xl">{title}</h2>
      {description && (
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--velvet-text-muted)' }}>
          {description}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DIVIDER — Re-export for convenience
   ═══════════════════════════════════════════════════════════════ */

export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-px w-full', className)}
      style={{
        background: 'linear-gradient(90deg, transparent 0%, var(--velvet-border-strong) 50%, transparent 100%)'
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   KBD — Re-export for convenience
   ═══════════════════════════════════════════════════════════════ */

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="px-1.5 py-0.5 text-2xs font-mono rounded-md border"
      style={{
        background: 'var(--velvet-surface-2)',
        borderColor: 'var(--velvet-border)',
        color: 'var(--velvet-text-sub)'
      }}
    >
      {children}
    </kbd>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER — Re-export for convenience
   ═══════════════════════════════════════════════════════════════ */

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8', className)}>
      <div className="space-y-1.5">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="section-title text-3xl sm:text-4xl">{title}</h1>
        {description && (
          <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--velvet-text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT CARD — Re-export for convenience
   ═══════════════════════════════════════════════════════════════ */

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  delta?: { text: string; positive?: boolean };
  icon?: React.ReactNode;
  tone?: 'default' | 'accent';
  className?: string;
}

export function StatCard({ label, value, delta, icon, tone = 'default', className }: StatCardProps) {
  return (
    <Card hover className={cn('p-5 min-h-[118px] flex flex-col justify-between', tone === 'accent' && 'border-strong', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--velvet-text-muted)' }}>
          {label}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center border" style={{ background: 'var(--velvet-accent-glow2)', borderColor: 'var(--velvet-border-strong)', color: 'var(--velvet-accent)' }}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="font-display font-extrabold text-3xl leading-none tracking-tight">{value}</div>
        {delta && (
          <div className="mt-1.5 text-xs font-semibold flex items-center gap-1.5" style={{ color: delta.positive ? 'var(--velvet-success)' : 'var(--velvet-text-muted)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {delta.positive ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
            {delta.text}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AMBIENT GLOW — Re-export for convenience
   ═══════════════════════════════════════════════════════════════ */

export interface AmbientGlowProps {
  className?: string;
  variant?: 'blob' | 'ring' | 'cube';
}

export function AmbientGlow({ className, variant = 'blob' }: AmbientGlowProps) {
  if (variant === 'ring') {
    return (
      <div className={cn('absolute pointer-events-none rounded-full float-spin', className)} style={{ border: '1px solid var(--velvet-border-strong)', boxShadow: '0 0 40px var(--velvet-accent-glow2)' }} />
    );
  }
  if (variant === 'cube') {
    return (
      <div className={cn('absolute pointer-events-none float-y', className)} style={{ background: 'linear-gradient(135deg, var(--velvet-accent-glow2), transparent)', border: '1px solid var(--velvet-border-strong)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 48px -24px var(--velvet-accent-glow)' }} />
    );
  }
  return (
    <div className={cn('absolute pointer-events-none rounded-full blur-[100px] float-y', className)} style={{ background: 'var(--velvet-accent-glow2)' }} />
  );
}