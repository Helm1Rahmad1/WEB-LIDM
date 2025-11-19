"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Copy, BookOpen, Award, TrendingUp, Target, BarChart3, Settings, ArrowRight, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"

interface Props {
  params: Promise<{ roomId: string }>
}

export default function RoomDetailPage({ params }: Props) {
  const router = useRouter()
  const [roomId, setRoomId] = useState<string>("")
  const [room, setRoom] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Unwrap params
  useEffect(() => {
    params.then(p => setRoomId(p.roomId))
  }, [params])

  // Fetch room and students data
  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return

      try {
        setLoading(true)
        
        // Fetch room details
        const roomResponse = await apiClient.get(`/api/rooms/${roomId}`)
        console.log('✅ Room data:', roomResponse.data)
        setRoom(roomResponse.data.room)

        // Fetch students in this room
        const studentsResponse = await apiClient.get(`/api/rooms/${roomId}/students`)
        console.log('✅ Students data:', studentsResponse.data)
        setStudents(studentsResponse.data.students || [])
        
      } catch (error) {
        console.error('❌ Error fetching data:', error)
        // If room not found or not authorized, redirect
        router.push('/dashboard/guru')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roomId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#147E7E] border-t-transparent mb-4"></div>
          <p className="text-lg text-[#2C3E50] font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return null
  }

  // Compute progress stats from students data
  const totalProgress = students.reduce((sum, s) => sum + (s.totalPages || 0), 0)
  const completedProgress = students.reduce((sum, s) => sum + (s.totalCompletedPages || 0), 0)

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
              <Link href="/dashboard/guru">
                <Button className="group relative overflow-hidden font-semibold px-6 py-3 rounded-xl border-2 border-white/40 text-white bg-white/10 hover:bg-white hover:text-[#147E7E] backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span>Kembali</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 group hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{room.name}</h1>
                  </div>
                  <p className="text-base text-white/90 font-medium">Detail Kelas & Manajemen Murid</p>
                  <p className="text-sm text-white/70 mt-1">Pantau progres dan kelola pembelajaran</p>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                <Button className="group relative overflow-hidden font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 bg-[#F1C40F] text-[#2C3E50] hover:bg-white shadow-xl hover:shadow-2xl">
                  <Users className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-lg">Kelola Murid</span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
        {/* Enhanced Stats Cards with Advanced Design */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Murid Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl hover:-translate-y-2 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#147E7E]/10 via-transparent to-[#147E7E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 p-8">
              <div className="space-y-2">
                <CardTitle className="text-sm font-bold text-[#2C3E50]/70 uppercase tracking-wide flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Total Murid</span>
                </CardTitle>
                <div className="text-4xl font-black text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                  {students?.length || 0}
                </div>
                <p className="text-sm text-[#2C3E50]/60 font-medium">Murid terdaftar</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#147E7E]/10 group-hover:bg-[#147E7E]/20 transition-all duration-300 group-hover:scale-110">
                <Users className="h-8 w-8 text-[#147E7E] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </CardHeader>
          </Card>

          {/* Progress Selesai Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl hover:-translate-y-2 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F1C40F]/10 via-transparent to-[#F1C40F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 p-8">
              <div className="space-y-2">
                <CardTitle className="text-sm font-bold text-[#2C3E50]/70 uppercase tracking-wide flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Progress</span>
                </CardTitle>
                <div className="text-4xl font-black text-[#2C3E50] group-hover:text-[#F1C40F] transition-colors duration-300">
                  {completedProgress}
                </div>
                <p className="text-sm text-[#2C3E50]/60 font-medium">Dari {totalProgress}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F1C40F]/10 group-hover:bg-[#F1C40F]/20 transition-all duration-300 group-hover:scale-110">
                <TrendingUp className="h-8 w-8 text-[#F1C40F] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </CardHeader>
          </Card>

          {/* Tes Selesai Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl hover:-translate-y-2 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50]/10 via-transparent to-[#2C3E50]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 p-8">
              <div className="space-y-2">
                <CardTitle className="text-sm font-bold text-[#2C3E50]/70 uppercase tracking-wide flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Tes Selesai</span>
                </CardTitle>
                <div className="text-4xl font-black text-[#2C3E50] group-hover:text-[#2C3E50] transition-colors duration-300">
                  0
                </div>
                <p className="text-sm text-[#2C3E50]/60 font-medium">Evaluasi lengkap</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#2C3E50]/10 group-hover:bg-[#2C3E50]/20 transition-all duration-300 group-hover:scale-110">
                <Award className="h-8 w-8 text-[#2C3E50] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </CardHeader>
          </Card>

          {/* Tingkat Kemajuan Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl hover:-translate-y-2 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 p-8">
              <div className="space-y-2">
                <CardTitle className="text-sm font-bold text-[#2C3E50]/70 uppercase tracking-wide flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Kemajuan</span>
                </CardTitle>
                <div className="text-4xl font-black text-[#2C3E50] group-hover:text-green-600 transition-colors duration-300">
                  {totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}%
                </div>
                <p className="text-sm text-[#2C3E50]/60 font-medium">Rata-rata kelas</p>
              </div>
              <div className="p-4 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-300 group-hover:scale-110">
                <BarChart3 className="h-8 w-8 text-green-600 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Grid with Enhanced Layout */}
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Room Info Section - Enhanced Design */}
          <div className="lg:col-span-3 space-y-8">
            {/* Room Information Card */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 p-10 border-b border-[#D5DBDB]/20">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-[#147E7E]/10">
                    <Target className="h-8 w-8 text-[#147E7E]" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-[#2C3E50]">Informasi Kelas</CardTitle>
                    <CardDescription className="text-[#2C3E50]/70 text-lg">
                      Detail lengkap tentang kelas dan pengaturannya
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-[#D5DBDB]/10 border border-[#D5DBDB]/20">
                      <h4 className="font-bold text-[#2C3E50]/70 mb-3 uppercase tracking-wide text-sm flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Nama Kelas</span>
                      </h4>
                      <p className="text-2xl font-bold text-[#2C3E50]">{room.name}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#D5DBDB]/10 border border-[#D5DBDB]/20">
                      <h4 className="font-bold text-[#2C3E50]/70 mb-3 uppercase tracking-wide text-sm flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Dibuat</span>
                      </h4>
                      <p className="text-lg font-semibold text-[#2C3E50]">
                        {new Date(room.created_at).toLocaleDateString("id-ID", { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-[#147E7E]/5 border border-[#147E7E]/20">
                      <h4 className="font-bold text-[#2C3E50]/70 mb-3 uppercase tracking-wide text-sm flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Kode Kelas</span>
                      </h4>
                      <div className="flex items-center space-x-4">
                        <Badge className="text-2xl font-mono px-6 py-3 bg-[#147E7E]/10 text-[#147E7E] border border-[#147E7E]/30 hover:bg-[#147E7E]/20">
                          {room.code}
                        </Badge>
                        <Button size="lg" className="group bg-[#147E7E] hover:bg-[#2C3E50] text-white rounded-xl transition-all duration-300 hover:scale-105">
                          <Copy className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        </Button>
                      </div>
                      <p className="text-sm text-[#2C3E50]/60 mt-3 font-medium">Bagikan kode ini kepada murid untuk bergabung</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#F1C40F]/5 border border-[#F1C40F]/20">
                      <h4 className="font-bold text-[#2C3E50]/70 mb-3 uppercase tracking-wide text-sm flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Status</span>
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-lg font-bold text-green-600">Aktif</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-[#2C3E50]/5 border border-[#2C3E50]/20">
                  <h4 className="font-bold text-[#2C3E50]/70 mb-3 uppercase tracking-wide text-sm">Deskripsi</h4>
                  <p className="text-lg text-[#2C3E50]/80 leading-relaxed">
                    {room.description || "Tidak ada deskripsi untuk kelas ini."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Students List Card */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#F1C40F]/5 via-transparent to-[#147E7E]/5 p-10 border-b border-[#D5DBDB]/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-[#F1C40F]/10">
                      <Users className="h-8 w-8 text-[#F1C40F]" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-[#2C3E50]">Daftar Murid</CardTitle>
                      <CardDescription className="text-[#2C3E50]/70 text-lg">
                        {students?.length || 0} murid terdaftar di kelas ini
                      </CardDescription>
                    </div>
                  </div>
                  <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                    <Button className="group relative overflow-hidden font-bold px-8 py-4 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-xl">
                      <span className="text-lg">Lihat Semua</span>
                      <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                {students && students.length > 0 ? (
                  <div className="space-y-4">
                    {students.slice(0, 5).map((enrollment) => (
                      <div
                        key={enrollment.enrollment_id}
                        className="group relative overflow-hidden p-6 bg-gradient-to-r from-[#D5DBDB]/20 via-white/50 to-[#D5DBDB]/20 rounded-2xl border border-[#D5DBDB]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-[#147E7E]/10 flex items-center justify-center border border-[#147E7E]/20">
                              <Users className="h-6 w-6 text-[#147E7E]" />
                            </div>
                            <div>
                              <p className="text-xl font-bold text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                                {enrollment.users?.name}
                              </p>
                              <p className="text-sm text-[#2C3E50]/60 font-medium">{enrollment.users?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="px-4 py-2 rounded-xl bg-[#F1C40F]/10 border border-[#F1C40F]/20">
                              <p className="text-sm font-bold text-[#2C3E50]/70 uppercase tracking-wide">Bergabung</p>
                              <p className="text-lg font-semibold text-[#F1C40F]">
                                {new Date(enrollment.joined_at).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {students.length > 5 && (
                      <div className="text-center pt-6">
                        <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                          <Button className="group font-bold px-8 py-4 rounded-xl border-2 border-[#147E7E] text-[#147E7E] bg-transparent hover:bg-[#147E7E] hover:text-white transition-all duration-300 hover:scale-105 text-lg">
                            <span>Lihat {students.length - 5} murid lainnya</span>
                            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto mb-8 p-8 rounded-3xl bg-[#D5DBDB]/20 w-fit">
                      <Users className="h-20 w-20 mx-auto text-[#2C3E50]/30" />
                    </div>
                    <h3 className="text-3xl font-bold text-[#2C3E50] mb-4">Belum ada murid</h3>
                    <p className="text-[#2C3E50]/60 mb-10 text-xl max-w-lg mx-auto leading-relaxed">
                      Bagikan kode kelas <span className="font-bold text-[#147E7E]">{room.code}</span> kepada murid untuk bergabung
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Enhanced Statistics Summary */}
          <div className="space-y-6">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#2C3E50]/10 to-transparent p-8">
                <CardTitle className="text-2xl font-bold text-[#2C3E50] flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[#2C3E50]/20">
                    <BarChart3 className="h-6 w-6 text-[#2C3E50]" />
                  </div>
                  <span>Statistik Kelas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="text-center p-6 bg-[#147E7E]/5 rounded-2xl border border-[#147E7E]/10">
                  <div className="text-4xl font-black text-[#147E7E] mb-2">{students?.length || 0}</div>
                  <div className="text-sm text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Total Murid</div>
                </div>
                <div className="text-center p-6 bg-[#F1C40F]/5 rounded-2xl border border-[#F1C40F]/10">
                  <div className="text-4xl font-black text-[#F1C40F] mb-2">{completedProgress}</div>
                  <div className="text-sm text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Progress Selesai</div>
                </div>
                <div className="text-center p-6 bg-green-500/5 rounded-2xl border border-green-500/10">
                  <div className="text-4xl font-black text-green-600 mb-2">
                    {totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}%
                  </div>
                  <div className="text-sm text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Tingkat Kemajuan</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}