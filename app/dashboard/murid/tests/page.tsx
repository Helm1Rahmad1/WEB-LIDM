import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default async function TestsPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  // Get student's enrolled classes
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      rooms(name, code)
    `)
    .eq("user_id", user.user.id)

  // Get available letters for testing (completed learning)
  const { data: completedLetters } = await supabase
    .from("user_practice_progress")
    .select(`
      *,
      hijaiyah(latin_name, arabic_char)
    `)
    .eq("user_id", user.user.id)
    .eq("status", "selesai")

  // Get test history
  const { data: testHistory } = await supabase
    .from("letter_tests")
    .select(`
      *,
      hijaiyah(latin_name, arabic_char),
      rooms(name)
    `)
    .eq("user_id", user.user.id)
    .order("tested_at", { ascending: false })

  const passedTests = testHistory?.filter((t) => t.status === "lulus").length || 0
  const averageScore = testHistory?.length
    ? Math.round(testHistory.reduce((sum, test) => sum + test.score, 0) / testHistory.length)
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
            <Award className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Tes Huruf Hijaiyah</h1>
              <p className="text-sm text-gray-200">Uji kemampuan Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Tes Lulus
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {passedTests}
              </div>
              <p className="text-xs text-gray-500">dari {testHistory?.length || 0} tes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Rata-rata Nilai
              </CardTitle>
              <Award className="h-4 w-4" style={{ color: "#147E7E" }} />
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
                Siap Tes
              </CardTitle>
              <Clock className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {completedLetters?.length || 0}
              </div>
              <p className="text-xs text-gray-500">huruf tersedia</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Available Tests */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#2C3E50" }}>Tes Tersedia</CardTitle>
              <CardDescription>Huruf yang sudah selesai dipelajari dan siap untuk diuji</CardDescription>
            </CardHeader>
            <CardContent>
              {completedLetters && completedLetters.length > 0 ? (
                <div className="space-y-4">
                  {completedLetters.map((letter) => {
                    const lastTest = testHistory?.find((t) => t.hijaiyah_id === letter.hijaiyah_id)
                    const canRetake = !lastTest || lastTest.status === "belum_lulus"

                    return (
                      <Card key={letter.practice_id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                style={{ backgroundColor: "#147E7E" }}
                              >
                                {letter.hijaiyah?.arabic_char}
                              </div>
                              <div>
                                <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
                                  Tes Huruf {letter.hijaiyah?.latin_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {lastTest
                                    ? `Nilai terakhir: ${lastTest.score} (${lastTest.status === "lulus" ? "Lulus" : "Belum Lulus"})`
                                    : "Belum pernah tes"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {lastTest && lastTest.status === "lulus" && (
                                <Badge className="bg-green-100 text-green-800">Lulus</Badge>
                              )}
                              {enrollments && enrollments.length > 0 && (
                                <Link
                                  href={`/dashboard/murid/tests/take/${letter.hijaiyah_id}?room=${enrollments[0].room_id}`}
                                >
                                  <Button
                                    size="sm"
                                    className="text-white"
                                    style={{ backgroundColor: canRetake ? "#147E7E" : "#F1C40F" }}
                                  >
                                    {canRetake ? "Mulai Tes" : "Ulangi Tes"}
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada tes tersedia</h3>
                  <p className="text-gray-500">Selesaikan pembelajaran huruf terlebih dahulu</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test History */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#2C3E50" }}>Riwayat Tes</CardTitle>
              <CardDescription>Hasil tes yang pernah Anda ikuti</CardDescription>
            </CardHeader>
            <CardContent>
              {testHistory && testHistory.length > 0 ? (
                <div className="space-y-4">
                  {testHistory.slice(0, 10).map((test) => (
                    <div key={test.test_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
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
                          className={
                            test.status === "lulus" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {test.status === "lulus" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {test.status === "lulus" ? "Lulus" : "Belum Lulus"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Belum ada riwayat tes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
