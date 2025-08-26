import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Award, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"

export default async function ProgressPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  // Get student's progress
  const { data: letterProgress } = await supabase
    .from("user_practice_progress")
    .select(`
      *,
      hijaiyah(latin_name, arabic_char)
    `)
    .eq("user_id", user.user.id)
    .order("last_update", { ascending: false })

  // Get student's test results
  const { data: testResults } = await supabase
    .from("letter_tests")
    .select(`
      *,
      hijaiyah(latin_name, arabic_char),
      rooms(name)
    `)
    .eq("user_id", user.user.id)
    .order("tested_at", { ascending: false })

  // Get enrolled classes
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      rooms(name, code)
    `)
    .eq("user_id", user.user.id)

  const totalProgress = letterProgress?.length || 0
  const completedProgress = letterProgress?.filter((p) => p.status === "selesai").length || 0
  const completedTests = testResults?.filter((t) => t.status === "lulus").length || 0
  const averageScore = testResults?.length
    ? Math.round(testResults.reduce((sum, test) => sum + test.score, 0) / testResults.length)
    : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/dashboard/murid">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Progress Pembelajaran</h1>
              <p className="text-sm text-gray-200">Pantau kemajuan belajar Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Progress Huruf
              </CardTitle>
              <BookOpen className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {completedProgress}/{totalProgress}
              </div>
              <p className="text-xs text-gray-500">
                {totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}% selesai
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Tes Lulus
              </CardTitle>
              <Award className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {completedTests}
              </div>
              <p className="text-xs text-gray-500">dari {testResults?.length || 0} tes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Rata-rata Nilai
              </CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {averageScore}
              </div>
              <p className="text-xs text-gray-500">dari 100</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Kelas Diikuti
              </CardTitle>
              <Calendar className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {enrollments?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Letter Progress */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#2C3E50" }}>Progress Huruf Hijaiyah</CardTitle>
              <CardDescription>Kemajuan pembelajaran per huruf</CardDescription>
            </CardHeader>
            <CardContent>
              {letterProgress && letterProgress.length > 0 ? (
                <div className="space-y-4">
                  {letterProgress.slice(0, 10).map((progress) => (
                    <div
                      key={progress.practice_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: "#147E7E" }}
                        >
                          {progress.hijaiyah?.arabic_char}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: "#2C3E50" }}>
                            {progress.hijaiyah?.latin_name}
                          </p>
                          <p className="text-sm text-gray-500">{progress.attempts} kali latihan</p>
                        </div>
                      </div>
                      <Badge
                        variant={progress.status === "selesai" ? "default" : "secondary"}
                        style={
                          progress.status === "selesai" ? { backgroundColor: "#F1C40F", color: "#2C3E50" } : undefined
                        }
                      >
                        {progress.status === "selesai" ? "Selesai" : "Belajar"}
                      </Badge>
                    </div>
                  ))}
                  {letterProgress.length > 10 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">Dan {letterProgress.length - 10} huruf lainnya...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Belum ada progress pembelajaran</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#2C3E50" }}>Hasil Tes Terbaru</CardTitle>
              <CardDescription>Riwayat tes dan nilai yang diperoleh</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults && testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.slice(0, 10).map((test) => (
                    <div key={test.test_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: "#147E7E" }}
                        >
                          {test.hijaiyah?.arabic_char}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: "#2C3E50" }}>
                            {test.hijaiyah?.latin_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {test.rooms?.name} • {new Date(test.tested_at).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: "#2C3E50" }}>
                          {test.score}
                        </div>
                        <Badge
                          variant={test.status === "lulus" ? "default" : "secondary"}
                          style={test.status === "lulus" ? { backgroundColor: "#F1C40F", color: "#2C3E50" } : undefined}
                        >
                          {test.status === "lulus" ? "Lulus" : "Belum Lulus"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {testResults.length > 10 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">Dan {testResults.length - 10} tes lainnya...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Belum ada hasil tes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
