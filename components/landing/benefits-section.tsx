export function BenefitsSection() {
  const benefits = [
    "Bill summaries written for owners, not energy specialists.",
    "A dedicated savings meter that keeps the financial upside front and center.",
    "Historical bills and trends that feel more like a portfolio review than a dashboard.",
    "Laundromat-aware benchmarks for stores with different machine counts and hours.",
  ]

  return (
    <section id="benefits" className="editorial-section fade-in-section">
      <div className="page-frame">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <p className="section-kicker">Why it feels different</p>
            <h2 className="editorial-subtitle mt-6">
              The interface stays quiet so the financial signal has room to breathe.
            </h2>
          </div>

          <div className="grid gap-5">
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className={`editorial-panel editorial-panel-hover flex items-start gap-5 p-8 fade-in-section ${index === 1 ? "fade-delay-1" : index === 2 ? "fade-delay-2" : index === 3 ? "fade-delay-3" : ""}`}
              >
                <div className="mt-1 h-3 w-3 rounded-full bg-primary" />
                <p className="text-lg leading-8 text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
