"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStellar } from "@/context/StellarContext";
import { useRouter } from "next/navigation";
import EtherealShadow from "@/components/ui/EtherealShadow";
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
    <div className="flex flex-col bg-obsidian">
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
      <section className="relative overflow-hidden border-b border-line">
        <EtherealShadow
          colors={{ from: "#0d0b08", mid: "#4d3a0f", to: "#D4A94E" }}
          intensity={0.35}
          speed={0.7}
        />
        <div className="glow-orb w-[600px] h-[600px] bg-gold/10 -top-40 -right-40" />
        <div className="glow-orb w-[300px] h-[300px] bg-gold/10 top-1/3 -left-32" />

        <div className="relative z-[2] grid lg:grid-cols-[1.1fr_0.9fr] gap-10 px-6 md:px-20 pt-20 pb-16 lg:pt-28 lg:pb-24 items-center min-h-[calc(100vh-64px)]">
          <div>
            <div className="badge-pill mb-8 reveal" style={{ transitionDelay: "0s" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-glow" />
              Stellar &middot; Soroban &middot; Patient-Owned
            </div>
            <h1 className="font-serif text-[clamp(44px,6.2vw,84px)] leading-[1.05] text-parchment mb-8 max-w-[720px] reveal" style={{ transitionDelay: "0.1s" }}>
              Your health, <em className="italic text-gold-soft">confidential</em> on chain.
            </h1>
            <p className="text-lg leading-[1.75] text-muted max-w-[480px] mb-12 font-light reveal" style={{ transitionDelay: "0.2s" }}>
              MediVault stores your medical records on IPFS and anchors access rights to the blockchain.
              No hospital middlemen, no data breaches — <span className="text-parchment">just you and your records</span>, secured by cryptography.
            </p>
            <div className="flex flex-wrap gap-4 items-center reveal" style={{ transitionDelay: "0.3s" }}>
              <Link
                href={address ? "/dashboard" : "#"}
                onClick={(e) => !address && (e.preventDefault(), connect())}
                className="btn-gold"
              >
                Launch App
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#how" className="btn-outline">
                How it Works
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-8 mt-16 pt-8 border-t border-line font-mono-plex text-[10px] tracking-[1.5px] text-muted-dim uppercase reveal" style={{ transitionDelay: "0.4s" }}>
              <div><span className="text-muted">Contract</span> <span className="text-gold-soft">CBG5D...GW5N</span></div>
              <div className="w-px h-3 bg-line-strong" />
              <div><span className="text-muted">Network</span> <span className="text-gold-soft">Testnet &middot; Live</span></div>
              <div className="w-px h-3 bg-line-strong" />
              <div><span className="text-muted">Storage</span> <span className="text-gold-soft">IPFS</span></div>
            </div>
          </div>

          {/* ===== VAULT CORE — hero visual ===== */}
          <div className="reveal" style={{ transitionDelay: "0.25s" }}>
            <div className="relative flex items-center justify-center min-h-[460px] [perspective:1400px]">
              {/* ambient glow */}
              <div className="absolute w-[480px] h-[480px] rounded-full bg-gold/10 blur-3xl animate-pulse-glow" />

              {/* radar sweep */}
              <div
                className="absolute w-[430px] h-[430px] rounded-full animate-radar-sweep"
                style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(212,169,78,0.4) 20deg, transparent 55deg)" }}
              />

              {/* hex rings — three layers, opposite spins */}
              <div className="absolute w-[400px] h-[400px] hex-ring hex-ring-outer animate-hex-spin" />
              <div className="absolute w-[300px] h-[300px] hex-ring hex-ring-mid animate-hex-spin-reverse" />
              <div className="absolute w-[210px] h-[210px] hex-ring hex-ring-inner animate-hex-spin-fast" />

              {/* rising data particles */}
              <span className="absolute w-px h-10 bg-gradient-to-t from-gold/0 via-gold/60 to-gold/0 top-[70%] left-[30%] animate-data-rise" style={{ animationDelay: "0s" }} />
              <span className="absolute w-px h-8 bg-gradient-to-t from-gold/0 via-gold/50 to-gold/0 top-[75%] left-[62%] animate-data-rise" style={{ animationDelay: "1.5s" }} />
              <span className="absolute w-px h-12 bg-gradient-to-t from-gold/0 via-gold/60 to-gold/0 top-[68%] left-[46%] animate-data-rise" style={{ animationDelay: "3s" }} />

              {/* floating icon shards — each drifts its own independent path */}
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

              {/* center vault core — 3D wobble + glass sheen */}
              <div className="relative z-[5] animate-vault-rotate">
                <div className="vault-core-panel panel p-10 text-center w-[280px] backdrop-blur-sm animate-icon-pulse">
                  <div className="w-14 h-14 rounded-full border border-gold/40 bg-gold/10 mx-auto mb-5 flex items-center justify-center relative z-[2]">
                    <Lock className="w-6 h-6 text-gold" strokeWidth={1.5} />
                  </div>
                  <div className="font-serif text-[24px] text-parchment mb-2 relative z-[2]">MediVault</div>
                  <div className="font-mono-plex text-[10px] text-gold-soft tracking-[2px] uppercase opacity-90 relative z-[2]">Secured &middot; Decentralised &middot; Yours</div>
                </div>
              </div>
            </div>
          </div>
          {/* ===== /VAULT CORE ===== */}
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-charcoal py-3 overflow-hidden border-b border-line whitespace-nowrap reveal">
        <div className="inline-flex gap-0 animate-ticker">
          {tickerItems.map((item, i) => (
            <div key={i} className="font-mono-plex text-[11px] font-medium tracking-[3px] uppercase text-gold-soft px-10 flex items-center gap-4 after:content-['\2726'] after:text-gold-dim after:text-[9px]">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="px-6 py-28 md:px-20 bg-obsidian" id="features">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 border-b border-line pb-10 reveal">
          <div className="badge-pill mb-6 md:mb-0">01 &middot; Core Capabilities</div>
          <div className="flex-1 md:pl-10">
            <div className="font-serif text-[42px] md:text-[56px] leading-[1.05] text-parchment">Why <em className="italic text-gold-soft">MediVault</em></div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard index={0} num="F — 001" title="End-to-End Encrypted Storage" desc="Every file is encrypted before it touches IPFS. Your private key, your data. Not even MediVault can read your records without your explicit permission." Icon={Lock} big />
          <FeatureCard index={1} num="F — 002" title="Immutable Audit Trail" desc="Every access event is logged on-chain. Tamper-proof history forever." Icon={Link2} />
          <FeatureCard index={2} num="F — 003" title="Granular Doctor Access" desc="Grant or revoke per-doctor access in seconds, on your terms." Icon={Eye} />
          <FeatureCard index={3} num="F — 004" title="IPFS Pinned Files" desc="Records survive server outages — distributed across the globe permanently." Icon={FileText} />
          <FeatureCard index={4} num="F — 005" title="Instant Wallet Auth" desc="No username, no password. Just sign with your wallet." Icon={Zap} />
          <FeatureCard index={5} num="F — 006" title="Universal Portability" desc="Access from any device, anywhere. No vendor lock-in, ever." Icon={Globe2} />
        </div>
      </section>

      {/* STATS RIBBON */}
      <section ref={statsRef} className="bg-charcoal grid grid-cols-2 md:grid-cols-4 border-y border-line" id="stats">
        <StatBlock index={0} val={counts.records} label="Records Stored" />
        <StatBlock index={1} val={counts.patients} label="Active Patients" />
        <StatBlock index={2} val={counts.doctors} label="Verified Doctors" />
        <StatBlock index={3} val={counts.uptime} label="% Uptime" />
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-28 md:px-20 bg-obsidian" id="how">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 border-b border-line pb-10 reveal">
          <div className="badge-pill mb-6 md:mb-0">02 &middot; Process</div>
          <div className="flex-1 md:pl-10">
            <div className="font-serif text-[42px] md:text-[56px] leading-[1.05] text-parchment">How it <em className="italic text-gold-soft">works</em></div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          <StepItem index={0} n="1" title="Connect Wallet" desc="Authenticate with your wallet — no account creation needed." Icon={Wallet} arrow />
          <StepItem index={1} n="2" title="Upload Records" desc="Drag & drop your medical files. They're encrypted and pinned to IPFS instantly." Icon={UploadCloud} arrow />
          <StepItem index={2} n="3" title="Grant Access" desc="Share your record access with doctors using their wallet address. Full control." Icon={UserCheck} arrow />
          <StepItem index={3} n="4" title="Revoke Anytime" desc="Remove access in seconds. The blockchain enforces it — no waiting, no disputes." Icon={ShieldOff} />
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-charcoal px-6 py-28 md:px-20 grid md:grid-cols-2 border-t border-line content-center items-center gap-16 overflow-hidden">
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

      <footer className="bg-obsidian px-6 md:px-20 py-10 flex flex-col md:flex-row items-center justify-between border-t border-line gap-6">
        <div className="flex items-center gap-2.5">
          <CircleDot className="w-5 h-5 text-gold" strokeWidth={1.5} />
          <span className="font-mono-plex text-[13px] tracking-[3px] text-parchment">MEDIVAULT</span>
        </div>
        <div className="font-mono-plex text-[10px] tracking-[2px] uppercase text-muted-dim">© 2026 MediVault Protocol. Decentralised. Open Source.</div>
      </footer>
    </div>
  );
}

function FeatureCard({
  num, title, desc, Icon, big = false, index = 0,
}: { num: string; title: string; desc: string; Icon: React.ElementType; big?: boolean; index?: number }) {
  return (
    <div
      className={`panel feature-card reveal p-10 group flex flex-col ${big ? "md:col-span-1" : ""}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <div className="font-mono-plex text-[10px] text-muted-dim tracking-[3px] mb-8 relative z-[2]">{num}</div>
      <div
        className="feature-icon-float w-12 h-12 rounded-lg border border-line-strong flex items-center justify-center mb-6 group-hover:border-gold/50 group-hover:bg-gold/10 relative z-[2]"
        style={{ animationDelay: `${index * 0.35}s` }}
      >
        <Icon className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-[22px] leading-[1.25] text-parchment mb-3 relative z-[2]">{title}</h3>
      <p className="text-sm leading-[1.7] text-muted font-light relative z-[2]">{desc}</p>
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

function StepItem({
  n, title, desc, Icon, arrow, index = 0,
}: { n: string; title: string; desc: string; Icon: React.ElementType; arrow?: boolean; index?: number }) {
  return (
    <div className="panel reveal p-10 relative" style={{ transitionDelay: `${index * 0.12}s` }}>
      {arrow && (
        <div className="absolute -right-[26px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-obsidian border border-line-strong items-center justify-center z-[5] hidden md:flex">
          <ArrowRight className="w-4 h-4 text-gold-soft" />
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono-plex text-[11px] text-muted-dim tracking-[3px]">STEP {n}</span>
        <Icon className="w-5 h-5 text-gold-soft" strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-[20px] text-parchment mb-3">{title}</h3>
      <p className="text-[13px] leading-[1.7] text-muted font-light">{desc}</p>
    </div>
  );
}
