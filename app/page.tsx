import { Header } from "@/components/header"
import { HeroSection } from "@/components/landing/hero-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { UploadSection } from "@/components/landing/upload-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ExampleAnalysisSection } from "@/components/landing/example-analysis-section"
import { FinalCTASection } from "@/components/landing/final-cta-section"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <UploadSection />
        <HowItWorksSection />
        <ExampleAnalysisSection />
        <FeaturesSection />
        <FinalCTASection />
      </main>
    </div>
  )
}
