'use client';

import { useScroll, useTransform, useMotionValueEvent, useReducedMotion, type Variants } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';

// ─── Shared Variants ────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const springPop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

// ─── Stagger Containers ─────────────────────────────────────

export const staggerContainer = (
  stagger = 0.08,
  delay = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

// ─── Word Split Helper ──────────────────────────────────────

export const wordSplitContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const wordSplitChild: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ─── Hooks ──────────────────────────────────────────────────

/**
 * Returns true when scroll passes threshold — used for nav bg transition.
 */
export function useScrollPastThreshold(threshold = 100) {
  const [past, setPast] = useState(false);
  const { scrollY } = useScroll();
  const pastRef = useRef(false);

  // Guard: only setState when the value actually flips — avoids re-rendering
  // Nav on every scroll frame (Lenis fires at 60fps regardless of threshold)
  const handleChange = useCallback((latest: number) => {
    const isPast = latest > threshold;
    if (isPast !== pastRef.current) {
      pastRef.current = isPast;
      setPast(isPast);
    }
  }, [threshold]);

  useMotionValueEvent(scrollY, 'change', handleChange);

  return past;
}

/**
 * Returns a parallax y-transform for an element based on scroll progress
 * within its parent section.
 */
export function useParallax(range: [number, number] = [60, -60]) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], range);
  return { ref, y };
}

/**
 * Wraps useReducedMotion — returns true if user prefers reduced motion.
 */
export function usePrefersReducedMotion() {
  return useReducedMotion();
}

// ─── Viewport Config ────────────────────────────────────────

export const viewportOnce = {
  once: true,
  margin: '-100px' as const,
};

export const viewportOnceEarly = {
  once: true,
  margin: '-50px' as const,
};
