export function ExampleAnalysisSection() {
  return (
    <section id="example" className="editorial-section">
      <div className="page-frame">
        <div className="fade-in-section max-w-2xl">
          <p className="section-kicker">Example analysis</p>
          <h2 className="editorial-subtitle mt-4">Example Analysis</h2>
          <p className="editorial-copy mt-4">
            Kenzen identifies what drives these costs and suggests actions to reduce them.
          </p>
        </div>

        <div className="mt-8 fade-in-section fade-delay-1">
          <div className="report-surface p-8 md:p-10">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.75rem] border border-border/70 bg-white/6 p-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Total electricity bill</p>
                <p className="mt-4 font-serif text-[2.3rem] leading-[1.2] tracking-[-0.035em] text-foreground">
                  $1,842
                </p>
              </article>
              <article className="rounded-[1.75rem] border border-border/70 bg-white/6 p-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Demand charges</p>
                <p className="mt-4 font-serif text-[2.3rem] leading-[1.2] tracking-[-0.035em] text-foreground">
                  $582
                </p>
              </article>
              <article className="rounded-[1.75rem] border border-border/70 bg-white/6 p-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Estimated avoidable cost</p>
                <p className="mt-4 font-serif text-[2.3rem] leading-[1.2] tracking-[-0.035em] text-foreground">
                  $150-$320
                </p>
                <p className="mt-2 text-sm text-primary/76">per month</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
