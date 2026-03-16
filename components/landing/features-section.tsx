export function FeaturesSection() {
  const features = [
    {
      title: "Bill Breakdown",
      copy: "Understand usage, demand charges, and billing components without reading utility jargon line by line.",
    },
    {
      title: "Usage Patterns",
      copy: "Identify peak demand windows and inefficient machine usage that may be inflating electricity costs.",
    },
    {
      title: "Private by Design",
      copy: "Your documents are used only for analysis and are never shared outside the product workflow.",
    },
  ]

  return (
    <section id="features" className="editorial-section">
      <div className="page-frame">
        <div className="fade-in-section max-w-2xl">
          <p className="section-kicker">Feature highlights</p>
          <h2 className="editorial-subtitle mt-4">Built to make electricity costs easier to understand.</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`editorial-panel editorial-panel-hover p-6 ${index === 1 ? "fade-delay-1" : index === 2 ? "fade-delay-2" : ""} fade-in-section`}
            >
              <h3 className="font-serif text-[1.25rem] leading-[1.22] tracking-[-0.03em] text-foreground">
                {feature.title}
              </h3>
              <p className="mt-3 text-[1.125rem] leading-[1.3] text-muted-foreground">{feature.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
