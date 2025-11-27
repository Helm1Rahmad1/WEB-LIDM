import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, TrendingUp, Users, CheckCircle, XCircle, Target, Sparkles, Trophy } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 backdrop-blur-lg bg-white/80 shadow-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/guru/rooms/${roomId}`}>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="group font-semibold px-6 py-3 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent">
                    Hasil Tes - {room.name}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium mt-1">Pantau hasil tes murid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="group border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Total Tes
              </CardTitle>
              <div className="p-2 rounded-xl bg-teal-100">
                <Award className="h-5 w-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent className="relative px-6 pb-6">
              <div className="text-3xl font-black text-gray-900">
                {totalTests}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">Tes telah dilakukan</p>
            </CardContent>
          </Card>

          <Card className="group border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Tes Lulus
              </CardTitle>
              <div className="p-2 rounded-xl bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative px-6 pb-6">
              <div className="text-3xl font-black text-gray-900">
                {passedTests}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-green-600">
                  {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Rata-rata Nilai
              </CardTitle>
              <div className="p-2 rounded-xl bg-yellow-100">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="relative px-6 pb-6">
              <div className="text-3xl font-black text-gray-900">
                {averageScore}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">dari 100</p>
            </CardContent>
          </Card>

          <Card className="group border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Murid Aktif
              </CardTitle>
              <div className="p-2 rounded-xl bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative px-6 pb-6">
              <div className="text-3xl font-black text-gray-900">
                {students?.length || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">Terdaftar di kelas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Student Performance */}
          <Card className="border-0 bg-white shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-yellow-50 p-8 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Performa Murid</CardTitle>
                  <CardDescription className="text-gray-600 text-base mt-1">Ringkasan hasil tes per murid</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {studentResults && studentResults.length > 0 ? (
                <div className="space-y-4">
                  {studentResults.map((student, index) => (
                    <Card key={student.enrollment_id} className="group border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {student.users?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-600 transition-colors duration-300">
                                {student.users?.name}
                              </h3>
                              <p className="text-sm text-gray-500 font-medium">{student.users?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge
                                variant={student.passedCount > 0 ? "default" : "secondary"}
                                className={`${
                                  student.passedCount > 0 
                                    ? "bg-green-100 text-green-800 border-green-300" 
                                    : "bg-gray-100 text-gray-600 border-gray-300"
                                } border-2 font-bold px-3 py-1`}
                              >
                                <Trophy className="h-3 w-3 mr-1" />
                                {student.passedCount} Lulus
                              </Badge>
                              <span className="text-sm text-gray-500 font-medium">dari {student.testsCount} tes</span>
                            </div>
                            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg">
                              <Sparkles className="h-4 w-4 text-white" />
                              <span className="text-lg font-black text-white">{student.averageScore}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto mb-6 p-6 rounded-3xl bg-gradient-to-br from-teal-50 to-yellow-50 w-fit">
                    <Users className="h-16 w-16 mx-auto text-teal-600" />
                  </div>
                  <p className="text-gray-500 font-semibold text-lg">Belum ada murid yang mengikuti tes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Test Results */}
          <Card className="border-0 bg-white shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-50 via-white to-teal-50 p-8 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Hasil Tes Terbaru</CardTitle>
                  <CardDescription className="text-gray-600 text-base mt-1">Tes yang baru saja diselesaikan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {testResults && testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.slice(0, 10).map((test, index) => (
                    <div 
                      key={test.test_id} 
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          {test.hijaiyah?.arabic_char}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-300">
                            {test.users?.name}
                          </p>
                          <p className="text-sm text-gray-500 font-medium">
                            Tes {test.hijaiyah?.latin_name} • {new Date(test.tested_at).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-3">
                        <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
                          <div className="text-xl font-black text-white">{test.score}</div>
                        </div>
                        <Badge
                          variant={test.status === "lulus" ? "default" : "secondary"}
                          className={`${
                            test.status === "lulus" 
                              ? "bg-green-100 text-green-800 border-green-300" 
                              : "bg-red-100 text-red-800 border-red-300"
                          } border-2 font-bold px-3 py-1.5`}
                        >
                          {test.status === "lulus" ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          {test.status === "lulus" ? "Lulus" : "Belum Lulus"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto mb-6 p-6 rounded-3xl bg-gradient-to-br from-yellow-50 to-teal-50 w-fit">
                    <Award className="h-16 w-16 mx-auto text-yellow-600" />
                  </div>
                  <p className="text-gray-500 font-semibold text-lg">Belum ada hasil tes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}