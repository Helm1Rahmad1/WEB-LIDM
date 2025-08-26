"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Hand, CheckCircle } from "lucide-react"

interface InteractiveLetterCardProps {
  letter: {
    arabic_char: string
    latin_name: string
    ordinal: number
  }
  onComplete?: () => void
  showProgress?: boolean
}

export function InteractiveLetterCard({ letter, onComplete, showProgress = true }: InteractiveLetterCardProps) {
  const [currentView, setCurrentView] = useState<"visual" | "practice" | "complete">("visual")
  const [attempts, setAttempts] = useState(0)

  const handlePractice = () => {
    setAttempts(attempts + 1)
    if (attempts >= 2) {
      setCurrentView("complete")
      onComplete?.()
    } else {
      setCurrentView("practice")
    }
  }

  const handleReset = () => {
    setCurrentView("visual")
    setAttempts(0)
  }

  return (
    <Card className="border-0 shadow-lg max-w-md mx-auto">
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl font-bold mb-3" style={{ color: "#147E7E" }}>
            {letter.arabic_char}
          </div>
          <div className="text-xl font-semibold mb-2" style={{ color: "#2C3E50" }}>
            {letter.latin_name}
          </div>
          <Badge className="text-sm" style={{ backgroundColor: "#F1C40F", color: "#2C3E50" }}>
            Huruf ke-{letter.ordinal}
          </Badge>
        </div>

        {/* Content based on current view */}
        {currentView === "visual" && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-blue-900 mb-2">Perhatikan Bentuk Huruf</h4>
              <p className="text-sm text-blue-700">
                Ini adalah huruf {letter.latin_name}. Perhatikan bentuknya dengan seksama.
              </p>
            </div>
            <Button
              onClick={() => setCurrentView("practice")}
              className="w-full text-white"
              style={{ backgroundColor: "#147E7E" }}
            >
              Mulai Latihan
            </Button>
          </div>
        )}

        {currentView === "practice" && (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <Hand className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h4 className="font-medium text-yellow-900 mb-2">Latihan Pengenalan</h4>
              <p className="text-sm text-yellow-700 mb-4">Klik pada huruf {letter.latin_name} yang benar!</p>
              <div className="grid grid-cols-2 gap-3">
                {[letter.arabic_char, "ب", "ت", "ث"].map((char, index) => (
                  <Button
                    key={index}
                    onClick={handlePractice}
                    variant={char === letter.arabic_char ? "default" : "outline"}
                    className={`text-2xl h-16 ${char === letter.arabic_char ? "text-white" : "bg-transparent"}`}
                    style={char === letter.arabic_char ? { backgroundColor: "#147E7E" } : undefined}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </div>
            {showProgress && <div className="text-center text-sm text-gray-600">Percobaan: {attempts + 1}/3</div>}
          </div>
        )}

        {currentView === "complete" && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-green-900 mb-2">Bagus!</h4>
              <p className="text-sm text-green-700">Anda telah berhasil mengenali huruf {letter.latin_name}!</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
                Ulangi
              </Button>
              <Button onClick={onComplete} className="flex-1 text-white" style={{ backgroundColor: "#147E7E" }}>
                Lanjutkan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
