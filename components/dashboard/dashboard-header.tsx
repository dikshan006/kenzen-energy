"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Upload } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="page-frame flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 shadow-[0_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="font-serif text-2xl tracking-[-0.03em] text-foreground">
            Kenzen Energy
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/upload">
            <Button size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Bill
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
