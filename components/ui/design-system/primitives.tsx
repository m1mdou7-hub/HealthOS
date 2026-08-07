'use client';

import React, { useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { motion, useMotionValue, useSpring, useInView, useReducedMotion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   GlassCard — the fundamental surface of the Clinical OS.
   Elevated 3D glass with inner glow, optional hover lift.
   ───────────────────────────────────────────────────────────── */

export function GlassCard({
  className,
  hover = true,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        'card-elevated',
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SectionTitle — eyebrow + heading + description with
   Apple-like hierarchy and perfect typographic rhythm.
   ───────────────────────────────────────────────────────────── */

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'start',
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'start' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'space-y-2',
        align === 'center' && 'text-center mx-auto',
        className
      )}
    >
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
        <p className="text-sm text-muted max-w-2xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   StatCard — KPI surface with big number, label, delta and icon.
   ───────────────────────────────────────────────────────────── */

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = 'default',
  className
}: {
  label: string;
  value: React.ReactNode;
  delta?: { text: string; positive?: boolean };
  icon?: React.ReactNode;
  tone?: 'default' | 'accent';
  className?: string;
}) {
  return (
    <GlassCard
      hover
      className={cn(
        'p-5 min-h-[118px] flex flex-col justify-between',
        tone === 'accent' && 'border-strong',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="text-2xs font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        {icon && (
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center border"
            style={{
              background: 'var(--accent-glow2)',
              borderColor: 'var(--border-strong)',
              color: 'var(--accent)'
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="font-display font-extrabold text-3xl leading-none tracking-tight">
          {value}
        </div>
        {delta && (
          <div
            className="mt-1.5 text-xs font-semibold flex items-center gap-1.5"
            style={{ color: delta.positive ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {delta.positive
                ? <polyline points="18 15 12 9 6 15" />
                : <polyline points="6 9 12 15 18 9" />}
            </svg>
            {delta.text}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────────────────────
   Badge — pill tag with accent glow.
   ───────────────────────────────────────────────────────────── */

export function Badge({
  children,
  tone = 'default',
  className
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'warning';
  className?: string;
}) {
  const colors: Record<string, React.CSSProperties> = {
    default: { background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-sub)' },
    accent: { background: 'var(--accent-glow2)', borderColor: 'var(--border-strong)', color: 'var(--accent)' },
    success: { background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' },
    warning: { background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)', color: '#fbbf24' }
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
        className
      )}
      style={colors[tone]}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Kbd — keyboard key chip.
   ───────────────────────────────────────────────────────────── */

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="px-1.5 py-0.5 text-2xs font-mono rounded-md border"
      style={{
        background: 'var(--surface-2)',
        borderColor: 'var(--border)',
        color: 'var(--text-sub)'
      }}
    >
      {children}
    </kbd>
  );
}

/* ─────────────────────────────────────────────────────────────
   PageHeader — the top banner of every workspace.
   ───────────────────────────────────────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8', className)}>
      <div className="space-y-1.5">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="section-title text-3xl sm:text-4xl">{title}</h1>
        {description && (
          <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Divider — hairline with gradient fade.
   ───────────────────────────────────────────────────────────── */

export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-px w-full', className)}
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, var(--border-strong) 50%, transparent 100%)'
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   AmbientGlow — decorative floating geometry for background depth.
   ───────────────────────────────────────────────────────────── */

export function AmbientGlow({ className, variant = 'blob' }: { className?: string; variant?: 'blob' | 'ring' | 'cube' }) {
  if (variant === 'ring') {
    return (
      <div
        className={cn('absolute pointer-events-none rounded-full float-spin', className)}
        style={{ border: '1px solid var(--border-strong)', boxShadow: '0 0 40px var(--accent-glow2)' }}
      />
    );
  }
  if (variant === 'cube') {
    return (
      <div
        className={cn('absolute pointer-events-none float-y', className)}
        style={{
          background: 'linear-gradient(135deg, var(--accent-glow2), transparent)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 48px -24px var(--accent-glow)'
        }}
      />
    );
  }
  return (
    <div
      className={cn('absolute pointer-events-none rounded-full blur-[100px] float-y', className)}
      style={{ background: 'var(--accent-glow2)' }}
    />
  );
}
