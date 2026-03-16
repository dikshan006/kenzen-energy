export interface ParsedField<T> {
  value: T | null
  confidence: number
  evidence_line: string | null
}

export interface ParsedBillData {
  total_bill: number | null
  billing_period: string | null
  kwh_usage: number | null
  demand_charge: number | null
  peak_demand_kw: number | null
  on_peak_kwh: number | null
  off_peak_kwh: number | null
  peak_hours: string | null
  delivery_charges: number | null
  supply_charges: number | null
  taxes: number | null
}

export interface ParsedBillFields {
  total_bill: ParsedField<number>
  billing_period: ParsedField<string>
  kwh_usage: ParsedField<number>
  demand_charge: ParsedField<number>
  peak_demand_kw: ParsedField<number>
  on_peak_kwh: ParsedField<number>
  off_peak_kwh: ParsedField<number>
  peak_hours: ParsedField<string>
  delivery_charges: ParsedField<number>
  supply_charges: ParsedField<number>
  taxes: ParsedField<number>
}

export interface UtilityBillSummary {
  total_amount_due: number | null
  electric_charges: number | null
  delivery_charges: number | null
  kwh_usage: number | null
}

export interface BillParseResult {
  fields: ParsedBillFields
  data: ParsedBillData
  summary: UtilityBillSummary
  matchedFields: Array<keyof ParsedBillData>
  averageConfidence: number
  normalizedText: string
  lines: string[]
}

type NumericMode = "currency" | "quantity" | "kw"

interface MatchResult<T> {
  value: T | null
  confidence: number
  evidence_line: string | null
}

const EMPTY_NUMBER_FIELD: ParsedField<number> = {
  value: null,
  confidence: 0,
  evidence_line: null,
}

const EMPTY_TEXT_FIELD: ParsedField<string> = {
  value: null,
  confidence: 0,
  evidence_line: null,
}

function emptyNumberMatch(): MatchResult<number> {
  return { ...EMPTY_NUMBER_FIELD }
}

function emptyTextMatch(): MatchResult<string> {
  return { ...EMPTY_TEXT_FIELD }
}

function normalizeWhitespace(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
}

function normalizeLine(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function normalizeForSearch(value: string) {
  return normalizeWhitespace(value).replace(/\s+/g, " ").trim().toLowerCase()
}

function parseNumericToken(value: string) {
  const sanitized = value.replace(/[$,]/g, "").trim()
  const parsed = Number.parseFloat(sanitized)
  return Number.isFinite(parsed) ? parsed : null
}

function parseCurrencyFromLine(line: string) {
  const matches = Array.from(line.matchAll(/\$?\s*(-?\d[\d,]*(?:\.\d{1,2})?)/g))
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const value = parseNumericToken(matches[index][1])
    if (value !== null) {
      return value
    }
  }
  return null
}

function parseQuantityWithUnit(line: string, unitPattern: string) {
  const regex = new RegExp(`(-?\\d[\\d,]*(?:\\.\\d+)?)\\s*${unitPattern}\\b`, "ig")
  let match: RegExpExecArray | null = null
  let lastValue: number | null = null

  while ((match = regex.exec(line)) !== null) {
    const value = parseNumericToken(match[1])
    if (value !== null) {
      lastValue = value
    }
  }

  return lastValue
}

function parsePlainNumberFromLine(line: string) {
  const matches = Array.from(line.matchAll(/(-?\d[\d,]*(?:\.\d+)?)/g))
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const value = parseNumericToken(matches[index][1])
    if (value !== null) {
      return value
    }
  }
  return null
}

function extractNumericFromCandidate(line: string, mode: NumericMode) {
  if (mode === "currency") {
    return {
      value: parseCurrencyFromLine(line),
      hasExplicitUnit: /\$/.test(line),
    }
  }

  if (mode === "kw") {
    const withUnit = parseQuantityWithUnit(line, "k\\s*w")
    return {
      value: withUnit ?? parsePlainNumberFromLine(line),
      hasExplicitUnit: withUnit !== null,
    }
  }

  const withKwh =
    parseQuantityWithUnit(line, "k\\s*w\\s*h") ??
    parseQuantityWithUnit(line, "kwhr?s?") ??
    parseQuantityWithUnit(line, "units?")

  return {
    value: withKwh ?? parsePlainNumberFromLine(line),
    hasExplicitUnit: withKwh !== null,
  }
}

