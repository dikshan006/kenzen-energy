import Link from "next/link"

import { Button } from "@/components/ui/button"

export function FinalCTASection() {
  return (
    <section className="editorial-section pt-8 md:pt-10">
      <div className="page-frame">
        <div className="fade-in-section mx-auto max-w-3xl text-center">
          <p className="section-kicker">Ready to begin</p>
          <h2 className="editorial-subtitle mt-4">Upload your electricity bill and discover hidden savings.</h2>
          <div className="mt-8">
            <Link href="#upload">
              <Button size="lg">Analyze My Bill</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
