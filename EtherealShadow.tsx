"use client";

/**
 * EtherealShadow
 * -----------------------------------------------------------------------
 * Ambient, animated smoke / aurora background — the kind of slow, drifting
 * amber glow you see behind hero sections on protocol landing pages.
 *
 * How it works:
 *  1. An SVG <feTurbulence> + <feDisplacementMap> filter generates organic,
 *     cloud-like noise. We slowly animate the turbulence's baseFrequency
 *     and the displacement scale with framer-motion, which makes the noise
 *     "drift" instead of sitting static.
 *  2. A radial/conic gradient (amber -> orange -> near-black) is masked
 *     through that noise, giving the smoky, uneven glow.
 *  3. A couple of thin animated "light streak" lines sweep across on loop,
 *     matching the comet-trail accents in the reference design.
 *  4. Everything sits absolutely positioned behind your content — just wrap
 *     your hero section in a `relative` container and drop this in first.
 *
 * Install:
 *    npm install framer-motion
 *
 * Usage:
 *    <section className="relative overflow-hidden bg-[#0a0704]">
 *      <EtherealShadow />
 *      <div className="relative z-10">
 *        ...your hero content...
 *      </div>
 *    </section>
 *
 * Respects prefers-reduced-motion: animation is skipped and a static
 * gradient is shown instead.
 */

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type EtherealShadowProps = {
  /** Base hue of the glow. Defaults to the amber/orange theme. */
  colors?: {
    from?: string; // deep background tone
    mid?: string; // primary glow tone
    to?: string; // hot highlight tone
  };
  /** Overall opacity of the noise/glow layer (0–1). */
  intensity?: number;
  /** Animation speed multiplier. 1 = default, 0.5 = slower, 2 = faster. */
  speed?: number;
  className?: string;
};

export default function EtherealShadow({
  colors = {
    from: "#0a0704",
    mid: "#7a3b12",
    to: "#f5a623",
  },
  intensity = 0.55,
  speed = 1,
  className = "",
}: EtherealShadowProps) {
  const filterId = useId().replace(/:/g, "");
  const prefersReducedMotion = useReducedMotion();
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const [seed, setSeed] = useState(0);

  // Slowly cycle the turbulence seed so the noise pattern drifts over time
  // instead of animating baseFrequency directly (cheaper & smoother).
  useEffect(() => {
    if (prefersReducedMotion) return;
    let frame: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      if (dt > 60 / speed) {
        last = now;
        setSeed((s) => (s + 1) % 1000);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion, speed]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Base gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 20%, ${colors.mid}33 0%, ${colors.from} 65%)`,
        }}
      />

      {/* Animated noise / smoke layer */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={`turb-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.004 0.008"
              numOctaves={3}
              seed={seed}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={60} />
          </filter>

          <radialGradient id={`glow-${filterId}`} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor={colors.to} stopOpacity={intensity} />
            <stop offset="45%" stopColor={colors.mid} stopOpacity={intensity * 0.7} />
            <stop offset="100%" stopColor={colors.from} stopOpacity={0} />
          </radialGradient>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill={`url(#glow-${filterId})`}
          filter={`url(#turb-${filterId})`}
        />
      </svg>

      {/* Drifting light streaks */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute left-0 top-[30%] h-px w-1/2"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.to}, transparent)`,
            }}
            initial={{ x: "-20%", opacity: 0 }}
            animate={{ x: "160%", opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 6 / speed,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute right-0 top-[55%] h-px w-1/3"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.to}, transparent)`,
            }}
            initial={{ x: "20%", opacity: 0 }}
            animate={{ x: "-160%", opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 8 / speed,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </>
      )}

      {/* Vignette so foreground text stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 50% 0%, transparent 30%, ${colors.from}cc 90%)`,
        }}
      />
    </div>
  );
}
