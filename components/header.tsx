"use client"

import Link from "next/link"
import { Zap } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/55 backdrop-blur-xl">
      <div className="page-frame flex h-18 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 shadow-[0_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="font-serif text-2xl tracking-[-0.03em] text-foreground">
            Kenzen Energy
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#problem" className="quiet-link text-sm text-muted-foreground">
            Problem
          </Link>
          <Link href="#upload" className="quiet-link text-sm text-muted-foreground">
            Upload
          </Link>
          <Link href="#how-it-works" className="quiet-link text-sm text-muted-foreground">
            How It Works
          </Link>
          <Link href="#features" className="quiet-link text-sm text-muted-foreground">
            Features
          </Link>
          <Link href="#example" className="quiet-link text-sm text-muted-foreground">
            Example
          </Link>
        </nav>

        <Link href="#upload">
          <Button size="sm">Analyze My Bill</Button>
        </Link>
      </div>
    </header>
  )
}
