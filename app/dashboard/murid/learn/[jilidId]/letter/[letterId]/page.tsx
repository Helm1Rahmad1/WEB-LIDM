"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle, RotateCcw } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ jilidId: string; letterId: string }>
}

interface Letter {
  hijaiyah_id: number
  latin_name: string
  arabic_char: string
  ordinal: number
}

interface LearningStep {
  id: number
  title: string
  description: string
  type: "introduction" | "practice" | "quiz"
}

export default function LetterLearningPage({ params }: Props) {
  const router = useRouter()
  const [jilidId, setJilidId] = useState<string>("")
  const [letterId, setLetterId] = useState<string>("")
  const [letter, setLetter] = useState<Letter | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [practiceAttempts, setPracticeAttempts] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const learningSteps: LearningStep[] = [
    {
      id: 1,
      title: "Pengenalan Huruf",
      description: "Mari berkenalan dengan huruf hijaiyah ini",
      type: "introduction",
    },
    {
      id: 2,
      title: "Bentuk Huruf",
      description: "Pelajari bentuk dan cara penulisan huruf",
      type: "practice",
    },
    {
      id: 3,
      title: "Latihan Pengenalan",
      description: "Latihan mengenali huruf dalam berbagai bentuk",
      type: "practice",
    },
    {
      id: 4,
      title: "Kuis Singkat",
      description: "Uji pemahaman Anda tentang huruf ini",
      type: "quiz",
    },
  ]

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setJilidId(resolvedParams.jilidId)
      setLetterId(resolvedParams.letterId)
      await fetchLetterData(resolvedParams.letterId)
    }
    initializeParams()
  }, [params])

  const fetchLetterData = async (letterIdParam: string) => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Get letter details
      const { data: letterData } = await supabase.from("hijaiyah").select("*").eq("hijaiyah_id", letterIdParam).single()

      if (letterData) {
        setLetter(letterData)
      }

      // Get user progress for this letter
      const { data: user } = await supabase.auth.getUser()
      if (user.user) {
        const { data: progressData } = await supabase
          .from("user_practice_progress")
          .select("*")
          .eq("user_id", user.user.id)
          .eq("hijaiyah_id", letterIdParam)
          .single()

        if (progressData) {
          setPracticeAttempts(progressData.attempts)
          if (progressData.status === "selesai") {
            setProgress(100)
            setCurrentStep(learningSteps.length - 1)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching letter data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProgress = async () => {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()

    if (user.user && letter) {
      const newAttempts = practiceAttempts + 1
      const isCompleted = currentStep === learningSteps.length - 1
      const status = isCompleted ? "selesai" : "belajar"

      await supabase.from("user_practice_progress").upsert({
        user_id: user.user.id,
        hijaiyah_id: letter.hijaiyah_id,
        status,
        attempts: newAttempts,
        last_update: new Date().toISOString(),
      })

      setPracticeAttempts(newAttempts)
      if (isCompleted) {
        setShowSuccess(true)
        setProgress(100)
      }
    }
  }

  const handleNextStep = () => {
    if (currentStep < learningSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setProgress(((currentStep + 1) / learningSteps.length) * 100)
      updateProgress()
    } else {
      updateProgress()
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setProgress((currentStep / learningSteps.length) * 100)
    }
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setProgress(0)
    setShowSuccess(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D5DBDB" }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#147E7E" }}
          ></div>
          <p className="text-gray-600">Memuat materi pembelajaran...</p>
        </div>
      </div>
    )
  }

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D5DBDB" }}>
        <div className="text-center">
          <p className="text-gray-600">Huruf tidak ditemukan</p>
          <Link href={`/dashboard/murid/learn/${jilidId}`}>
            <Button className="mt-4 text-white" style={{ backgroundColor: "#147E7E" }}>
              Kembali
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentStepData = learningSteps[currentStep]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/murid/learn/${jilidId}`}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Belajar Huruf {letter.latin_name}</h1>
              <p className="text-sm text-gray-200">{currentStepData.title}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-200">
              Langkah {currentStep + 1} dari {learningSteps.length}
            </div>
            <div className="text-xs text-gray-300">Latihan ke-{practiceAttempts + 1}</div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Progress Pembelajaran
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Success Message */}
        {showSuccess && (
          <Card className="border-0 shadow-lg mb-6 bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-bold text-green-800 mb-2">Selamat!</h3>
              <p className="text-green-700 mb-4">Anda telah menyelesaikan pembelajaran huruf {letter.latin_name}</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={handleRestart} variant="outline" className="bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Ulangi
                </Button>
                <Link href={`/dashboard/murid/learn/${jilidId}`}>
                  <Button className="text-white" style={{ backgroundColor: "#147E7E" }}>
                    Lanjut ke Huruf Berikutnya
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: "#2C3E50" }}>{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Letter Display */}
                <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-8xl font-bold mb-4" style={{ color: "#147E7E" }}>
                    {letter.arabic_char}
                  </div>
                  <div className="text-2xl font-semibold mb-2" style={{ color: "#2C3E50" }}>
                    {letter.latin_name}
                  </div>
                  <Badge className="text-sm px-3 py-1" style={{ backgroundColor: "#F1C40F", color: "#2C3E50" }}>
                    Huruf ke-{letter.ordinal}
                  </Badge>
                </div>

                {/* Step Content */}
                {currentStepData.type === "introduction" && (
                  <div className="space-y-4">
                    <h4 className="font-semibold" style={{ color: "#2C3E50" }}>
                      Tentang Huruf {letter.latin_name}
                    </h4>
                    <p className="text-gray-600">
                      Huruf {letter.latin_name} ({letter.arabic_char}) adalah huruf ke-{letter.ordinal} dalam abjad
                      hijaiyah. Huruf ini memiliki bentuk yang unik dan mudah dikenali.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Tips Belajar:</h5>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Perhatikan bentuk huruf dengan seksama</li>
                        <li>Ingat nama latin: {letter.latin_name}</li>
                        <li>Latih pengenalan huruf berulang kali</li>
                      </ul>
                    </div>
                  </div>
                )}

                {currentStepData.type === "practice" && (
                  <div className="space-y-4">
                    <h4 className="font-semibold" style={{ color: "#2C3E50" }}>
                      Latihan Pengenalan
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#147E7E] transition-colors"
                        >
                          <span className="text-3xl" style={{ color: "#147E7E" }}>
                            {i === 1 ? letter.arabic_char : "؟"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Klik pada huruf {letter.latin_name} yang benar!</p>
                  </div>
                )}

                {currentStepData.type === "quiz" && (
                  <div className="space-y-4">
                    <h4 className="font-semibold" style={{ color: "#2C3E50" }}>
                      Kuis Pemahaman
                    </h4>
                    <div className="bg-yellow-50 p-6 rounded-lg text-center">
                      <p className="text-lg mb-4" style={{ color: "#2C3E50" }}>
                        Huruf apakah ini?
                      </p>
                      <div className="text-6xl font-bold mb-6" style={{ color: "#147E7E" }}>
                        {letter.arabic_char}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {["Alif", "Ba", letter.latin_name, "Ta"].map((option, index) => (
                          <Button
                            key={index}
                            variant={option === letter.latin_name ? "default" : "outline"}
                            className={option === letter.latin_name ? "text-white" : "bg-transparent"}
                            style={option === letter.latin_name ? { backgroundColor: "#147E7E" } : undefined}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    disabled={currentStep === 0}
                    className="bg-transparent"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Sebelumnya
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="text-white"
                    style={{ backgroundColor: "#147E7E" }}
                    disabled={showSuccess}
                  >
                    {currentStep === learningSteps.length - 1 ? "Selesai" : "Selanjutnya"}
                    {currentStep < learningSteps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Letter Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#2C3E50" }}>
                  Info Huruf
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: "#147E7E" }}>
                    {letter.arabic_char}
                  </div>
                  <div className="text-lg font-semibold" style={{ color: "#2C3E50" }}>
                    {letter.latin_name}
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Urutan:</span>
                    <span className="font-medium">Ke-{letter.ordinal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latihan:</span>
                    <span className="font-medium">{practiceAttempts} kali</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Steps */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#2C3E50" }}>
                  Langkah Pembelajaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg ${
                        index === currentStep
                          ? "bg-blue-50 border border-blue-200"
                          : index < currentStep
                            ? "bg-green-50"
                            : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === currentStep
                            ? "bg-blue-500 text-white"
                            : index < currentStep
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {index < currentStep ? <CheckCircle className="h-3 w-3" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
