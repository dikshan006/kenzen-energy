import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

import { parseBillText } from "../lib/bill-parser.ts"
import { validateBillData } from "../lib/bill-validation.ts"

function readFixture(name: string) {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8")
}

test("parses a time-of-use bill with confidence metadata", () => {
  const fixture = readFixture("laundromat-time-of-use-bill.txt")
  const result = parseBillText(fixture)

  assert.equal(result.data.total_bill, 2184.52)
  assert.equal(result.data.kwh_usage, 12480)
  assert.equal(result.data.demand_charge, 582)
  assert.equal(result.data.peak_demand_kw, 184)
  assert.equal(result.data.on_peak_kwh, 4820)
  assert.equal(result.data.off_peak_kwh, 7660)
  assert.equal(result.data.peak_hours, "Mon-Fri 1:00 PM - 7:00 PM")
  assert.ok(result.fields.demand_charge.confidence >= 0.9)
  assert.equal(result.fields.demand_charge.evidence_line, "Demand Charge: $582.00")
  assert.ok(result.averageConfidence >= 0.85)
})

test("parses a simpler bill and leaves unsupported fields null", () => {
  const fixture = readFixture("laundromat-basic-bill.txt")
  const result = parseBillText(fixture)

  assert.equal(result.data.total_bill, 1268.9)
  assert.equal(result.data.kwh_usage, 8950)
  assert.equal(result.data.peak_demand_kw, 122)
  assert.equal(result.data.supply_charges, 634.1)
  assert.equal(result.data.delivery_charges, 301.5)
  assert.equal(result.data.taxes, 22.4)
  assert.equal(result.data.on_peak_kwh, null)
  assert.equal(result.data.off_peak_kwh, null)
  assert.equal(result.fields.on_peak_kwh.confidence, 0)
})

test("validation rejects unreasonable or missing production data", () => {
  const fixture = readFixture("laundromat-invalid-bill.txt")
  const result = parseBillText(fixture)
  const validation = validateBillData(result.data)

  assert.equal(result.data.total_bill, 450)
  assert.equal(result.data.kwh_usage, 0)
  assert.equal(result.data.peak_demand_kw, 1405)
  assert.equal(validation.isValid, false)
  assert.ok(
    validation.errors.some((message) => message.includes("greater than 0")),
  )
  assert.ok(
    validation.errors.some((message) => message.includes("0 to 1000 kW")),
  )
  assert.ok(
    validation.errors.some((message) => message.includes("Demand charge cannot be larger")),
  )
})

test("parses normalized summary fields and table-style charge rows", () => {
  const fixture = `
    ELECTRIC TOTAL DUE $1,248.42

    electricity usage
    12480 KWH

    Customer Charge 6.75
    Distribution Charge 41.07
    Electric Charges $684.21
    Total Electric Delivery Charges $214.66
  `

  const result = parseBillText(fixture)

  assert.equal(result.summary.total_amount_due, 1248.42)
  assert.equal(result.summary.electric_charges, 684.21)
  assert.equal(result.summary.delivery_charges, 214.66)
  assert.equal(result.summary.kwh_usage, 12480)
  assert.equal(result.data.delivery_charges, 214.66)
  assert.equal(result.fields.delivery_charges.evidence_line, "Total Electric Delivery Charges $214.66")
  assert.ok(result.normalizedText.includes("electric total due $1,248.42".toLowerCase()))
})

test("maps provider synonyms and demand fields correctly", () => {
  const fixture = `
    Balance Due $987.65
    Current Charges $987.65
    Demand Charge $321.09
    Peak Demand 184 kW
  `

  const result = parseBillText(fixture)

  assert.equal(result.summary.total_amount_due, 987.65)
  assert.equal(result.data.total_bill, 987.65)
  assert.equal(result.data.demand_charge, 321.09)
  assert.equal(result.data.peak_demand_kw, 184)
})

test("parses photo-style utility pdf text with summary totals", () => {
  const fixture = `
    Details of your Electric Charges
    Delivery Charges:
    Current charges for 30 days, winter rates in effect.
    Type of charge
    Customer Charge
    Distribution Charge First 500 kWh X $0.0821400 per kWh
    Distribution Charge Last 2382 kWh X $0.0833207 per kWh
    2882 kWh X $0.0108362 per kWh
    Conservation Incent Prog 2882 kWh X $0.0078106 per kWh
    Total Electric Delivery Charges
    Amount($)
    6.75
    41.07
    198.47
    10.00
    31.23
    20.52
    22.51
    330.55
    Electric Summary
    Balance from your $497.79
    last bill
    Total Deposit Outstanding $985.00
    Use Changes to electric S985.00
    2882 balance
    Electric Charges $870.44
    New electric charges S870.44
    Total amount due by S2,353.23
    Jan 8, 2026
  `

  const result = parseBillText(fixture)

  assert.equal(result.summary.total_amount_due, 2353.23)
  assert.equal(result.summary.electric_charges, 870.44)
  assert.equal(result.summary.delivery_charges, 330.55)
  assert.equal(result.summary.kwh_usage, 2882)
  assert.equal(result.data.delivery_charges, 330.55)
  assert.equal(result.data.kwh_usage, 2882)
})
