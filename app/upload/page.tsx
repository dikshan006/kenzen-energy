import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BillUpload } from "@/components/upload/bill-upload"
import { FileText, Shield, Zap } from "lucide-react"

export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1">
        <section className="editorial-section">
          <div className="page-frame space-y-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="fade-in-section">
                <p className="section-kicker">Upload and benchmark</p>
                <h1 className="editorial-subtitle mt-6">
                  Start with the original bill and let Kenzen compose the financial story.
                </h1>
                <p className="editorial-copy mt-6">
                  Add a little context about the store, upload the utility PDF, and receive a calmer
                  view of cost drivers, savings potential, and the next actions worth taking.
                </p>
              </div>
              <div className="stripe-panel-soft hidden rounded-[2rem] lg:block" />
            </div>

            <div className="fade-in-section fade-delay-1">
              <BillUpload />
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <div className="editorial-panel p-8 text-left fade-in-section">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h4 className="mt-5 font-serif text-2xl tracking-[-0.03em] text-foreground">
                  Bill Breakdown
                </h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Total cost, usage, demand charges, and the line items that shape the month.
                </p>
              </div>
              <div className="editorial-panel p-8 text-left fade-in-section fade-delay-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h4 className="mt-5 font-serif text-2xl tracking-[-0.03em] text-foreground">
                  Usage Patterns
                </h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Peak demand windows, efficiency signals, and the operating habits worth revisiting.
                </p>
              </div>
              <div className="editorial-panel p-8 text-left fade-in-section fade-delay-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h4 className="mt-5 font-serif text-2xl tracking-[-0.03em] text-foreground">
                  Private by Design
                </h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Your documents stay within the analysis flow and are used only to produce the report.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
