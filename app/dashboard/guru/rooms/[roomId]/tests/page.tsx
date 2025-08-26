import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, TrendingUp, Users, CheckCircle, XCircle, Trophy, Target, BarChart3, Sparkles, BookOpen, Clock, Star } from "lucide-react"
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
  const failedTests = totalTests - passedTests
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
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#147E7E]/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-[#F1C40F]/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#2C3E50]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-[#147E7E]/6 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header with Glass Effect */}
      <header className="relative z-20 backdrop-blur-lg bg-gradient-to-r from-[#147E7E] to-[#147E7E]/90 shadow-2xl border-b border-white/10">
        <div className="absolute inset-0 bg-[#147E7E]/10 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Enhanced Navigation and Title Section */}
            <div className="flex items-center space-x-6">
              <Link href={`/dashboard/guru/rooms/${roomId}`}>
                <Button className="group relative overflow-hidden font-semibold px-6 py-3 rounded-xl border-2 border-white/40 text-white bg-white/10 hover:bg-white hover:text-[#147E7E] backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span>Kembali ke Detail</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 group hover:scale-110 transition-transform duration-300">
                  <Award className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Hasil Tes - {room.name}</h1>
                    <div className="px-3 py-1 rounded-full bg-[#F1C40F]/20 border border-[#F1C40F]/30">
                      <Trophy className="h-4 w-4 text-[#F1C40F]" />
                    </div>
                  </div>
                  <p className="text-base text-white/90 font-medium">Pantau performa dan hasil tes murid</p>
                  <p className="text-sm text-white/70 mt-1">{totalTests} total tes • {students?.length || 0} murid terdaftar</p>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-white">{passedTests}</div>
                <div className="text-sm text-white/80 font-medium">Tes Lulus</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-[#F1C40F]">{averageScore}</div>
                <div className="text-sm text-white/80 font-medium">Rata-rata</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
        {/* Enhanced Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Tests Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-[#2C3E50] uppercase tracking-wide">Total Tes</CardTitle>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-[#2C3E50] mb-2">{totalTests}</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-blue-200 rounded-full h-2">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-full"></div>
                </div>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Passed Tests Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-[#2C3E50] uppercase tracking-wide">Tes Lulus</CardTitle>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-[#2C3E50] mb-2">{passedTests}</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-green-200 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-[#2C3E50] uppercase tracking-wide">Rata-rata Nilai</CardTitle>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-[#2C3E50] mb-2">{averageScore}</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-yellow-200 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-500"
                    style={{ width: `${averageScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-yellow-600">dari 100</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Students Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-[#2C3E50] uppercase tracking-wide">Murid Aktif</CardTitle>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-[#2C3E50] mb-2">{students?.length || 0}</div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-600">murid terdaftar</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Student Performance */}
          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 p-8 border-b border-[#D5DBDB]/20">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-[#147E7E]/10">
                  <Users className="h-8 w-8 text-[#147E7E]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#2C3E50]">Performa Murid</CardTitle>
                  <CardDescription className="text-[#2C3E50]/70 text-base">
                    Ringkasan hasil tes per murid
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {studentResults && studentResults.length > 0 ? (
                <div className="space-y-6">
                  {studentResults.map((student) => (
                    <Card key={student.enrollment_id} className="group relative overflow-hidden border-2 border-[#D5DBDB]/30 bg-white hover:shadow-xl transition-all duration-500 rounded-2xl hover:-translate-y-1 hover:border-[#147E7E]/30">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#147E7E]/3 via-transparent to-[#F1C40F]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                              style={{ backgroundColor: "#147E7E" }}
                            >
                              {student.users?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                                {student.users?.name}
                              </h3>
                              <p className="text-sm text-gray-500">{student.users?.email}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="flex items-center space-x-3">
                              <Badge
                                variant={student.passedCount > 0 ? "default" : "secondary"}
                                className={`px-3 py-1 rounded-full font-semibold text-sm ${
                                  student.passedCount > 0 ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
                                }`}
                              >
                                <Trophy className="h-3 w-3 mr-1" />
                                {student.passedCount} Lulus
                              </Badge>
                              <span className="text-sm text-gray-500 font-medium">dari {student.testsCount} tes</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-[#147E7E]" />
                              <span className="text-lg font-bold text-[#2C3E50]">
                                Rata-rata: {student.averageScore}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto mb-6 p-6 rounded-3xl bg-[#D5DBDB]/20 w-fit">
                    <Users className="h-16 w-16 mx-auto text-[#2C3E50]/30" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">Belum ada murid yang mengikuti tes</h3>
                  <p className="text-[#2C3E50]/60 text-lg">Murid perlu bergabung dan mengikuti tes terlebih dahulu</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Recent Test Results */}
          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 p-8 border-b border-[#D5DBDB]/20">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-[#147E7E]/10">
                  <Award className="h-8 w-8 text-[#147E7E]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#2C3E50]">Hasil Tes Terbaru</CardTitle>
                  <CardDescription className="text-[#2C3E50]/70 text-base">
                    Tes yang baru saja diselesaikan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {testResults && testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.slice(0, 10).map((test) => (
                    <div key={test.test_id} className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border-2 border-gray-200/50 hover:shadow-xl hover:border-[#147E7E]/30 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: "#147E7E" }}
                        >
                          {test.hijaiyah?.arabic_char}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                            {test.users?.name}
                          </p>
                          <p className="text-sm text-gray-500 font-medium">
                            Tes {test.hijaiyah?.latin_name} • {new Date(test.tested_at).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-black text-[#2C3E50]">
                          {test.score}
                        </div>
                        <Badge
                          variant={test.status === "lulus" ? "default" : "secondary"}
                          className={`px-3 py-1 rounded-full font-semibold ${
                            test.status === "lulus" 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
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
                <div className="text-center py-12">
                  <div className="mx-auto mb-6 p-6 rounded-3xl bg-[#D5DBDB]/20 w-fit">
                    <Award className="h-16 w-16 mx-auto text-[#2C3E50]/30" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">Belum ada hasil tes</h3>
                  <p className="text-[#2C3E50]/60 text-lg">Hasil tes akan muncul setelah murid menyelesaikan tes</p>
                  <div className="mt-8">
                    <Button className="group relative overflow-hidden font-bold px-8 py-4 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-xl text-lg">
                      <Sparkles className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Mulai Tes Pertama</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}