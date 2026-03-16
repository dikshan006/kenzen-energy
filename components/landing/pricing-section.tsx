import Link from "next/link"

import { Button } from "@/components/ui/button"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      note: "One monthly bill analysis to get a feel for the platform.",
    },
    {
      name: "Professional",
      price: "$29 / month",
      note: "For owner-operators who want recurring insights, trends, and savings tracking.",
    },
    {
      name: "Operator",
      price: "Custom",
      note: "For multi-store groups that need a consolidated view across locations.",
    },
  ]

  return (
    <section id="pricing" className="editorial-section fade-in-section">
      <div className="page-frame">
        <div className="editorial-panel overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="stripe-panel-soft p-8 md:p-10">
              <p className="section-kicker">Pricing</p>
              <h2 className="mt-6 font-serif text-4xl tracking-[-0.04em] text-foreground">
                Simple plans for stores that care about operating margin.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                Start with a first bill and move into a monthly habit once the savings story becomes clear.
              </p>
            </div>

            <div className="grid gap-0 divide-y divide-border/70">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`grid gap-4 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10 fade-in-section ${index === 1 ? "fade-delay-1" : index === 2 ? "fade-delay-2" : ""}`}
                >
                  <div>
                    <p className="font-serif text-3xl tracking-[-0.03em] text-foreground">{plan.name}</p>
                    <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground">
                      {plan.note}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-4 md:items-end">
                    <p className="font-serif text-4xl tracking-[-0.04em] text-foreground">{plan.price}</p>
                    <Link href="/upload">
                      <Button variant={plan.name === "Professional" ? "default" : "outline"}>
                        {plan.name === "Operator" ? "Talk to Kenzen" : "Start Here"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
