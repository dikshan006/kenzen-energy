import { BillUpload } from "@/components/upload/bill-upload"

export function UploadSection() {
  return (
    <section id="upload" className="editorial-section">
      <div className="page-frame space-y-8">
        <div className="fade-in-section max-w-2xl">
          <p className="section-kicker">Upload</p>
          <h2 className="editorial-subtitle mt-4">Upload your electricity bill.</h2>
          <p className="editorial-copy mt-4">
            We extract usage, demand charges, and peak hours automatically.
          </p>
        </div>
        <div className="fade-in-section fade-delay-1">
          <BillUpload />
        </div>
      </div>
    </section>
  )
}
