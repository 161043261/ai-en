import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { homeStats } from "./home-stats";

export type HomeMotionRefs = {
  readonly featureGridRef: RefObject<HTMLElement | null>;
  readonly heroRef: RefObject<HTMLElement | null>;
  readonly introRef: RefObject<HTMLElement | null>;
  readonly statGridRef: RefObject<HTMLElement | null>;
};

export type HomeMotionState = HomeMotionRefs & {
  readonly statValues: readonly string[];
};

function hasReducedMotionPreference(): boolean {
  return (
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

function canUseGsapMotion(): boolean {
  return typeof globalThis.matchMedia === "function";
}

function formatStatValue(value: number, suffix: string): string {
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M${suffix}`;
  }

  return `${Math.round(value)}${suffix}`;
}

export function useHomeMotion(): HomeMotionState {
  const featureGridRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const statGridRef = useRef<HTMLElement>(null);
  const [statValues, setStatValues] = useState<readonly string[]>(() =>
    homeStats.map((stat) => stat.displayValue),
  );

  useEffect(() => {
    if (!canUseGsapMotion() || hasReducedMotionPreference()) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: 24 },
          { duration: 0.7, ease: "power2.out", opacity: 1, y: 0 },
        );
      }

      if (introRef.current) {
        gsap.fromTo(
          introRef.current,
          { opacity: 0, y: 48 },
          {
            duration: 0.7,
            ease: "power2.out",
            opacity: 1,
            scrollTrigger: { start: "top 80%", trigger: introRef.current },
            y: 0,
          },
        );
      }

      if (featureGridRef.current) {
        gsap.fromTo(
          Array.from(featureGridRef.current.children),
          { opacity: 0, scale: 0.98, y: 40 },
          {
            duration: 0.5,
            ease: "power2.out",
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              start: "top 75%",
              trigger: featureGridRef.current,
            },
            stagger: 0.08,
            y: 0,
          },
        );
      }

      homeStats.forEach((stat, index) => {
        const counter = { value: 0 };
        const tweenVars = {
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => {
            setStatValues((currentValues) =>
              currentValues.map((currentValue, currentIndex) =>
                currentIndex === index
                  ? formatStatValue(counter.value, stat.suffix)
                  : currentValue,
              ),
            );
          },
          value: stat.target,
          ...(statGridRef.current
            ? {
                scrollTrigger: {
                  start: "top 85%",
                  trigger: statGridRef.current,
                },
              }
            : {}),
        };

        gsap.to(counter, tweenVars);
      });
    });

    return () => {
      context.revert();
    };
  }, []);

  return { featureGridRef, heroRef, introRef, statGridRef, statValues };
}
