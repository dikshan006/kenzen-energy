"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { BillAnalysis } from "@/lib/types/analysis"

interface AnalysisContextType {
  analysis: BillAnalysis | null
  setAnalysis: (analysis: BillAnalysis | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AnalysisContext.Provider value={{ analysis, setAnalysis, isLoading, setIsLoading }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider")
  }
  return context
}
