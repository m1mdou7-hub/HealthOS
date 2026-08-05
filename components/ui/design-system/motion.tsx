'use client';

import React, { useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  useReducedMotion,
  AnimatePresence
} from 'framer-motion';

export const SPRING = { type: 'spring', stiffness: 260, damping: 26, mass: 0.8 } as const;
export const EASE = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────────────────────────────────────────
   Reveal — scroll-triggered entrance animation.
   ───────────────────────────────────────────────────────────── */

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = 'div'
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();

  const MotionTag = motion[as];

  return (
    <MotionTag
      ref={ref as any}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/* ─────────────────────────────────────────────────────────────
   Stagger — parent that orchestrates children fade-up in sequence.
   ───────────────────────────────────────────────────────────── */

export function Stagger({
  children,
  className,
  delay = 0.08,
  start = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  start?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: start + i * delay, ease: EASE } }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MagneticButton — button that gravitates toward the cursor.
   ───────────────────────────────────────────────────────────── */

export function MagneticButton({
  children,
  className,
  strength = 0.35,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { strength?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.6 });
  const reduce = useReducedMotion();

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (reduce) return;
      const rect = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
      y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
    },
    [strength, reduce, x, y]
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      style={{ x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      className={cn('cursor-pointer', className)}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────
   PageTransition — smooth enter/exit for route changes.
   ───────────────────────────────────────────────────────────── */

export function PageTransition({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Float — decorative element with continuous idle float.
   ───────────────────────────────────────────────────────────── */

export function Float({
  children,
  duration = 7,
  className
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -14, 0], rotate: [0, 3, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TiltCard — 3D perspective tilt that follows the cursor.
   ───────────────────────────────────────────────────────────── */

export function TiltCard({
  children,
  className,
  max = 8
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      (rotateY as any).set(px * max * 2);
      (rotateX as any).set(-py * max * 2);
    },
    [reduce, max, rotateX, rotateY]
  );

  const onLeave = useCallback(() => {
    (rotateX as any).set(0);
    (rotateY as any).set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('[perspective:1000px]', className)}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AnimatedList — AnimatePresence list mount/unmount.
   ───────────────────────────────────────────────────────────── */

export function AnimatedPresenceList({
  show,
  children
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