function hasLabel(line: string, labels: string[]) {
  const lowerLine = line.toLowerCase()
  return labels.some((label) => lowerLine.includes(label))
}

function snippetFromNormalizedText(normalizedText: string, index: number, length: number) {
  const start = Math.max(0, index - 28)
  const end = Math.min(normalizedText.length, index + length + 28)
  return normalizedText.slice(start, end).trim()
}

function scoreNumericMatch(mode: NumericMode, candidateOffset: number, hasExplicitUnit: boolean) {
  let confidence = 0.78

  if (candidateOffset === 0) {
    confidence += 0.12
  } else if (candidateOffset === 1) {
    confidence += 0.04
  } else {
    confidence -= 0.05
  }

  if (mode === "currency") {
    confidence += hasExplicitUnit ? 0.06 : 0.01
  } else if (mode === "quantity") {
    confidence += hasExplicitUnit ? 0.09 : -0.08
  } else {
    confidence += hasExplicitUnit ? 0.1 : -0.1
  }

  return Math.max(0, Math.min(Number(confidence.toFixed(2)), 0.99))
}

function findLabeledNumericValue(
  lines: string[],
  labels: string[],
  mode: NumericMode,
  disallowedTerms: string[] = [],
): MatchResult<number> {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const lowerLine = line.toLowerCase()

    if (!hasLabel(line, labels) || disallowedTerms.some((term) => lowerLine.includes(term))) {
      continue
    }

    // Many utility bills place labels and values on separate lines or table rows. We
    // check the label line first, then a small look-ahead window for the matching value.
    const window = [line, lines[index + 1], lines[index + 2]].filter(Boolean) as string[]

    for (let candidateOffset = 0; candidateOffset < window.length; candidateOffset += 1) {
      const candidate = window[candidateOffset]
      const lowerCandidate = candidate.toLowerCase()

      if (disallowedTerms.some((term) => lowerCandidate.includes(term))) {
        continue
      }

      const extracted = extractNumericFromCandidate(candidate, mode)
      if (
        mode === "quantity" &&
        candidateOffset === 0 &&
        !extracted.hasExplicitUnit &&
        (/\$\s*\d/.test(candidate) || /\b[sS]\d[\d,]*\.\d{2}\b/.test(candidate))
      ) {
        continue
      }

      if (extracted.value !== null) {
        return {
          value: extracted.value,
          confidence: scoreNumericMatch(mode, candidateOffset, extracted.hasExplicitUnit),
          evidence_line: candidate,
        }
      }
    }
  }

  return emptyNumberMatch()
}

function findTrailingTotalAfterLabel(
  lines: string[],
  labels: string[],
  mode: NumericMode,
  stopLabels: string[] = [],
  lookahead = 12,
): MatchResult<number> {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!hasLabel(line, labels)) {
      continue
    }

    const values: Array<{ value: number; evidence_line: string }> = []

    for (let offset = 1; offset <= lookahead; offset += 1) {
      const candidate = lines[index + offset]
      if (!candidate) {
        break
      }

      if (stopLabels.length > 0 && hasLabel(candidate, stopLabels)) {
        break
      }

      const extracted = extractNumericFromCandidate(candidate, mode)
      if (extracted.value !== null) {
        values.push({
          value: extracted.value,
          evidence_line: candidate,
        })
      }
    }

    if (values.length > 0) {
      const lastValue = values[values.length - 1]
      return {
        value: lastValue.value,
        confidence: 0.98,
        evidence_line: `${line} -> ${lastValue.evidence_line}`,
      }
    }
  }

  return emptyNumberMatch()
}

