import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Mail, Calendar, TrendingUp, Award, Target, BarChart3, Sparkles, User, ArrowRight, Trophy, BookOpen, Clock } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function RoomStudentsPage({ params }: Props) {
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

  // Get students with their progress
  const { data, error: roomsError } = await supabase.from("rooms").select("*")

  const { data: students, error: studentsError } = await supabase
    .from("enrollments")
    .select("*, user_id, room_id")
    .eq("room_id", roomId)

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
                  <Users className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Murid - {room.name}</h1>
                    <div className="px-3 py-1 rounded-full bg-[#F1C40F]/20 border border-[#F1C40F]/30">
                      <Sparkles className="h-4 w-4 text-[#F1C40F]" />
                    </div>
                  </div>
                  <p className="text-base text-white/90 font-medium">{students?.length || 0} murid terdaftar di kelas</p>
                  <p className="text-sm text-white/70 mt-1">Pantau progres dan performa setiap murid</p>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Display */}
            <div className="flex items-center space-x-6">
              <div className="text-center p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-white">{students?.length || 0}</div>
                <div className="text-sm text-white/80 font-medium">Total Murid</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-[#F1C40F]">{room.code}</div>
                <div className="text-sm text-white/80 font-medium">Kode Kelas</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
        {/* Main Students List Card */}
        <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 p-10 border-b border-[#D5DBDB]/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-[#147E7E]/10">
                <Users className="h-8 w-8 text-[#147E7E]" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-[#2C3E50]">Daftar Murid</CardTitle>
                <CardDescription className="text-[#2C3E50]/70 text-lg">
                  Pantau progres dan aktivitas setiap murid di kelas ini secara detail
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            {students && students.length > 0 ? (
              <div className="space-y-6">
                {students.map((enrollment) => {
                  const completedProgress =
                    enrollment.user_letter_progress?.filter((p) => p.status === "selesai").length || 0
                  const totalProgress = enrollment.user_letter_progress?.length || 0
                  const completedTests = enrollment.letter_tests?.filter((t) => t.status === "lulus").length || 0
                  const averageScore = enrollment.letter_tests?.length
                    ? Math.round(
                        enrollment.letter_tests.reduce((sum, test) => sum + test.score, 0) /
                          enrollment.letter_tests.length,
                      )
                    : 0

                  return (
                    <Card key={enrollment.enrollment_id} className="group relative overflow-hidden border-2 border-[#D5DBDB]/30 bg-white hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-2 hover:border-[#147E7E]/30">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#147E7E]/3 via-transparent to-[#F1C40F]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="relative p-8">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Student Header */}
                            <div className="flex items-center space-x-4 mb-6">
                              <div className="relative">
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                 
                                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F1C40F]/10 border border-[#F1C40F]/20">
                                    <Calendar className="h-4 w-4 text-[#F1C40F]" />
                                    <span className="text-[#2C3E50] font-medium">
                                      Bergabung {new Date(enrollment.joined_at).toLocaleDateString("id-ID")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Stats Grid */}
                            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Progress Huruf Card */}
                              <div className="group/stat relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border-2 border-blue-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <span className="text-sm font-bold text-blue-900 uppercase tracking-wide">Progress Huruf</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="text-3xl font-black text-blue-900">
                                      {completedProgress}/{totalProgress}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex-1 bg-blue-200 rounded-full h-3 overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                          style={{ width: `${totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-bold text-blue-700">
                                        {totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Tes Lulus Card */}
                              <div className="group/stat relative overflow-hidden p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border-2 border-green-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <Trophy className="h-5 w-5 text-green-600" />
                                      </div>
                                      <span className="text-sm font-bold text-green-900 uppercase tracking-wide">Tes Lulus</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="text-3xl font-black text-green-900">{completedTests}</div>
                                    <div className="flex items-center space-x-2">
                                      <Award className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700">tes berhasil diselesaikan</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Rata-rata Nilai Card */}
                              <div className="group/stat relative overflow-hidden p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl border-2 border-yellow-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                        <BarChart3 className="h-5 w-5 text-yellow-600" />
                                      </div>
                                      <span className="text-sm font-bold text-yellow-900 uppercase tracking-wide">Rata-rata Nilai</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="text-3xl font-black text-yellow-900">{averageScore}</div>
                                    <div className="flex items-center space-x-2">
                                      <Target className="h-4 w-4 text-yellow-600" />
                                      <span className="text-sm font-medium text-yellow-700">dari 100 poin maksimal</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="ml-8 flex flex-col space-y-4">
                            <Link href={`/dashboard/guru/rooms/${roomId}/students/${enrollment.user_id}`}>
                              <Button className="group relative overflow-hidden font-bold px-8 py-4 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-xl text-lg">
                                <User className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                <span>Lihat Detail</span>
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                              </Button>
                            </Link>
                            
                            {/* Quick Stats Badge */}
                            <div className="text-center p-3 rounded-xl bg-[#F1C40F]/10 border border-[#F1C40F]/20">
                              <div className="text-lg font-bold text-[#F1C40F]">
                                {totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}%
                              </div>
                              <div className="text-xs text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Kemajuan</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto mb-8 p-8 rounded-3xl bg-[#D5DBDB]/20 w-fit">
                  <Users className="h-20 w-20 mx-auto text-[#2C3E50]/30" />
                </div>
                <h3 className="text-3xl font-bold text-[#2C3E50] mb-4">Belum ada murid</h3>
                <p className="text-[#2C3E50]/60 mb-10 text-xl max-w-lg mx-auto leading-relaxed">
                  Bagikan kode kelas kepada murid untuk bergabung dan memulai pembelajaran
                </p>
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-lg font-semibold text-[#2C3E50]">Kode Kelas:</span>
                    <Badge className="text-2xl font-mono px-6 py-3 bg-[#147E7E]/10 text-[#147E7E] border-2 border-[#147E7E]/30 hover:bg-[#147E7E]/20 transition-colors duration-300">
                      {room.code}
                    </Badge>
                  </div>
                  <Button className="group relative overflow-hidden font-bold px-10 py-5 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-2xl text-xl">
                    <BookOpen className="h-7 w-7 mr-3 group-hover:rotate-12 transition-transform duration-500" />
                    <span>Panduan Bergabung</span>
                    <Sparkles className="h-6 w-6 ml-3 group-hover:rotate-12 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}