export interface Recommendation {
  title: string
  description: string
  steps: string[]
  savingsMin: number
  savingsMax: number
  priority: "high" | "medium" | "low"
  difficulty: "easy" | "moderate" | "hard"
}

export interface SavingsAction {
  title: string
  description: string
  savingsMin: number
  savingsMax: number
}

export interface Anomaly {
  type: "spike" | "pattern" | "unusual"
  title: string
  description: string
  impact: string
}

export interface BillAnalysis {
  analysisId?: string
  totalBill: number | null
  kwhUsage: number | null
  demandCharge: number | null
  peakDemand: number | null
  billingPeriod: string | null
  supplyCharges: number | null
  deliveryCharges: number | null
  taxesAndFees: number | null
  onPeakUsage?: number | null
  offPeakUsage?: number | null
  estimatedWasteMin: number
  estimatedWasteMax: number
  estimatedWasteRange?: string
  mainCostDriver?: string
  recommendations: Recommendation[]
  savingsActions?: SavingsAction[]
  anomalies: Anomaly[]
  aiExplanation: string
  demandData: { time: string; demand: number }[]
  peakTime: string | null
  benchmarkSummary?: {
    size_tier: "small" | "medium" | "large"
    expected_kwh_range: { min: number; max: number }
    expected_midpoint_kwh: number
    efficiency_score: number
    difference_percentage: number
  }
  parsedBill?: {
    total_bill: { value: number | null; confidence: number; evidence_line: string | null }
    billing_period: { value: string | null; confidence: number; evidence_line: string | null }
    kwh_usage: { value: number | null; confidence: number; evidence_line: string | null }
    demand_charge: { value: number | null; confidence: number; evidence_line: string | null }
    peak_demand_kw: { value: number | null; confidence: number; evidence_line: string | null }
    on_peak_kwh: { value: number | null; confidence: number; evidence_line: string | null }
    off_peak_kwh: { value: number | null; confidence: number; evidence_line: string | null }
    peak_hours: { value: string | null; confidence: number; evidence_line: string | null }
    delivery_charges: { value: number | null; confidence: number; evidence_line: string | null }
    supply_charges: { value: number | null; confidence: number; evidence_line: string | null }
    taxes: { value: number | null; confidence: number; evidence_line: string | null }
  }
  extractionSummary?: {
    matchedFields: string[]
    averageConfidence?: number
  }
  savedAt?: string
}