function findRegexNumericValue(
  normalizedText: string,
  patterns: RegExp[],
  mode: NumericMode,
  confidence = 0.72,
): MatchResult<number> {
  // This is the flexible fallback layer for utilities that flatten bill text into
  // one OCR paragraph instead of preserving clean label/value lines.
  for (const pattern of patterns) {
    const match = pattern.exec(normalizedText)
    if (!match) {
      continue
    }

    const value = parseNumericToken(match[1] ?? "")
    if (value === null) {
      continue
    }

    const explicitUnit =
      mode === "currency"
        ? match[0].includes("$")
        : mode === "quantity"
          ? /\bkwh\b/i.test(match[0])
          : /\bkw\b/i.test(match[0])

    return {
      value,
      confidence: Math.max(confidence, scoreNumericMatch(mode, 0, explicitUnit)),
      evidence_line: snippetFromNormalizedText(normalizedText, match.index, match[0].length),
    }
  }

  return emptyNumberMatch()
}

function extractChargeRows(lines: string[]) {
  // Many utility bills render charges as simple table rows like
  // "Distribution Charge 41.07". We capture those rows once so specific fields can
  // reuse them without repeating regex logic.
  return lines
    .map((line) => {
      const match = line.match(/^([A-Za-z][A-Za-z/&,\-(). ]{2,}?)\s+\$?(-?\d[\d,]*(?:\.\d{2})?)$/)
      if (!match) {
        return null
      }

      const value = parseNumericToken(match[2])
      if (value === null) {
        return null
      }

      return {
        label: normalizeLine(match[1]).toLowerCase(),
        value,
        evidence_line: line,
      }
    })
    .filter(Boolean) as Array<{ label: string; value: number; evidence_line: string }>
}

function findChargeRowValue(
  rows: Array<{ label: string; value: number; evidence_line: string }>,
  labelPatterns: RegExp[],
  confidence = 0.88,
): MatchResult<number> {
  for (const row of rows) {
    if (labelPatterns.some((pattern) => pattern.test(row.label))) {
      return {
        value: row.value,
        confidence,
        evidence_line: row.evidence_line,
      }
    }
  }

  return emptyNumberMatch()
}

function chooseBestNumberMatch(...matches: MatchResult<number>[]) {
  return matches.reduce<MatchResult<number>>((best, current) => {
    if (current.value === null) {
      return best
    }

    if (best.value === null || current.confidence > best.confidence) {
      return current
    }

    return best
  }, emptyNumberMatch())
}

function findBillingPeriod(lines: string[], normalizedText: string): MatchResult<string> {
  const linePatterns = [
    /(?:billing|service)\s+period[:\s-]+(.+)$/i,
    /(?:service\s+from|billing\s+from)[:\s-]+(.+?)\s+(?:to|-)\s+(.+)$/i,
  ]

  for (const line of lines) {
    for (const pattern of linePatterns) {
      const match = line.match(pattern)
      if (!match) {
        continue
      }

      const value = match
        .slice(1)
        .filter(Boolean)
        .join(" to ")
        .replace(/\s+/g, " ")
        .trim()

      if (value) {
        return {
          value,
          confidence: 0.95,
          evidence_line: line,
        }
      }
    }
  }

  const textPatterns = [
    /(?:billing|service)\s+period[:\s-]+([A-Za-z0-9,\/ -]{8,60})/i,
    /from\s+(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})\s+(?:to|-)\s+(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})/i,
  ]

  for (const pattern of textPatterns) {
    const match = normalizedText.match(pattern)
    if (!match) {
      continue
    }

    const value = match
      .slice(1)
      .filter(Boolean)
      .join(" to ")
      .replace(/\s+/g, " ")
      .trim()

    if (value) {
      return {
        value,
        confidence: 0.82,
        evidence_line: match[0].trim(),
      }
    }
  }

  return emptyTextMatch()
}

function findPeakHours(lines: string[], normalizedText: string): MatchResult<string> {
  const labels = [
    "peak hours",
    "on-peak hours",
    "on peak hours",
    "peak period",
    "on-peak period",
    "on peak period",
  ]

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!hasLabel(line, labels)) {
      continue
    }

    const directMatch = line.match(/(?:hours|period)[:\s-]+(.+)$/i)
    if (directMatch?.[1]) {
      return {
        value: directMatch[1].trim(),
        confidence: 0.91,
        evidence_line: line,
      }
    }

    const nextLine = lines[index + 1]
    if (nextLine && /(am|pm|mon|tue|wed|thu|fri|sat|sun|\d{1,2}:\d{2})/i.test(nextLine)) {
      return {
        value: nextLine.trim(),
        confidence: 0.84,
        evidence_line: `${line} ${nextLine}`,
      }
    }
  }

  const inlineMatch = normalizedText.match(
    /(?:on[- ]peak hours?|peak hours?|peak period)[:\s-]+([A-Za-z0-9:.\- ]{5,60})/i,
  )

  if (inlineMatch?.[1]) {
    return {
      value: inlineMatch[1].trim(),
      confidence: 0.76,
      evidence_line: inlineMatch[0].trim(),
    }
  }

  return emptyTextMatch()
}

