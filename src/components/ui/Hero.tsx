"use client";

/**
 * Hero
 * -----------------------------------------------------------------------
 * Landing hero for MediChain (Stellar-Green) — same structure as the
 * reference (pill badge → headline → subtext → CTA row → nav → button),
 * re-themed from amber/DeFi to a clinical green that fits a decentralized
 * EHR/telemedicine product, and copy rewritten for the actual subject
 * (records, doctors, patients — not vaults and yield).
 *
 * Drop this in as your app/page.tsx hero, or import into a route.
 * Requires: framer-motion, and EtherealShadow.tsx in the same project
 * (see components/ui/EtherealShadow.tsx).
 */

import Link from "next/link";
import EtherealShadow from "@/components/ui/EtherealShadow";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Records", href: "/records" },
  { label: "Doctors", href: "/doctors" },
  { label: "Docs", href: "/docs" },
  { label: "GitHub", href: "https://github.com/krit-k7/Stellar-Green" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#040a06] text-[#eef7f0]">
      {/* Animated ambient background, re-themed to clinical green */}
      <EtherealShadow
        colors={{ from: "#040a06", mid: "#0f4d33", to: "#3ddc84" }}
        intensity={0.5}
        speed={0.9}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Nav */}
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="text-lg font-semibold tracking-tight">MediChain</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-white/60">
              Testnet
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Link
            href="/app"
            className="rounded-full bg-gradient-to-r from-[#14532d] to-[#3ddc84] px-5 py-2.5 text-sm font-semibold text-[#04150a] shadow-[0_0_24px_-6px_rgba(61,220,132,0.6)] transition-transform hover:scale-[1.03]"
          >
            Open App →
          </Link>
        </header>

        {/* Hero content */}
        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-8 text-center sm:px-10">
          <div className="mb-8 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70 backdrop-blur-sm">
            Soroban · Testnet · Decentralized Health Records
          </div>

          <h1 className="text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Your Health Records,{" "}
            <span className="bg-gradient-to-r from-[#3ddc84] via-[#7fe8ad] to-[#a8f0c6] bg-clip-text text-transparent">
              Owned by You
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-white/65 sm:text-xl">
            Store medical records on Soroban, grant or revoke doctor access on
            your terms, and earn MediReward tokens for every record you
            share — all secured by Stellar smart contracts.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/app"
              className="rounded-full bg-gradient-to-r from-[#22c55e] to-[#3ddc84] px-8 py-3.5 text-base font-semibold text-[#04150a] shadow-[0_0_30px_-8px_rgba(61,220,132,0.7)] transition-transform hover:scale-[1.03]"
            >
              Launch App →
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-base font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Explore Docs →
            </Link>
          </div>
        </div>
      </div>

      {/* Feedback / chat affordance, bottom-right, matching reference */}
      <button
        aria-label="Feedback"
        className="absolute bottom-6 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.8-3.6A8.5 8.5 0 1 1 21 11.5Z" />
        </svg>
      </button>
    </section>
  );
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke="url(#g)" strokeWidth="2.5" />
      <path d="M16 9v14M9 16h14" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="g" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ddc84" />
          <stop offset="1" stopColor="#14532d" />
        </linearGradient>
      </defs>
    </svg>
  );
}
