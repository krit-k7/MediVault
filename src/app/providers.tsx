"use client"

import { StellarProvider } from "@/context/StellarContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StellarProvider>
      {children}
    </StellarProvider>
  )
}
