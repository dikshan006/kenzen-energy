import { Cpu } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AIExplanationProps {
  explanation: string
}

export function AIExplanation({ explanation }: AIExplanationProps) {
  return (
    <Card className="col-span-full overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[120px_minmax(0,1fr)]">
        <div className="stripe-panel-soft hidden lg:block" />
        <div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
                <Cpu className="h-4 w-4 text-primary-foreground" />
              </div>
              <CardTitle>AI Analysis Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-w-3xl text-base leading-8 text-muted-foreground">
              <p className="whitespace-pre-line">{explanation}</p>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
