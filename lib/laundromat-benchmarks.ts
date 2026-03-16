export interface LaundromatProfile {
  number_of_washers: number
  number_of_dryers: number
  store_hours: number
}

export interface LaundromatBenchmarkResult {
  size_tier: "small" | "medium" | "large"
  expected_kwh_range: {
    min: number
    max: number
  }
  expected_midpoint_kwh: number
  efficiency_score: number
  difference_percentage: number
}

export const DEFAULT_LAUNDROMAT_PROFILE: LaundromatProfile = {
  number_of_washers: 18,
  number_of_dryers: 18,
  store_hours: 14,
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getSizeTier(profile: LaundromatProfile): LaundromatBenchmarkResult["size_tier"] {
  const machineCount = profile.number_of_washers + profile.number_of_dryers

  if (machineCount <= 20) {
    return "small"
  }

  if (machineCount <= 40) {
    return "medium"
  }

  return "large"
}

export function estimateLaundromatBenchmark(
  profile: LaundromatProfile,
  actualKwhUsage: number | null,
): LaundromatBenchmarkResult {
  const normalizedHours = clamp(profile.store_hours, 8, 24)
  const hourFactor = normalizedHours / 14
  const washerMonthlyKwh = profile.number_of_washers * 180
  const dryerMonthlyKwh = profile.number_of_dryers * 420
  const expectedMidpointKwh = Math.round((washerMonthlyKwh + dryerMonthlyKwh) * hourFactor)
  const rangeSpread = 0.18
  const min = Math.round(expectedMidpointKwh * (1 - rangeSpread))
  const max = Math.round(expectedMidpointKwh * (1 + rangeSpread))
  const differencePercentage =
    actualKwhUsage && expectedMidpointKwh > 0
      ? Number((((actualKwhUsage - expectedMidpointKwh) / expectedMidpointKwh) * 100).toFixed(1))
      : 0

  const efficiencyScore =
    actualKwhUsage && expectedMidpointKwh > 0
      ? Math.round(clamp(100 - Math.abs(differencePercentage) * 1.25, 35, 98))
      : 75

  return {
    size_tier: getSizeTier(profile),
    expected_kwh_range: {
      min,
      max,
    },
    expected_midpoint_kwh: expectedMidpointKwh,
    efficiency_score: efficiencyScore,
    difference_percentage: differencePercentage,
  }
}
