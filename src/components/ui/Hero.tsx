"use client";

import { ShieldCheck, Fingerprint, Database, Lock, HeartPulse, FileLock2 } from "lucide-react";

/**
 * HeroOrbitVisual
 * Drop-in replacement for the right-side "MediVault" card in the hero section.
 *
 * Usage:
 *   import HeroOrbitVisual from "@/components/HeroOrbitVisual";
 *   ...
 *   <div className="relative flex items-center justify-center">
 *     <HeroOrbitVisual />
 *   </div>
 *
 * No extra deps beyond lucide-react (already in your stack). Pure CSS animation,
 * no client-side JS needed besides the "use client" directive for Next.js App Router.
 */
export default function HeroOrbitVisual() {
  return (
    <div className="hov-wrap">
      <style>{`
        .hov-wrap {
          position: relative;
          width: 100%;
          max-width: 620px;
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ambient glow */
        .hov-glow {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: radial-gradient(circle at 50% 50%, rgba(212,162,78,0.28), rgba(212,162,78,0.05) 45%, transparent 70%);
          filter: blur(10px);
          animation: hov-pulse 6s ease-in-out infinite;
        }

        @keyframes hov-pulse {
          0%, 100% { opacity: 0.55; transform: scale(0.96); }
          50%      { opacity: 1;    transform: scale(1.04); }
        }

        /* orbit rings */
        .hov-ring {
          position: absolute;
          border: 1px solid rgba(212,162,78,0.22);
          border-radius: 9999px;
        }
        .hov-ring::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1px solid rgba(212,162,78,0.08);
        }

        .hov-ring-1 { inset: 6%;  animation: hov-spin 22s linear infinite; }
        .hov-ring-2 { inset: 16%; animation: hov-spin-rev 32s linear infinite; }
        .hov-ring-3 { inset: 27%; animation: hov-spin 42s linear infinite; }

        @keyframes hov-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes hov-spin-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }

        /* orbiting node = ring rotates the pivot, inner counter-rotates to stay upright */
        .hov-node-pivot {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .hov-node {
          transform: translateY(-14px);
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, rgba(20,16,10,0.95), rgba(10,8,5,0.95));
          border: 1px solid rgba(212,162,78,0.45);
          box-shadow: 0 0 18px rgba(212,162,78,0.25), inset 0 0 8px rgba(212,162,78,0.08);
          color: #E7C27D;
        }

        .hov-ring-1 .hov-node-pivot { animation: hov-spin-rev 22s linear infinite; }
        .hov-ring-2 .hov-node-pivot { animation: hov-spin 32s linear infinite; }
        .hov-ring-3 .hov-node-pivot { animation: hov-spin-rev 42s linear infinite; }

        .hov-ring-2 .hov-node-2 { transform: translateY(-14px) rotate(200deg) translateY(28px) rotate(-200deg); }

        /* floating particles */
        .hov-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: #E7C27D;
          box-shadow: 0 0 8px 2px rgba(231,194,125,0.6);
          animation: hov-float 7s ease-in-out infinite;
        }
        @keyframes hov-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50%      { transform: translateY(-18px) translateX(6px); opacity: 1; }
        }

        /* central card */
        .hov-card {
          position: relative;
          z-index: 10;
          width: 46%;
          aspect-ratio: 1 / 1;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 24px;
          text-align: center;
          background: linear-gradient(160deg, rgba(24,19,12,0.92), rgba(8,6,4,0.96));
          border: 1px solid rgba(212,162,78,0.35);
          box-shadow:
            0 0 0 1px rgba(212,162,78,0.06),
            0 20px 60px -15px rgba(0,0,0,0.7),
            0 0 40px rgba(212,162,78,0.12);
          backdrop-filter: blur(6px);
          animation: hov-bob 5s ease-in-out infinite;
        }
        @keyframes hov-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }

        .hov-icon-ring {
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212,162,78,0.5);
          background: radial-gradient(circle, rgba(212,162,78,0.16), transparent 70%);
          color: #E7C27D;
          animation: hov-icon-pulse 3s ease-in-out infinite;
        }
        @keyframes hov-icon-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,162,78,0.3); }
          50%      { box-shadow: 0 0 0 10px rgba(212,162,78,0); }
        }

        .hov-title {
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 700;
          font-size: clamp(18px, 3vw, 26px);
          color: #F4EBDB;
          letter-spacing: 0.01em;
        }

        .hov-subtitle {
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(231,194,125,0.75);
        }

        @media (prefers-reduced-motion: reduce) {
          .hov-wrap * { animation: none !important; }
        }
      `}</style>

      <div className="hov-glow" />

      {/* particles */}
      <div className="hov-particle" style={{ top: "12%", left: "18%", animationDelay: "0s" }} />
      <div className="hov-particle" style={{ top: "70%", left: "10%", animationDelay: "1.5s" }} />
      <div className="hov-particle" style={{ top: "20%", left: "85%", animationDelay: "3s" }} />
      <div className="hov-particle" style={{ top: "80%", left: "80%", animationDelay: "2s" }} />
      <div className="hov-particle" style={{ top: "50%", left: "4%", animationDelay: "4s" }} />

      {/* ring 1 - Fingerprint (identity / patient-owned) */}
      <div className="hov-ring hov-ring-1">
        <div className="hov-node-pivot">
          <div className="hov-node">
            <Fingerprint size={20} />
          </div>
        </div>
      </div>

      {/* ring 2 - Database (IPFS) + Lock (encryption) */}
      <div className="hov-ring hov-ring-2">
        <div className="hov-node-pivot">
          <div className="hov-node">
            <Database size={20} />
          </div>
          <div className="hov-node hov-node-2" style={{ position: "absolute" }}>
            <Lock size={18} />
          </div>
        </div>
      </div>

      {/* ring 3 - HeartPulse (health) */}
      <div className="hov-ring hov-ring-3">
        <div className="hov-node-pivot">
          <div className="hov-node">
            <HeartPulse size={20} />
          </div>
        </div>
      </div>

      {/* central card */}
      <div className="hov-card">
        <div className="hov-icon-ring">
          <FileLock2 size={26} />
        </div>
        <div className="hov-title">MediVault</div>
        <div className="hov-subtitle flex items-center gap-1">
          <ShieldCheck size={11} />
          Secured &middot; Decentralised &middot; Yours
        </div>
      </div>
    </div>
  );
}
