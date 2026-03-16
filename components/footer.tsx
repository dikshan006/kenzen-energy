import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background py-16">
      <div className="page-frame">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 backdrop-blur-sm">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="font-serif text-2xl tracking-[-0.03em] text-foreground">Kenzen Energy</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="#how-it-works"
              className="quiet-link text-sm text-muted-foreground"
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="quiet-link text-sm text-muted-foreground"
            >
              Benefits
            </Link>
            <Link
              href="#pricing"
              className="quiet-link text-sm text-muted-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="quiet-link text-sm text-muted-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="quiet-link text-sm text-muted-foreground"
            >
              Terms
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            2026 Kenzen Energy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
