"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, CheckCircle, XCircle, Award } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ letterId: string }>
}

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  type: "recognition" | "selection" | "matching"
}

interface Letter {
  hijaiyah_id: number
  latin_name: string
  arabic_char: string
}

export default function TakeTestPage({ params }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get("room")

  const [letterId, setLetterId] = useState<string>("")
  const [letter, setLetter] = useState<Letter | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isLoading, setIsLoading] = useState(true)
  const [testCompleted, setTestCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [testStatus, setTestStatus] = useState<"lulus" | "belum_lulus">("belum_lulus")

  useEffect(() => {
    const initializeTest = async () => {
      const resolvedParams = await params
      setLetterId(resolvedParams.letterId)
      await fetchLetterAndGenerateQuestions(resolvedParams.letterId)
    }
    initializeTest()
  }, [params])

  useEffect(() => {
    if (timeLeft > 0 && !testCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !testCompleted) {
      handleSubmitTest()
    }
  }, [timeLeft, testCompleted])

  const fetchLetterAndGenerateQuestions = async (letterIdParam: string) => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Get letter details
      const { data: letterData } = await supabase.from("hijaiyah").select("*").eq("hijaiyah_id", letterIdParam).single()

      if (letterData) {
        setLetter(letterData)
        generateQuestions(letterData)
      }
    } catch (error) {
      console.error("Error fetching letter data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateQuestions = (letterData: Letter) => {
    // Generate random questions for the test
    const allLetters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر"]
    const otherLetters = allLetters.filter((l) => l !== letterData.arabic_char)

    const generatedQuestions: Question[] = [
      {
        id: 1,
        question: `Huruf apakah ini: ${letterData.arabic_char}?`,
        options: [letterData.latin_name, "Ba", "Ta", "Tsa"].sort(() => Math.random() - 0.5),
        correctAnswer: 0, // Will be adjusted after sorting
        type: "recognition",
      },
      {
        id: 2,
        question: `Pilih huruf ${letterData.latin_name}:`,
        options: [letterData.arabic_char, ...otherLetters.slice(0, 3)].sort(() => Math.random() - 0.5),
        correctAnswer: 0, // Will be adjusted after sorting
        type: "selection",
      },
      {
        id: 3,
        question: `Manakah yang merupakan huruf ${letterData.latin_name}?`,
        options: [letterData.arabic_char, ...otherLetters.slice(3, 6)].sort(() => Math.random() - 0.5),
        correctAnswer: 0, // Will be adjusted after sorting
        type: "selection",
      },
      {
        id: 4,
        question: `Huruf ${letterData.arabic_char} dibaca:`,
        options: [letterData.latin_name, "Ba", "Ta", "Jim"].sort(() => Math.random() - 0.5),
        correctAnswer: 0, // Will be adjusted after sorting
        type: "recognition",
      },
      {
        id: 5,
        question: `Pilih huruf yang BUKAN ${letterData.latin_name}:`,
        options: otherLetters.slice(0, 4),
        correctAnswer: 0, // Any option is correct since none is the target letter
        type: "selection",
      },
    ]

    // Adjust correct answers after shuffling
    generatedQuestions.forEach((q) => {
      if (q.type === "recognition") {
        q.correctAnswer = q.options.indexOf(letterData.latin_name)
      } else if (q.type === "selection" && q.id !== 5) {
        q.correctAnswer = q.options.indexOf(letterData.arabic_char)
      }
    })

    setQuestions(generatedQuestions)
    setAnswers(new Array(generatedQuestions.length).fill(-1))
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmitTest()
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (!letter || !roomId) return

    // Calculate score
    let correctAnswers = 0
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++
      }
    })

    const finalScore = Math.round((correctAnswers / questions.length) * 100)
    const status = finalScore >= 70 ? "lulus" : "belum_lulus"

    setScore(finalScore)
    setTestStatus(status)
    setTestCompleted(true)

    // Save test result
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()

    if (user.user) {
      await supabase.from("letter_tests").insert({
        user_id: user.user.id,
        room_id: Number.parseInt(roomId),
        hijaiyah_id: letter.hijaiyah_id,
        score: finalScore,
        status,
        tested_at: new Date().toISOString(),
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D5DBDB" }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#147E7E" }}
          ></div>
          <p className="text-gray-600">Mempersiapkan tes...</p>
        </div>
      </div>
    )
  }

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#D5DBDB" }}>
        <div className="text-center">
          <p className="text-gray-600">Tes tidak ditemukan</p>
          <Link href="/dashboard/murid/tests">
            <Button className="mt-4 text-white" style={{ backgroundColor: "#147E7E" }}>
              Kembali
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (testCompleted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
        <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
          <div className="max-w-4xl mx-auto flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-white" />
              <h1 className="text-xl font-bold text-white">Hasil Tes</h1>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                {testStatus === "lulus" ? (
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
                )}
                <h2 className="text-2xl font-bold mb-2" style={{ color: "#2C3E50" }}>
                  {testStatus === "lulus" ? "Selamat!" : "Belum Berhasil"}
                </h2>
                <p className="text-gray-600">
                  {testStatus === "lulus"
                    ? `Anda lulus tes huruf ${letter.latin_name}!`
                    : `Anda belum lulus tes huruf ${letter.latin_name}`}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="text-4xl font-bold mb-2" style={{ color: "#2C3E50" }}>
                  {score}
                </div>
                <div className="text-sm text-gray-600">dari 100</div>
                <Badge
                  className={`mt-2 ${testStatus === "lulus" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {testStatus === "lulus" ? "LULUS" : "BELUM LULUS"}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 mb-6">
                <p>
                  Jawaban benar: {Math.round((score / 100) * questions.length)} dari {questions.length} soal
                </p>
                <p>Nilai minimum untuk lulus: 70</p>
              </div>

              <div className="flex space-x-4">
                <Link href="/dashboard/murid/tests" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Kembali ke Tes
                  </Button>
                </Link>
                {testStatus === "belum_lulus" && (
                  <Button
                    onClick={() => window.location.reload()}
                    className="flex-1 text-white"
                    style={{ backgroundColor: "#147E7E" }}
                  >
                    Ulangi Tes
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/murid/tests">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Tes Huruf {letter.latin_name}</h1>
              <p className="text-sm text-gray-200">
                Soal {currentQuestion + 1} dari {questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Progress */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: "#2C3E50" }}>Soal {currentQuestion + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: "#2C3E50" }}>
                {currentQ?.question}
              </h3>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {currentQ?.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    variant={answers[currentQuestion] === index ? "default" : "outline"}
                    className={`h-16 text-lg ${answers[currentQuestion] === index ? "text-white" : "bg-transparent"}`}
                    style={
                      answers[currentQuestion] === index ? { backgroundColor: "#147E7E" } : { borderColor: "#147E7E" }
                    }
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                onClick={handlePrevQuestion}
                variant="outline"
                disabled={currentQuestion === 0}
                className="bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sebelumnya
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={answers[currentQuestion] === -1}
                className="text-white"
                style={{ backgroundColor: "#147E7E" }}
              >
                {currentQuestion === questions.length - 1 ? "Selesai" : "Selanjutnya"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