function createEmptyFields(): ParsedBillFields {
  return {
    total_bill: { ...EMPTY_NUMBER_FIELD },
    billing_period: { ...EMPTY_TEXT_FIELD },
    kwh_usage: { ...EMPTY_NUMBER_FIELD },
    demand_charge: { ...EMPTY_NUMBER_FIELD },
    peak_demand_kw: { ...EMPTY_NUMBER_FIELD },
    on_peak_kwh: { ...EMPTY_NUMBER_FIELD },
    off_peak_kwh: { ...EMPTY_NUMBER_FIELD },
    peak_hours: { ...EMPTY_TEXT_FIELD },
    delivery_charges: { ...EMPTY_NUMBER_FIELD },
    supply_charges: { ...EMPTY_NUMBER_FIELD },
    taxes: { ...EMPTY_NUMBER_FIELD },
  }
}

function fieldsToPlainData(fields: ParsedBillFields): ParsedBillData {
  return {
    total_bill: fields.total_bill.value,
    billing_period: fields.billing_period.value,
    kwh_usage: fields.kwh_usage.value,
    demand_charge: fields.demand_charge.value,
    peak_demand_kw: fields.peak_demand_kw.value,
    on_peak_kwh: fields.on_peak_kwh.value,
    off_peak_kwh: fields.off_peak_kwh.value,
    peak_hours: fields.peak_hours.value,
    delivery_charges: fields.delivery_charges.value,
    supply_charges: fields.supply_charges.value,
    taxes: fields.taxes.value,
  }
}

function buildSummary(data: ParsedBillData): UtilityBillSummary {
  return {
    total_amount_due: data.total_bill,
    electric_charges: data.supply_charges,
    delivery_charges: data.delivery_charges,
    kwh_usage: data.kwh_usage,
  }
}

