import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, TrendingUp, Users, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function RoomTestsPage({ params }: Props) {
  const { roomId } = await params
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  // Get room details
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("room_id", roomId)
    .eq("created_by", user.user.id)
    .single()

  if (!room) {
    redirect("/dashboard/guru")
  }

  // Get test results for this room
  const { data: testResults } = await supabase
    .from("letter_tests")
    .select(`
      *,
      users(name, email),
      hijaiyah(latin_name, arabic_char)
    `)
    .eq("room_id", roomId)
    .order("tested_at", { ascending: false })

  // Get students in this room
  const { data: students } = await supabase
    .from("enrollments")
    .select(`
      *,
      users(name, email)
    `)
    .eq("room_id", roomId)

  // Calculate statistics
  const totalTests = testResults?.length || 0
  const passedTests = testResults?.filter((t) => t.status === "lulus").length || 0
  const averageScore = testResults?.length
    ? Math.round(testResults.reduce((sum, test) => sum + test.score, 0) / testResults.length)
    : 0

  // Group results by student
  const studentResults = students?.map((student) => {
    const studentTests = testResults?.filter((t) => t.user_id === student.user_id) || []
    const passedCount = studentTests.filter((t) => t.status === "lulus").length
    const avgScore = studentTests.length
      ? Math.round(studentTests.reduce((sum, test) => sum + test.score, 0) / studentTests.length)
      : 0

    return {
      ...student,
      testsCount: studentTests.length,
      passedCount,
      averageScore: avgScore,
      lastTest: studentTests[0],
    }
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href={`/dashboard/guru/rooms/${roomId}`}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <Award className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Hasil Tes - {room.name}</h1>
              <p className="text-sm text-gray-200">Pantau hasil tes murid</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Total Tes
              </CardTitle>
              <Award className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {totalTests}
              </div>
            </CardContent>
          </Card>

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
              <p className="text-xs text-gray-500">
                {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}% tingkat kelulusan
              </p>
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
                Murid Aktif
              </CardTitle>
              <Users className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {students?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Student Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#2C3E50" }}>Performa Murid</CardTitle>
              <CardDescription>Ringkasan hasil tes per murid</CardDescription>
            </CardHeader>
            <CardContent>
              {studentResults && studentResults.length > 0 ? (
                <div className="space-y-4">
                  {studentResults.map((student) => (
                    <Card key={student.enrollment_id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: "#147E7E" }}
                            >
                              {student.users?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold" style={{ color: "#2C3E50" }}>
                                {student.users?.name}
                              </h3>
                              <p className="text-sm text-gray-500">{student.users?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge
                                variant={student.passedCount > 0 ? "default" : "secondary"}
                                className={
                                  student.passedCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                }
                              >
                                {student.passedCount} Lulus
                              </Badge>
                              <span className="text-sm text-gray-500">dari {student.testsCount} tes</span>
                            </div>
                            <div className="text-lg font-bold" style={{ color: "#2C3E50" }}>
                              Rata-rata: {student.averageScore}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Belum ada murid yang mengikuti tes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Test Results */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#2C3E50" }}>Hasil Tes Terbaru</CardTitle>
              <CardDescription>Tes yang baru saja diselesaikan</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults && testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.slice(0, 10).map((test) => (
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
                            {test.users?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Tes {test.hijaiyah?.latin_name} • {new Date(test.tested_at).toLocaleDateString("id-ID")}
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
