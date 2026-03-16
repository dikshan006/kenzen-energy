import type { ParsedBillFields } from "@/lib/bill-parser"
import type { LaundromatBenchmarkResult, LaundromatProfile } from "@/lib/laundromat-benchmarks"
import type { SavingsAction } from "@/lib/savings-engine"

export interface StoredRecommendation {
  title: string
  description: string
  steps: string[]
  savingsMin: number
  savingsMax: number
  priority: "high" | "medium" | "low"
  difficulty: "easy" | "moderate" | "hard"
}

export interface BillAnalysisRecord {
  total_bill: number
  kwh_usage: number
  demand_charge: number | null
  peak_demand_kw: number | null
  peak_hours: string | null
  estimated_waste_range: string
  main_cost_driver: string
  recommendations: StoredRecommendation[]
  savings_actions: SavingsAction[]
  parsed_fields: ParsedBillFields
  laundromat_profile: LaundromatProfile
  benchmark_summary: LaundromatBenchmarkResult
  raw_bill_text: string
}

export interface StoredBillAnalysis extends BillAnalysisRecord {
  id: string
  created_at: string
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
    )
  }

  return { url, serviceRoleKey }
}

async function supabaseRequest<T>(path: string, init: RequestInit) {
  const { url, serviceRoleKey } = getSupabaseConfig()

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...init.headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${body}`)
  }

  return (await response.json()) as T
}

export async function insertBillAnalysis(record: BillAnalysisRecord) {
  const results = await supabaseRequest<StoredBillAnalysis[]>("bill_analyses", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(record),
  })

  return results[0] ?? null
}

export async function listBillAnalyses(limit = 12) {
  const query = `bill_analyses?select=*&order=created_at.desc&limit=${limit}`
  return supabaseRequest<StoredBillAnalysis[]>(query, {
    method: "GET",
  })
}

export async function getBillAnalysisById(id: string) {
  const query = `bill_analyses?select=*&id=eq.${encodeURIComponent(id)}&limit=1`
  const results = await supabaseRequest<StoredBillAnalysis[]>(query, {
    method: "GET",
  })

  return results[0] ?? null
}
