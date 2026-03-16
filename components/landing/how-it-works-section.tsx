export function HowItWorksSection() {
  const steps = [
    {
      number: "Step 1",
      title: "Upload Bill",
      body: "Upload your electricity bill PDF.",
    },
    {
      number: "Step 2",
      title: "AI Analysis",
      body: "Kenzen extracts key billing fields such as energy usage, demand charges, and peak demand windows.",
    },
    {
      number: "Step 3",
      title: "Savings Insights",
      body: "See what is driving your electricity costs and where savings may exist.",
    },
  ]

  return (
    <section id="how-it-works" className="editorial-section">
      <div className="page-frame">
        <div className="fade-in-section max-w-2xl">
          <p className="section-kicker">How it works</p>
          <h2 className="editorial-subtitle mt-4">See how the analysis works.</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className={`editorial-panel editorial-panel-hover p-6 ${index === 1 ? "fade-delay-1" : index === 2 ? "fade-delay-2" : ""} fade-in-section`}
            >
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{step.number}</p>
              <h3 className="mt-4 font-serif text-[1.25rem] leading-[1.22] tracking-[-0.03em] text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-[1.125rem] leading-[1.3] text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
