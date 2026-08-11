@import "tailwindcss";

@theme inline {
  --color-cream: #F5F0E8;
  --color-cream-dark: #EDE6D6;
  --color-burgundy: #6B1A2A;
  --color-burgundy-light: #8B2A3E;
  --color-lime: #C8F02A;
  --color-lime-dark: #A8CC1A;
  --color-ink: #1A1208;
  --color-ink-soft: #3D2E1E;
  --color-rust: #C4541A;
  --color-mist: #B8C4B0;
  --color-card-border: #D4C9B0;
  
  --font-bebas: 'Bebas Neue', sans-serif;
  --font-serif: 'DM Serif Display', serif;
  --font-mono-plex: 'IBM Plex Mono', monospace;
  --font-manrope: 'Manrope', sans-serif;
}

:root {
  --background: #F5F0E8;
  --foreground: #1A1208;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Manrope', sans-serif;
  cursor: crosshair;
  overflow-x: hidden;
}

/* Noise Texture Overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.6;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #EDE6D6;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #D4C9B0;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6B1A2A;
}

@keyframes tickerScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-ticker {
  animation: tickerScroll 30s linear infinite;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-ring {
  animation: ringRotate 20s linear infinite;
}

.animate-ring-reverse {
  animation: ringRotate 14s linear infinite reverse;
}

.animate-ring-fast {
  animation: ringRotate 9s linear infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.animate-blink {
  animation: blink 2s ease-in-out infinite;
}