export function parseBillText(rawPdfText: string): BillParseResult {
  const normalizedText = normalizeForSearch(rawPdfText)
  const linePreservingText = normalizeWhitespace(rawPdfText)
  const lines = linePreservingText
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean)
  const chargeRows = extractChargeRows(lines)

  const fields = createEmptyFields()

  // To support a new utility format, extend the exact label lists below first. That
  // keeps behavior predictable and reduces the risk of a generic regex matching the
  // wrong row in dense utility bill tables.
  fields.total_bill = chooseBestNumberMatch(
    findLabeledNumericValue(
      lines,
      [
        "total amount due",
        "balance due",
        "amount due",
        "current charges",
        "total current charges",
        "bill amount",
        "total electric charges",
      ],
      "currency",
      ["previous amount due", "late payment", "past due"],
    ),
    findRegexNumericValue(
      normalizedText,
      [
        /electric.*total.*due.*?\$?([\d,]+\.\d{2})/i,
        /total amount due.*?\$?([\d,]+\.\d{2})/i,
        /balance due.*?\$?([\d,]+\.\d{2})/i,
        /amount due.*?\$?([\d,]+\.\d{2})/i,
        /current charges.*?\$?([\d,]+\.\d{2})/i,
      ],
      "currency",
      0.78,
    ),
  )
  fields.billing_period = findBillingPeriod(lines, normalizedText)
  fields.kwh_usage = chooseBestNumberMatch(
    findLabeledNumericValue(
      lines,
      [
        "total kwh",
        "kwh usage",
        "energy usage",
        "usage kwh",
        "total energy usage",
        "electric usage",
      ],
      "quantity",
      ["on-peak", "off-peak"],
    ),
    findRegexNumericValue(
      normalizedText,
      [
        /(?:total\s+)?(?:electricity|electric|energy)?\s*usage.*?(\d{3,6})\s*kwh/i,
        /use\s+changes to electric\s+[s$]?[\d,]+\.\d{2}\s+(\d{3,6})\s+balance/i,
        /(\d{3,6})\s*kwh/i,
      ],
      "quantity",
      0.73,
    ),
  )
  fields.demand_charge = chooseBestNumberMatch(
    findLabeledNumericValue(
      lines,
      ["demand charge", "demand charges", "maximum demand charge", "billed demand charge"],
      "currency",
    ),
    findRegexNumericValue(
      normalizedText,
      [
        /demand charge .*? \$?([\d,.]+)/i,
        /demand charges .*? \$?([\d,.]+)/i,
      ],
      "currency",
      0.79,
    ),
  )
  fields.peak_demand_kw = chooseBestNumberMatch(
    findLabeledNumericValue(
      lines,
      ["peak demand", "maximum demand", "billed demand", "kw demand", "peak kw", "billing demand"],
      "kw",
    ),
    findRegexNumericValue(
      normalizedText,
      [
        /peak demand .*? (\d{1,4})\s?kw/i,
        /maximum demand .*? (\d{1,4})\s?kw/i,
        /billed demand .*? (\d{1,4})\s?kw/i,
      ],
      "kw",
      0.8,
    ),
  )
  fields.on_peak_kwh = findLabeledNumericValue(
    lines,
    ["on-peak kwh", "on peak kwh", "on-peak usage", "on peak usage"],
    "quantity",
  )
  fields.off_peak_kwh = findLabeledNumericValue(
    lines,
    ["off-peak kwh", "off peak kwh", "off-peak usage", "off peak usage"],
    "quantity",
  )
  fields.peak_hours = findPeakHours(lines, normalizedText)
  fields.delivery_charges = chooseBestNumberMatch(
    findTrailingTotalAfterLabel(
      lines,
      ["total electric delivery charges", "total delivery charges"],
      "currency",
      ["electric summary", "supply charges", "electric charges"],
    ),
    findLabeledNumericValue(
      lines,
      [
        "total electric delivery charges",
        "total delivery charges",
        "delivery charges",
        "delivery charge",
      ],
      "currency",
    ),
    findLabeledNumericValue(
      lines,
      [
        "distribution charges",
        "distribution charge",
        "delivery services",
      ],
      "currency",
    ),
    findRegexNumericValue(
      normalizedText,
      [
        /total electric delivery charges.*?\$?([\d,]+\.\d{2})/i,
        /delivery charges.*?\$?([\d,]+\.\d{2})/i,
      ],
      "currency",
      0.77,
    ),
    findChargeRowValue(chargeRows, [/delivery charges?/, /distribution charges?/], 0.9),
  )
  fields.supply_charges = chooseBestNumberMatch(
    findLabeledNumericValue(
      lines,
      [
        "electric charges",
        "supply charges",
        "supply charge",
        "generation charges",
        "generation charge",
        "energy charges",
        "electric supply",
        "electric charges",
      ],
      "currency",
    ),
    findRegexNumericValue(
      normalizedText,
      [
        /electric charges\s+[s$]?([\d,]+\.\d{2})\b/i,
        /new electric charges\s+[s$]?([\d,]+\.\d{2})\b/i,
        /energy charges\s+[s$]?([\d,]+\.\d{2})\b/i,
      ],
      "currency",
      0.77,
    ),
    findChargeRowValue(chargeRows, [/electric charges?/, /energy charges?/, /generation charges?/], 0.9),
  )
  fields.taxes = findLabeledNumericValue(
    lines,
    ["taxes", "taxes and fees", "tax and fees", "sales tax", "state tax", "city tax"],
    "currency",
  )

  const data = fieldsToPlainData(fields)
  const summary = buildSummary(data)
  const matchedFields = (Object.keys(data) as Array<keyof ParsedBillData>).filter(
    (key) => data[key] !== null,
  )
  const confidenceValues = matchedFields.map((key) => fields[key].confidence)
  const averageConfidence =
    confidenceValues.length > 0
      ? Number(
          (
            confidenceValues.reduce((sum, confidence) => sum + confidence, 0) /
            confidenceValues.length
          ).toFixed(2),
        )
      : 0

  return {
    fields,
    data,
    summary,
    matchedFields,
    averageConfidence,
    normalizedText,
    lines,
  }
}
