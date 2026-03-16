interface MonitoringEvent {
  event: string
  level: "info" | "warn" | "error"
  message: string
  metadata?: Record<string, unknown>
}

function emitMonitoringEvent(payload: MonitoringEvent) {
  const body = {
    timestamp: new Date().toISOString(),
    ...payload,
  }

  const line = JSON.stringify(body)

  if (payload.level === "error") {
    console.error(line)
    return
  }

  if (payload.level === "warn") {
    console.warn(line)
    return
  }

  console.info(line)
}

export function logParserFailure(message: string, metadata?: Record<string, unknown>) {
  emitMonitoringEvent({
    event: "bill_parser_failure",
    level: "warn",
    message,
    metadata,
  })
}

export function logValidationFailure(message: string, metadata?: Record<string, unknown>) {
  emitMonitoringEvent({
    event: "bill_validation_failure",
    level: "warn",
    message,
    metadata,
  })
}

export function logAiFailure(message: string, metadata?: Record<string, unknown>) {
  emitMonitoringEvent({
    event: "bill_ai_failure",
    level: "error",
    message,
    metadata,
  })
}

export function logAnalysisSuccess(message: string, metadata?: Record<string, unknown>) {
  emitMonitoringEvent({
    event: "bill_analysis_success",
    level: "info",
    message,
    metadata,
  })
}
