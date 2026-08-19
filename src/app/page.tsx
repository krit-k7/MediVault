"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStellar } from "@/context/StellarContext";
import { useRouter } from "next/navigation";
import ShaderBackground from "@/components/ui/ShaderBackground";
import {
  CircleDot,
  Lock,
  Link2,
  Eye,
  FileText,
  Zap,
  Globe2,
  Wallet,
  UploadCloud,
  UserCheck,
  ShieldOff,
  ArrowRight,
  Fingerprint,
  Database,
  ShieldCheck,
  FileLock2,
  HeartPulse,
  KeyRound,
} from "lucide-react";

export default function Home() {
  const { address, isConnected, connect } = useStellar();
  const [counts, setCounts] = useState({ records: 0, patients: 0, doctors: 0, uptime: 0 });
  const statsRef = useRef<HTMLElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.push("/dashboard");
    }
  }, [address, router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const targets = { records: 12400, patients: 3200, doctors: 890, uptime: 100 };
          const startTime = Date.now();
          const duration = 2000;

          const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setCounts({
              records: Math.floor(progress * targets.records),
              patients: Math.floor(progress * targets.patients),
              doctors: Math.floor(progress * targets.doctors),
              uptime: Math.floor(progress * targets.uptime),
            });

            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll-triggered reveal: fade + slide up any element with class "reveal"
  useEffect(() => {
    const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, []);

  const tickerItems = [
    "Decentralised Storage", "IPFS Pinned", "Freighter Auth",
    "Zero Knowledge", "Open Protocol", "Immutable Records",
    "Patient Owned", "Doctor Access Control", "Audit Trail",
    "Decentralised Storage", "IPFS Pinned", "Freighter Auth",
    "Zero Knowledge", "Open Protocol", "Immutable Records",
    "Patient Owned", "Doctor Access Control", "Audit Trail",
  ];

  return (
    <div className="relative isolate flex flex-col bg-obsidian">
      <AmbientField />

      {/* TOPBAR */}
      <nav className="sticky top-0 z-[100] bg-obsidian/90 backdrop-blur-md flex items-center justify-between px-6 md:px-10 h-16 border-b border-line">
        <div className="flex items-center gap-2.5">
          <CircleDot className="w-6 h-6 text-gold" strokeWidth={1.5} />
          <span className="font-mono-plex text-[15px] tracking-[3px] text-parchment">MEDIVAULT</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <Link href="#features" className="font-mono-plex text-[11px] font-medium tracking-[2px] uppercase text-muted px-5 py-2 hover:text-gold-soft transition-colors">Features</Link>
          <Link href="#how" className="font-mono-plex text-[11px] font-medium tracking-[2px] uppercase text-muted px-5 py-2 hover:text-gold-soft transition-colors">How it Works</Link>
          <Link href="#stats" className="font-mono-plex text-[11px] font-medium tracking-[2px] uppercase text-muted px-5 py-2 hover:text-gold-soft transition-colors">Stats</Link>
        </div>
        <button onClick={connect} className={isConnected ? "btn-outline !py-2.5 !px-5" : "btn-gold !py-2.5 !px-6"}>
          {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      {/* HERO */}
      <section className="hero-shell relative overflow-hidden border-b border-line">
        <ShaderBackground />

        {/* Contrast scrim — sits between the shader canvas and the content.
            Does NOT touch ShaderBackground.tsx, its colors, or its motion —
            purely darkens the area behind the text so it reads clearly. */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-obsidian/70 via-obsidian/35 to-obsidian/5" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-obsidian/45 via-transparent to-transparent" />

        <div className="glow-orb w-[600px] h-[600px] bg-gold/10 -top-40 -right-40" />
        <div className="glow-orb w-[300px] h-[300px] bg-gold/10 top-1/3 -left-32" />

        <div className="relative z-[2] flex min-h-[calc(100vh-64px)] flex-col items-center px-6 pb-16 pt-20 text-center md:px-20 lg:pt-28 lg:pb-24">
          <div className="flex w-full max-w-5xl flex-col items-center">
            <div className="badge-pill mb-8 reveal !bg-obsidian/80 !border-gold/50 backdrop-blur-md shadow-[0_2px_20px_-4px_rgba(0,0,0,0.6)]" style={{ transitionDelay: "0s" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-glow" />
              Stellar &middot; Soroban &middot; Patient-Owned
            </div>
            <h1 className="hero-heading font-serif text-[clamp(44px,6.2vw,84px)] leading-[1.05] text-parchment mb-8 max-w-[900px] reveal drop-shadow-[0_4px_28px_rgba(0,0,0,0.7)]" style={{ transitionDelay: "0.1s" }}>
              Your health, <em className="italic text-gold-soft">confidential</em> on chain.
            </h1>
            <p className="hero-copy text-lg leading-[1.75] max-w-[680px] mb-12 font-light reveal drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]" style={{ transitionDelay: "0.2s" }}>
              MediVault stores your medical records on IPFS and anchors access rights to the blockchain.
              No hospital middlemen, no data breaches — <span className="text-parchment">just you and your records</span>, secured by cryptography.
            </p>
            <div className="flex flex-wrap justify-center gap-4 items-center reveal" style={{ transitionDelay: "0.3s" }}>
              <Link
                href={address ? "/dashboard" : "#"}
                onClick={(e) => !address && (e.preventDefault(), connect())}
                className="btn-gold"
              >
                Launch App
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#how" className="btn-outline !bg-obsidian/60 backdrop-blur-md">
                How it Works
              </Link>
            </div>

            <div className="hidden md:flex items-center justify-center gap-8 mt-16 pt-8 border-t border-line-strong font-mono-plex text-[10px] tracking-[1.5px] text-muted uppercase reveal bg-obsidian/50 backdrop-blur-md rounded-lg px-4" style={{ transitionDelay: "0.4s" }}>
              <div><span className="text-muted">Contract</span> <span className="text-gold-soft">CBG5D...GW5N</span></div>
              <div className="w-px h-3 bg-line-strong" />
              <div><span className="text-muted">Network</span> <span className="text-gold-soft">Testnet &middot; Live</span></div>
              <div className="w-px h-3 bg-line-strong" />
              <div><span className="text-muted">Storage</span> <span className="text-gold-soft">IPFS</span></div>
            </div>
          </div>

          {/* ===== VAULT CORE — hero visual ===== */}
          <div className="mt-8 w-full max-w-5xl reveal" style={{ transitionDelay: "0.25s" }}>
            <div className="relative mx-auto flex max-w-[620px] items-center justify-center min-h-[360px] [perspective:1400px]">
              <div className="absolute h-[380px] w-[380px] rounded-full bg-gold/10 blur-3xl animate-pulse-glow md:h-[480px] md:w-[480px]" />

              <div
                className="absolute h-[330px] w-[330px] rounded-full animate-radar-sweep md:h-[430px] md:w-[430px]"
                style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(212,169,78,0.4) 20deg, transparent 55deg)" }}
              />

              <div className="absolute h-[310px] w-[310px] hex-ring hex-ring-outer animate-hex-spin md:h-[400px] md:w-[400px]" />
              <div className="absolute h-[235px] w-[235px] hex-ring hex-ring-mid animate-hex-spin-reverse md:h-[300px] md:w-[300px]" />
              <div className="absolute h-[165px] w-[165px] hex-ring hex-ring-inner animate-hex-spin-fast md:h-[210px] md:w-[210px]" />

              <span className="absolute w-px h-10 bg-gradient-to-t from-gold/0 via-gold/60 to-gold/0 top-[70%] left-[30%] animate-data-rise" style={{ animationDelay: "0s" }} />
              <span className="absolute w-px h-8 bg-gradient-to-t from-gold/0 via-gold/50 to-gold/0 top-[75%] left-[62%] animate-data-rise" style={{ animationDelay: "1.5s" }} />
              <span className="absolute w-px h-12 bg-gradient-to-t from-gold/0 via-gold/60 to-gold/0 top-[68%] left-[46%] animate-data-rise" style={{ animationDelay: "3s" }} />

              <div className="icon-shard absolute top-[4%] left-[10%] animate-drift-a">
                <Fingerprint className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
              </div>
              <div className="icon-shard absolute top-[8%] right-[4%] animate-drift-b">
                <ShieldCheck className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
              </div>
              <div className="icon-shard absolute bottom-[10%] left-[2%] animate-drift-c">
                <FileLock2 className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
              </div>
              <div className="icon-shard absolute bottom-[16%] right-[0%] animate-drift-d">
                <HeartPulse className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
              </div>
              <div className="icon-shard absolute top-[46%] -left-[8%] animate-drift-e">
                <Database className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
              </div>
              <div className="icon-shard absolute top-[42%] -right-[10%] animate-drift-f">
                <KeyRound className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
              </div>

              <div className="relative z-[5] animate-vault-rotate">
                <VaultCore />
              </div>
            </div>
          </div>
          {/* ===== /VAULT CORE ===== */}
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-charcoal/90 py-3 overflow-hidden border-b border-line whitespace-nowrap reveal">
        <div className="inline-flex gap-0 animate-ticker">
          {tickerItems.map((item, i) => (
            <div key={i} className="font-mono-plex text-[11px] font-medium tracking-[3px] uppercase text-gold-soft px-10 flex items-center gap-4 after:content-['\2726'] after:text-gold-dim after:text-[9px]">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="px-6 py-28 md:px-20 bg-obsidian/90 relative overflow-hidden" id="features">
        <div className="glow-orb w-[500px] h-[500px] bg-gold/5 top-0 right-0" />

        <div className="flex flex-col md:flex-row items-end justify-between mb-10 border-b border-line pb-10 reveal">
          <div className="badge-pill mb-6 md:mb-0">01 &middot; Core Capabilities</div>
          <div className="flex-1 md:pl-10">
            <div className="font-serif text-[42px] md:text-[56px] leading-[1.05] text-parchment">Why <em className="italic text-gold-soft">MediVault</em></div>
          </div>
        </div>

        <p className="reveal max-w-[620px] text-muted text-base leading-[1.8] font-light mb-20" style={{ transitionDelay: "0.1s" }}>
          Six pillars hold the protocol together — from the moment a file leaves your device to the moment
          a doctor requests access. Every layer is built to remove trust from the equation and replace it with proof.
        </p>

        {/* SPOTLIGHT PANEL */}
        <div className="spotlight-panel panel grid md:grid-cols-[0.55fr_0.45fr] gap-10 p-10 md:p-14 mb-20 reveal items-center">
          <div>
            <div className="badge-pill mb-6">Security Model</div>
            <h3 className="font-serif text-[30px] md:text-[38px] leading-[1.15] text-parchment mb-5">
              One vault. <em className="italic text-gold-soft">Total control.</em>
            </h3>
            <p className="text-muted text-[15px] leading-[1.8] font-light mb-8">
              Files are encrypted client-side before they ever leave your browser, pinned across the IPFS
              network, and referenced on Soroban through a single access-control contract only you can update.
              Nothing sits on a company server. Nothing waits on a support ticket.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {["Client-Side Encryption", "IPFS Distribution", "Soroban Access Control", "No Central Server"].map((t) => (
                <span key={t} className="feature-tag">{t}</span>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center h-[240px] md:h-[280px]">
            <div className="absolute w-[220px] h-[220px] rounded-full bg-gold/10 blur-2xl" />
            <div className="absolute w-[210px] h-[210px] mini-ring animate-mini-ring opacity-40" />
            <div className="absolute w-[150px] h-[150px] mini-ring animate-mini-ring-reverse opacity-60" />
            <div className="relative z-[2] w-20 h-20 rounded-full border border-gold/40 bg-charcoal flex items-center justify-center animate-icon-pulse">
              <Lock className="w-8 h-8 text-gold" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard index={0} num="F — 001" title="End-to-End Encrypted Storage" desc="Every file is encrypted before it touches IPFS. Your private key, your data. Not even MediVault can read your records without your explicit permission." Icon={Lock} tags={["AES-256", "Client-Side"]} />
          <FeatureCard index={1} num="F — 002" title="Immutable Audit Trail" desc="Every access event is logged on-chain. Tamper-proof history forever." Icon={Link2} tags={["On-Chain Logs"]} />
          <FeatureCard index={2} num="F — 003" title="Granular Doctor Access" desc="Grant or revoke per-doctor access in seconds, on your terms." Icon={Eye} tags={["Per-Doctor Keys"]} />
          <FeatureCard index={3} num="F — 004" title="IPFS Pinned Files" desc="Records survive server outages — distributed across the globe permanently." Icon={FileText} tags={["Distributed"]} />
          <FeatureCard index={4} num="F — 005" title="Instant Wallet Auth" desc="No username, no password. Just sign with your wallet." Icon={Zap} tags={["Freighter"]} />
          <FeatureCard index={5} num="F — 006" title="Universal Portability" desc="Access from any device, anywhere. No vendor lock-in, ever." Icon={Globe2} tags={["Cross-Device"]} />
        </div>
      </section>

      {/* STATS RIBBON */}
      <section ref={statsRef} className="bg-charcoal/85 grid grid-cols-2 md:grid-cols-4 border-y border-line" id="stats">
        <StatBlock index={0} val={counts.records} label="Records Stored" />
        <StatBlock index={1} val={counts.patients} label="Active Patients" />
        <StatBlock index={2} val={counts.doctors} label="Verified Doctors" />
        <StatBlock index={3} val={counts.uptime} label="% Uptime" />
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-28 md:px-20 bg-obsidian/90 relative overflow-hidden" id="how">
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 border-b border-line pb-10 reveal">
          <div className="badge-pill mb-6 md:mb-0">02 &middot; Process</div>
          <div className="flex-1 md:pl-10">
            <div className="font-serif text-[42px] md:text-[56px] leading-[1.05] text-parchment">How it <em className="italic text-gold-soft">works</em></div>
          </div>
        </div>

        <p className="reveal max-w-[600px] text-muted text-base leading-[1.8] font-light mb-24" style={{ transitionDelay: "0.1s" }}>
          Four steps, no intermediaries. Each one is enforced by the contract itself — not by a team
          watching a dashboard.
        </p>

        <div className="relative max-w-[900px] mx-auto">
          <div className="timeline-line reveal hidden md:block" />

          <div className="flex flex-col gap-20 md:gap-28">
            <TimelineStep
              index={0} n="1" side="left" title="Connect Wallet"
              desc="Authenticate with your wallet — no email, no password, no account creation. Your wallet address is your identity on MediVault."
              Icon={Wallet}
              tags={["Freighter", "Instant"]}
            />
            <TimelineStep
              index={1} n="2" side="right" title="Upload Records"
              desc="Drag & drop your medical files. They're encrypted in your browser before upload, then pinned to IPFS and referenced on-chain — instantly."
              Icon={UploadCloud}
              tags={["Client-Side Encryption", "IPFS"]}
            />
            <TimelineStep
              index={2} n="3" side="left" title="Grant Access"
              desc="Share record access with a doctor using nothing but their wallet address. They see exactly what you allow — nothing more."
              Icon={UserCheck}
              tags={["Per-Record", "Wallet-Based"]}
            />
            <TimelineStep
              index={3} n="4" side="right" title="Revoke Anytime"
              desc="Remove access in seconds. The smart contract enforces it immediately — no waiting on a hospital, no disputes, no exceptions."
              Icon={ShieldOff}
              tags={["On-Chain Enforcement"]}
            />
          </div>

          <div className="reveal mt-24 md:mt-32 text-center" style={{ transitionDelay: "0.5s" }}>
            <div className="badge-pill mx-auto mb-6" style={{ margin: "0 auto 24px" }}>End-to-End</div>
            <p className="font-serif text-[22px] md:text-[28px] text-parchment italic max-w-[560px] mx-auto leading-[1.4]">
              No backend ever holds your keys. The contract is the only authority.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-charcoal/85 px-6 py-28 md:px-20 grid md:grid-cols-2 border-t border-line content-center items-center gap-16 overflow-hidden">
        <div className="glow-orb w-[400px] h-[400px] bg-gold/10 -bottom-32 -left-20" />
        <h2 className="relative z-[2] font-serif text-[46px] md:text-[64px] leading-[1.1] text-parchment reveal">
          Own your <em className="italic text-gold-soft">medical</em> future
        </h2>
        <div className="relative z-[2] reveal" style={{ transitionDelay: "0.15s" }}>
          <p className="text-muted text-lg leading-[1.8] font-light mb-10">
            Join thousands of patients who've reclaimed control of their health data. No subscriptions. No corporations. Just you and your records, secured by cryptography.
          </p>
          <button onClick={connect} className="btn-gold">
            Connect Wallet &amp; Begin
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="bg-obsidian/95 px-6 md:px-20 py-10 flex flex-col md:flex-row items-center justify-between border-t border-line gap-6">
        <div className="flex items-center gap-2.5">
          <CircleDot className="w-5 h-5 text-gold" strokeWidth={1.5} />
          <span className="font-mono-plex text-[13px] tracking-[3px] text-parchment">MEDIVAULT</span>
        </div>
        <div className="font-mono-plex text-[10px] tracking-[2px] uppercase text-muted-dim">© 2026 MediVault Protocol. Decentralised. Open Source.</div>
      </footer>
    </div>
  );
}

function AmbientField() {
  const stars = [
    { top: "8%", left: "12%", size: 2, delay: "0s" },
    { top: "15%", left: "78%", size: 1.5, delay: "0.6s" },
    { top: "22%", left: "34%", size: 1.5, delay: "1.2s" },
    { top: "30%", left: "90%", size: 2, delay: "1.8s" },
    { top: "38%", left: "6%", size: 1.5, delay: "2.4s" },
    { top: "44%", left: "58%", size: 2, delay: "0.3s" },
    { top: "52%", left: "22%", size: 1.5, delay: "1.5s" },
    { top: "60%", left: "82%", size: 1.5, delay: "2.1s" },
    { top: "68%", left: "40%", size: 2, delay: "0.9s" },
    { top: "74%", left: "12%", size: 1.5, delay: "1.8s" },
    { top: "80%", left: "68%", size: 2, delay: "0.4s" },
    { top: "88%", left: "30%", size: 1.5, delay: "2.7s" },
    { top: "18%", left: "50%", size: 1.5, delay: "1s" },
    { top: "56%", left: "94%", size: 1.5, delay: "1.6s" },
    { top: "92%", left: "82%", size: 2, delay: "0.7s" },
    { top: "10%", left: "62%", size: 1.5, delay: "2.2s" },
  ];

  return (
    <div className="ambient-field" aria-hidden="true">
      <div className="ambient-drift animate-nebula-1 w-[520px] h-[520px] bg-gold/[0.05] -top-40 left-[10%]" />
      <div className="ambient-drift animate-nebula-2 w-[420px] h-[420px] bg-gold/[0.04] top-[55%] right-[5%]" />

      {stars.map((s, i) => (
        <span
          key={i}
          className="ambient-star animate-star-twinkle"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
          }}
        />
      ))}

      <div className="comet animate-comet-1" style={{ top: "6%", left: "0%" }} />
      <div className="comet animate-comet-2" style={{ top: "28%", left: "-4%" }} />
      <div className="comet animate-comet-3" style={{ top: "48%", left: "-2%" }} />
    </div>
  );
}

/**
 * VaultCore
 * -----------------------------------------------------------------------
 * The centerpiece of the hero visual — a circular security dial instead
 * of a flat text card. A tick-marked ring counter-rotates slowly, a
 * bright dot sweeps around it like an active scan, and a glass core in
 * the middle holds the lock icon + brand + live status. Reuses the
 * existing hex-spin / icon-pulse / blink animations already defined in
 * globals.css, so no new keyframes are needed.
 */
function VaultCore() {
  const ticks = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 4 === 0;
    const outer = isMajor ? 137 : 132;
    const inner = isMajor ? 119 : 126;
    return {
      x1: 143 + outer * Math.cos(angle),
      y1: 143 + outer * Math.sin(angle),
      x2: 143 + inner * Math.cos(angle),
      y2: 143 + inner * Math.sin(angle),
      isMajor,
    };
  });

  return (
    <div className="security-core" aria-label="MediVault encrypted security core">
      <div className="core-orbit" />
      <div className="core-orbit core-orbit-reverse" />
      <svg viewBox="0 0 286 286" className="absolute inset-0 h-full w-full animate-hex-spin-reverse" aria-hidden="true">
        <circle cx="143" cy="143" r="138" fill="none" stroke="rgba(255,207,82,.28)" strokeWidth="1" />
        <circle cx="143" cy="143" r="112" fill="none" stroke="rgba(255,138,28,.32)" strokeWidth="1" strokeDasharray="2 8" />
        {ticks.map((tick, index) => (
          <line key={index} x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} stroke={tick.isMajor ? "#FFD45C" : "rgba(255,169,34,.42)"} strokeWidth={tick.isMajor ? 2 : 1} strokeLinecap="round" />
        ))}
      </svg>
      <div className="absolute inset-[30px] rounded-full border border-[#ff7d20]/40 bg-[conic-gradient(from_220deg,transparent,#ff8b20,transparent_28%,#ffd45a,transparent_57%)] opacity-80 animate-hex-spin" />
      <div className="core-scanline" />
      {[0, 72, 144, 216, 288].map((angle, index) => (
        <span key={angle} className="core-particle" style={{ ["--angle" as string]: `${angle}deg`, animationDelay: `${index * -0.7}s` }} />
      ))}
      <div className="core-hub">
        <div className="relative mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-[#ffd15a]/70 bg-[#ff9d1c]/15 shadow-[0_0_22px_rgba(255,151,29,.35)]">
          <Lock className="h-5 w-5 text-[#ffd15a]" strokeWidth={1.8} />
          <span className="absolute inset-[-6px] rounded-full border border-[#ff9d1c]/20 animate-ping" />
        </div>
        <div className="font-serif text-[21px] leading-none text-parchment">MediVault</div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_#7FA66B] animate-blink" />
          <span className="font-mono-plex text-[8px] uppercase tracking-[2px] text-[#ffd15a]">Secure · Live</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  num, title, desc, Icon, index = 0, tags = [],
}: { num: string; title: string; desc: string; Icon: React.ElementType; index?: number; tags?: string[] }) {
  return (
    <div
      className="panel feature-card reveal p-10 group flex flex-col"
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <div className="flex items-start justify-between mb-8 relative z-[2]">
        <span className="font-mono-plex text-[10px] text-muted-dim tracking-[3px]">{num}</span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-dim opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
      </div>
      <div
        className="feature-icon-float w-12 h-12 rounded-lg border border-line-strong flex items-center justify-center mb-6 group-hover:border-gold/50 group-hover:bg-gold/10 relative z-[2]"
        style={{ animationDelay: `${index * 0.35}s` }}
      >
        <Icon className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-[22px] leading-[1.25] text-parchment mb-3 relative z-[2]">{title}</h3>
      <p className="text-sm leading-[1.7] text-muted font-light mb-6 relative z-[2]">{desc}</p>
      <div className="feature-underline reveal mb-5 relative z-[2]" style={{ transitionDelay: `${index * 0.12 + 0.3}s` }} />
      <div className="flex flex-wrap gap-2 relative z-[2] mt-auto">
        {tags.map((t) => (
          <span key={t} className="feature-tag">{t}</span>
        ))}
      </div>
    </div>
  );
}

function StatBlock({ val, label, index = 0 }: { val: number; label: string; index?: number }) {
  return (
    <div
      className="p-14 border-r border-line last:border-0 text-center relative overflow-hidden group reveal"
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <div className="font-serif text-[52px] text-gold leading-none relative z-10">
        {val.toLocaleString()}{label === "% Uptime" ? "" : "+"}
      </div>
      <div className="font-mono-plex text-[10px] tracking-[3px] uppercase text-muted mt-3 relative z-10">{label}</div>
    </div>
  );
}

function TimelineStep({
  n, title, desc, Icon, side, index = 0, tags = [],
}: { n: string; title: string; desc: string; Icon: React.ElementType; side: "left" | "right"; index?: number; tags?: string[] }) {
  const isLeft = side === "left";
  return (
    <div className="relative grid md:grid-cols-2 gap-8 md:gap-16 items-center">
      {/* node on the central line */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3]">
        <div className="timeline-node reveal" style={{ transitionDelay: `${index * 0.15}s` }}>
          <span className="font-mono-plex text-[13px] text-gold-soft">{n}</span>
        </div>
      </div>

      <div className={isLeft ? "md:order-1" : "md:order-2"}>
        <div
          className={`step-panel panel p-8 md:p-10 reveal ${isLeft ? "md:mr-10" : "md:ml-10"}`}
          style={{ transitionDelay: `${index * 0.15 + 0.1}s` }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-lg border border-line-strong flex items-center justify-center feature-icon-float" style={{ animationDelay: `${index * 0.3}s` }}>
              <Icon className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
            </div>
            <span className="font-mono-plex text-[11px] text-muted-dim tracking-[3px] md:hidden">STEP {n}</span>
          </div>
          <h3 className="font-serif text-[24px] text-parchment mb-3">{title}</h3>
          <p className="text-[14px] leading-[1.8] text-muted font-light mb-6">{desc}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="feature-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={`hidden md:block ${isLeft ? "md:order-2" : "md:order-1"}`} />
    </div>
  );
}
