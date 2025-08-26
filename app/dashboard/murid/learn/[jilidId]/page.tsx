import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, Play, CheckCircle, Lock } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ jilidId: string }>
}

export default async function JilidDetailPage({ params }: Props) {
  const { jilidId } = await params
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  // Get jilid details with letters
  const { data: jilid } = await supabase
    .from("jilid")
    .select(`
      *,
      jilid_letters(
        *,
        hijaiyah(*)
      )
    `)
    .eq("jilid_id", jilidId)
    .single()

  if (!jilid) {
    redirect("/dashboard/murid/learn")
  }

  // Get student's progress for this jilid
  const { data: progress } = await supabase
    .from("user_practice_progress")
    .select("*")
    .eq("user_id", user.user.id)
    .in("hijaiyah_id", jilid.jilid_letters?.map((jl) => jl.hijaiyah_id) || [])

  const completedLetters = progress?.filter((p) => p.status === "selesai").length || 0
  const totalLetters = jilid.jilid_letters?.length || 0
  const progressPercentage = totalLetters > 0 ? Math.round((completedLetters / totalLetters) * 100) : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/dashboard/murid/learn">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">{jilid.jilid_name}</h1>
              <p className="text-sm text-gray-200">{jilid.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Progress Overview */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle style={{ color: "#2C3E50" }}>Progress Pembelajaran</CardTitle>
                <CardDescription>
                  {completedLetters} dari {totalLetters} huruf selesai
                </CardDescription>
              </div>
              <Badge
                variant={progressPercentage === 100 ? "default" : "secondary"}
                className="text-lg px-3 py-1"
                style={progressPercentage === 100 ? { backgroundColor: "#F1C40F", color: "#2C3E50" } : undefined}
              >
                {progressPercentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Letters Grid */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: "#2C3E50" }}>Huruf Hijaiyah</CardTitle>
            <CardDescription>Klik huruf untuk mulai belajar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {jilid.jilid_letters
                ?.sort((a, b) => a.sort_order - b.sort_order)
                .map((jilidLetter, index) => {
                  const letterProgress = progress?.find((p) => p.hijaiyah_id === jilidLetter.hijaiyah_id)
                  const isCompleted = letterProgress?.status === "selesai"
                  const isInProgress = letterProgress?.status === "belajar"
                  const isLocked =
                    index > 0 && !progress?.find((p) => p.hijaiyah_id === jilid.jilid_letters?.[index - 1]?.hijaiyah_id)

                  return (
                    <Card
                      key={jilidLetter.id}
                      className={`border-2 transition-all hover:shadow-md ${
                        isCompleted
                          ? "border-green-200 bg-green-50"
                          : isInProgress
                            ? "border-blue-200 bg-blue-50"
                            : isLocked
                              ? "border-gray-200 bg-gray-50"
                              : "border-gray-200 hover:border-[#147E7E]"
                      }`}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="mb-4">
                          <div className="text-4xl font-bold mb-2" style={{ color: isLocked ? "#9CA3AF" : "#2C3E50" }}>
                            {jilidLetter.hijaiyah?.arabic_char}
                          </div>
                          <div className="text-lg font-medium" style={{ color: isLocked ? "#9CA3AF" : "#147E7E" }}>
                            {jilidLetter.hijaiyah?.latin_name}
                          </div>
                        </div>

                        <div className="mb-4">
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selesai
                            </Badge>
                          )}
                          {isInProgress && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              <Play className="h-3 w-3 mr-1" />
                              Sedang Belajar
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                              <Lock className="h-3 w-3 mr-1" />
                              Terkunci
                            </Badge>
                          )}
                        </div>

                        <Link
                          href={isLocked ? "#" : `/dashboard/murid/learn/${jilidId}/letter/${jilidLetter.hijaiyah_id}`}
                        >
                          <Button
                            size="sm"
                            className={`w-full text-white ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                            style={{ backgroundColor: isLocked ? "#9CA3AF" : "#147E7E" }}
                            disabled={isLocked}
                          >
                            {isCompleted ? "Ulangi" : isInProgress ? "Lanjutkan" : "Mulai"}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
