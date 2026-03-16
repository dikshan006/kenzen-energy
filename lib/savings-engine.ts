import type { ParsedBillData } from "./bill-parser.ts"
import {
  estimateLaundromatBenchmark,
  type LaundromatBenchmarkResult,
  type LaundromatProfile,
} from "./laundromat-benchmarks.ts"

export interface SavingsAction {
  title: string
  description: string
  savingsMin: number
  savingsMax: number
}

export interface SavingsEngineResult {
  estimated_waste_min: number
  estimated_waste_max: number
  estimated_waste_range: string
  main_cost_driver: string
  recommended_actions: SavingsAction[]
  benchmark: LaundromatBenchmarkResult
}

function formatSavingsRange(min: number, max: number) {
  return `$${min.toLocaleString()}-$${max.toLocaleString()} per month`
}

function pushAction(
  actions: SavingsAction[],
  title: string,
  description: string,
  savingsMin: number,
  savingsMax: number,
) {
  actions.push({
    title,
    description,
    savingsMin: Math.round(Math.max(0, savingsMin)),
    savingsMax: Math.round(Math.max(savingsMin, savingsMax)),
  })
}

export function calculateSavingsOpportunity(
  parsedBill: ParsedBillData,
  profile: LaundromatProfile,
): SavingsEngineResult {
  const actions: SavingsAction[] = []
  const benchmark = estimateLaundromatBenchmark(profile, parsedBill.kwh_usage)
  let mainCostDriver = "Overall electric consumption is the main cost driver on this bill."

  if (
    parsedBill.total_bill !== null &&
    parsedBill.demand_charge !== null &&
    parsedBill.total_bill > 0 &&
    parsedBill.demand_charge / parsedBill.total_bill > 0.25
  ) {
    const savingsMin = parsedBill.demand_charge * 0.15
    const savingsMax = parsedBill.demand_charge * 0.3

    pushAction(
      actions,
      "Reduce peak demand spikes",
      "Demand charges make up more than 25% of this bill. Staggering dryer starts, managing water-heater recovery, and avoiding simultaneous heavy loads can lower the monthly peak.",
      savingsMin,
      savingsMax,
    )
    mainCostDriver = "Demand charges are a major driver of this bill."
  }

  if (
    parsedBill.on_peak_kwh !== null &&
    parsedBill.off_peak_kwh !== null &&
    parsedBill.on_peak_kwh > parsedBill.off_peak_kwh &&
    parsedBill.total_bill !== null &&
    parsedBill.kwh_usage !== null &&
    parsedBill.kwh_usage > 0
  ) {
    const blendedRate = parsedBill.total_bill / parsedBill.kwh_usage
    const shiftableKwh = (parsedBill.on_peak_kwh - parsedBill.off_peak_kwh) * 0.15
    const savingsMin = shiftableKwh * blendedRate * 0.4
    const savingsMax = shiftableKwh * blendedRate * 0.8

    pushAction(
      actions,
      "Shift usage into off-peak hours",
      "On-peak usage is higher than off-peak usage. Moving heater recovery, wash cycles, or bulk drying away from the peak window can reduce expensive consumption hours.",
      savingsMin,
      savingsMax,
    )

    if (mainCostDriver === "Overall electric consumption is the main cost driver on this bill.") {
      mainCostDriver = "A large share of usage is landing in expensive on-peak hours."
    }
  }

  if (
    parsedBill.kwh_usage !== null &&
    parsedBill.kwh_usage > benchmark.expected_kwh_range.max &&
    parsedBill.total_bill !== null &&
    benchmark.expected_midpoint_kwh > 0
  ) {
    const excessKwh = parsedBill.kwh_usage - benchmark.expected_midpoint_kwh
    const blendedRate = parsedBill.total_bill / parsedBill.kwh_usage
    const savingsMin = excessKwh * blendedRate * 0.25
    const savingsMax = excessKwh * blendedRate * 0.45

    pushAction(
      actions,
      "Address store-wide efficiency drift",
      `This bill is above the benchmark range for a ${benchmark.size_tier} laundromat with similar hours. Check dryer exhaust restrictions, leaking hot-water valves, HVAC scheduling, and machines that run hot or idle for long periods.`,
      savingsMin,
      savingsMax,
    )

    if (
      mainCostDriver === "Overall electric consumption is the main cost driver on this bill." ||
      parsedBill.demand_charge === null
    ) {
      mainCostDriver = "Total energy usage is running above the expected benchmark for this laundromat size."
    }
  }

  if (actions.length === 0 && parsedBill.total_bill !== null) {
    const baselineMin = parsedBill.total_bill * 0.05
    const baselineMax = parsedBill.total_bill * 0.1
    pushAction(
      actions,
      "Tighten operating schedules",
      "The bill does not show a single extreme issue, but schedule tuning and machine maintenance still offer modest monthly savings.",
      baselineMin,
      baselineMax,
    )
  }

  const estimatedWasteMin = actions.reduce((sum, action) => sum + action.savingsMin, 0)
  const estimatedWasteMax = actions.reduce((sum, action) => sum + action.savingsMax, 0)

  return {
    estimated_waste_min: Math.round(estimatedWasteMin),
    estimated_waste_max: Math.round(Math.max(estimatedWasteMin, estimatedWasteMax)),
    estimated_waste_range: formatSavingsRange(
      Math.round(estimatedWasteMin),
      Math.round(Math.max(estimatedWasteMin, estimatedWasteMax)),
    ),
    main_cost_driver: mainCostDriver,
    recommended_actions: actions,
    benchmark,
  }
}
