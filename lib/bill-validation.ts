import type { ParsedBillData } from "./bill-parser"

export interface BillValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateBillData(data: ParsedBillData): BillValidationResult {
  const errors: string[] = []

  if (data.total_bill === null || data.total_bill <= 0) {
    errors.push("The bill total could not be validated. Expected a total bill amount greater than 0.")
  }

  if (data.kwh_usage === null || data.kwh_usage <= 0) {
    errors.push("The energy usage could not be validated. Expected total kWh usage greater than 0.")
  }

  if (
    data.demand_charge !== null &&
    data.total_bill !== null &&
    data.demand_charge > data.total_bill
  ) {
    errors.push("Demand charge cannot be larger than the total bill amount.")
  }

  if (
    data.peak_demand_kw !== null &&
    (data.peak_demand_kw < 0 || data.peak_demand_kw > 1000)
  ) {
    errors.push("Peak demand must be within a reasonable range of 0 to 1000 kW.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
