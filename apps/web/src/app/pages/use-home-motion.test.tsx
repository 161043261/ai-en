import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useHomeMotion } from "./use-home-motion";

const gsapCalls = vi.hoisted(() => ({
  fromTo: vi.fn(),
  registerPlugin: vi.fn(),
  to: vi.fn(),
}));

vi.mock("gsap", () => ({
  default: {
    context: (callback: VoidFunction) => {
      callback();
      return { revert: vi.fn() };
    },
    fromTo: gsapCalls.fromTo,
    registerPlugin: gsapCalls.registerPlugin,
    to: gsapCalls.to,
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

function setReducedMotion(matches: boolean): void {
  vi.stubGlobal("matchMedia", () => ({ matches }));
}

function HomeMotionHarness() {
  const { featureGridRef, heroRef, introRef, statGridRef, statValues } =
    useHomeMotion();

  return (
    <div>
      <section ref={heroRef}>Hero</section>
      <section ref={introRef}>Intro</section>
      <section ref={statGridRef}>{statValues[0]}</section>
      <section ref={featureGridRef}>
        <article>One</article>
        <article>Two</article>
      </section>
    </div>
  );
}

describe("useHomeMotion", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test("starts GSAP animations for the home sections", () => {
    setReducedMotion(false);

    render(<HomeMotionHarness />);

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(gsapCalls.registerPlugin).toHaveBeenCalledTimes(1);
    expect(gsapCalls.fromTo).toHaveBeenCalledTimes(3);
    expect(gsapCalls.to).toHaveBeenCalledTimes(4);
  });

  test("skips GSAP animations when reduced motion is preferred", () => {
    setReducedMotion(true);

    render(<HomeMotionHarness />);

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(gsapCalls.registerPlugin).not.toHaveBeenCalled();
    expect(gsapCalls.fromTo).not.toHaveBeenCalled();
    expect(gsapCalls.to).not.toHaveBeenCalled();
  });
});
