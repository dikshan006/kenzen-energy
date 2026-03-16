import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="editorial-section fade-in-section">
      <div className="page-frame">
        <div className="report-surface overflow-hidden bg-primary text-primary-foreground">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="p-10 md:p-14">
              <p className="section-kicker text-primary-foreground/70">A calmer monthly ritual</p>
              <h2 className="mt-6 font-serif text-4xl tracking-[-0.04em] text-primary-foreground md:text-5xl">
                Turn the next bill into a cleaner operating decision.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-primary-foreground/78 md:text-lg">
                Upload a utility statement, review the savings meter, and share the report with the
                people who run the store.
              </p>
              <div className="mt-8">
                <Link href="/upload">
                  <Button
                    size="lg"
                    className="bg-accent text-primary shadow-[0_16px_40px_rgba(0,0,0,0.16)] hover:bg-accent/92"
                  >
                    Start With a Bill
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="stripe-panel hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  )
}
