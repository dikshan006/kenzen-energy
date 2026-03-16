import test from "node:test"
import assert from "node:assert/strict"

import { estimateLaundromatBenchmark } from "../lib/laundromat-benchmarks.ts"
import { calculateSavingsOpportunity } from "../lib/savings-engine.ts"

test("benchmark estimates expected usage for laundromat size and hours", () => {
  const result = estimateLaundromatBenchmark(
    {
      number_of_washers: 20,
      number_of_dryers: 20,
      store_hours: 14,
    },
    12480,
  )

  assert.equal(result.size_tier, "medium")
  assert.ok(result.expected_kwh_range.min > 0)
  assert.ok(result.expected_kwh_range.max > result.expected_kwh_range.min)
  assert.equal(typeof result.efficiency_score, "number")
})

test("savings engine flags demand and on-peak opportunities", () => {
  const result = calculateSavingsOpportunity(
    {
      total_bill: 2200,
      billing_period: "Jan 1 - Jan 31",
      kwh_usage: 12000,
      demand_charge: 700,
      peak_demand_kw: 180,
      on_peak_kwh: 7000,
      off_peak_kwh: 5000,
      peak_hours: "1 PM - 7 PM",
      delivery_charges: 450,
      supply_charges: 900,
      taxes: 40,
    },
    {
      number_of_washers: 18,
      number_of_dryers: 18,
      store_hours: 14,
    },
  )

  assert.ok(result.estimated_waste_min > 0)
  assert.ok(result.estimated_waste_max >= result.estimated_waste_min)
  assert.ok(result.recommended_actions.length >= 2)
  assert.ok(
    result.recommended_actions.some((action) => action.title.includes("peak demand")),
  )
  assert.ok(
    result.recommended_actions.some((action) => action.title.includes("off-peak")),
  )
})
