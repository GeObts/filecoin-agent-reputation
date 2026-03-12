"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DEFAULTS = {
  duration: 0.4,
  ease: "power2.out",
  y: 20,
  stagger: 0.08,
  scrollStart: "top 90%",
};

/** Resolve children using :scope so relative selectors ("> *") work. */
function scopedQuery(el: HTMLElement, selector: string): Element[] {
  const scoped = selector
    .split(",")
    .map((s) => `:scope ${s.trim()}`)
    .join(", ");
  return Array.from(el.querySelectorAll(scoped));
}

/**
 * Fade+slide up on mount (above-fold content).
 */
export function useGsapEntrance(ref: RefObject<HTMLElement | null>) {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    ctx.current = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: DEFAULTS.y,
        duration: DEFAULTS.duration,
        ease: DEFAULTS.ease,
      });
    });

    return () => ctx.current?.revert();
  }, [ref]);
}

/**
 * Stagger direct children on mount (above-fold, no scroll trigger).
 */
export function useGsapEntranceStagger(
  ref: RefObject<HTMLElement | null>,
  selector: string = "> *",
) {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = scopedQuery(el, selector);
    if (targets.length === 0) return;

    ctx.current = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y: DEFAULTS.y,
        duration: DEFAULTS.duration,
        ease: DEFAULTS.ease,
        stagger: DEFAULTS.stagger,
      });
    });

    return () => ctx.current?.revert();
  }, [ref, selector]);
}

/**
 * Fade+slide up when scrolled into view.
 */
export function useGsapScroll(ref: RefObject<HTMLElement | null>) {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    ctx.current = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: DEFAULTS.y,
        duration: DEFAULTS.duration,
        ease: DEFAULTS.ease,
        scrollTrigger: {
          trigger: el,
          start: DEFAULTS.scrollStart,
          once: true,
        },
      });
    });

    return () => ctx.current?.revert();
  }, [ref]);
}

/**
 * Stagger children when scrolled into view.
 */
export function useGsapStagger(
  ref: RefObject<HTMLElement | null>,
  selector: string = "> *",
) {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = scopedQuery(el, selector);
    if (targets.length === 0) return;

    ctx.current = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y: DEFAULTS.y,
        duration: DEFAULTS.duration,
        ease: DEFAULTS.ease,
        stagger: DEFAULTS.stagger,
        scrollTrigger: {
          trigger: el,
          start: DEFAULTS.scrollStart,
          once: true,
        },
      });
    });

    return () => ctx.current?.revert();
  }, [ref, selector]);
}
