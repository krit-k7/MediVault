"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleDot, Wallet, LogOut } from "lucide-react";
import { useStellar } from "@/context/StellarContext";

export default function Navbar() {
  const { address, isConnected, isConnecting, connect, disconnect } = useStellar();
  const pathname = usePathname();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Records", href: "/records" },
    { name: "Appointments", href: "/appointments" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-line bg-obsidian/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CircleDot className="w-6 h-6 text-gold" strokeWidth={1.5} />
          <Link href="/" className="font-mono-plex text-[15px] tracking-[3px] text-parchment">
            MEDIVAULT
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          <div className="hidden md:flex items-center gap-6 mr-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-mono-plex text-[11px] tracking-[1.5px] uppercase transition-colors border-b-2 py-5 ${
                  pathname === link.href
                    ? "border-gold text-gold-soft font-semibold"
                    : "border-transparent text-muted hover:text-gold-soft"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-charcoal px-3 py-1.5 rounded-full border border-line-strong">
                <div className="w-2 h-2 rounded-full bg-gold animate-blink shadow-[0_0_8px_#D4A94E]" />
                <span className="font-mono-plex text-xs text-parchment">{truncateAddress(address)}</span>
              </div>
              <button
                onClick={disconnect}
                className="flex items-center justify-center p-2 rounded-full bg-charcoal border border-line-strong text-muted hover:text-danger hover:border-danger/50 transition-colors"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="btn-gold !py-2.5 !px-5 disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
