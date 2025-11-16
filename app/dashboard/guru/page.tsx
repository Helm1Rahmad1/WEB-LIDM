"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Award, Plus, Settings, TrendingUp, ArrowRight, Sparkles, Target, BarChart3, LogOut } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"

export default function GuruDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)

  // Require user to be authenticated as a guru
  useEffect(() => {
    console.log('🔍 Guru Dashboard - loading:', loading, 'user:', user?.email, 'role:', user?.role)
    
    if (!loading) {
      if (!user) {
        console.log('❌ No user, redirecting to login')
        router.replace('/auth/login')
        return
      }
      
      if (user.role !== 'guru') {
        console.log('❌ Wrong role, redirecting to appropriate dashboard')
        router.replace(`/dashboard/${user.role}`)
        return
      }
      
      console.log('✅ Guru dashboard access granted for:', user.email)
    }
  }, [user, loading, router])

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      if (!user || user.role !== 'guru') return
      
      try {
        setLoadingRooms(true)
        const response = await apiClient.get('/api/rooms')
        console.log('✅ Rooms data:', response.data)
        setRooms(response.data.rooms || [])
      } catch (error) {
        console.error('❌ Error fetching rooms:', error)
        setRooms([])
      } finally {
        setLoadingRooms(false)
      }
    }

    fetchRooms()
  }, [user])

  // Show loading while checking auth
  if (loading || loadingRooms) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#147E7E] border-t-transparent mb-4"></div>
          <p className="text-lg text-[#2C3E50] font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authorized (will be handled by useEffect)
  if (!user || user.role !== 'guru') {
    return null
  }

  // Calculate total students from actual rooms data
  const totalStudents = rooms.reduce((sum, r) => {
    return sum + Number(r.student_count ?? 0)
  }, 0)
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#147E7E]/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-[#F1C40F]/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#2C3E50]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-[#147E7E]/6 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Header with Enhanced Gradient and Glass Effect */}
      <header className="relative z-20 backdrop-blur-lg bg-gradient-to-r from-[#147E7E] to-[#147E7E]/90 shadow-2xl border-b border-white/10">
        <div className="absolute inset-0 bg-[#147E7E]/10 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Enhanced Brand Section */}
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 group hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Guru</h1>
                  <div className="px-3 py-1 rounded-full bg-[#F1C40F]/20 border border-[#F1C40F]/30">
                    <Sparkles className="h-4 w-4 text-[#F1C40F]" />
                  </div>
                </div>
                <p className="text-base text-white/90 font-medium">
                  {/* Selamat datang kembali, <span className="text-[#F1C40F] font-bold">{user.user.user_metadata?.name}</span> */}
                  Selamat datang kembali, <span className="text-[#F1C40F] font-bold">Dudi</span>
                </p>
                <p className="text-sm text-white/70 mt-1">Kelola pembelajaran dengan mudah dan efektif</p>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/guru/rooms/create">
                <Button className="group relative overflow-hidden font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 bg-[#F1C40F] text-[#2C3E50] hover:bg-white shadow-xl hover:shadow-2xl">
                  <Plus className="h-6 w-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-lg">Buat Kelas</span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </Button>
              </Link>
              <form action="/auth/logout" method="post">
                <Button
                  variant="outline"
                  className="group font-semibold px-6 py-4 rounded-xl border-2 border-white/40 text-white bg-white/10 hover:bg-white hover:text-[#147E7E] backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  <span>Keluar</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
        {/* Enhanced Stats Cards with Advanced Design */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Kelas Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl hover:-translate-y-2 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#147E7E]/10 via-transparent to-[#147E7E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 p-8">
              <div className="space-y-2">
                <CardTitle className="text-sm font-bold text-[#2C3E50]/70 uppercase tracking-wide flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Total Kelas</span>
                </CardTitle>
                <div className="text-4xl font-black text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                  {rooms?.length || 0}
                </div>
                <p className="text-sm text-[#2C3E50]/60 font-medium">Kelas aktif Anda</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#147E7E]/10 group-hover:bg-[#147E7E]/20 transition-all duration-300 group-hover:scale-110">
                <BookOpen className="h-8 w-8 text-[#147E7E] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </CardHeader>
          </Card>

          {/* Total Murid Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl hover:-translate-y-2 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F1C40F]/10 via-transparent to-[#F1C40F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 p-8">
              <div className="space-y-2">
                <CardTitle className="text-sm font-bold text-[#2C3E50]/70 uppercase tracking-wide flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Total Murid</span>
                </CardTitle>
                <div className="text-4xl font-black text-[#2C3E50] group-hover:text-[#F1C40F] transition-colors duration-300">
                  {totalStudents || 0}
                </div>
                <p className="text-sm text-[#2C3E50]/60 font-medium">Murid terdaftar</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F1C40F]/10 group-hover:bg-[#F1C40F]/20 transition-all duration-300 group-hover:scale-110">
                <Users className="h-8 w-8 text-[#F1C40F] group-hover:rotate-12 transition-transform duration-300" />
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
        </div>

        {/* Main Content Grid with Enhanced Layout */}
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Classes Section - Enhanced Design */}
          <div className="lg:col-span-3">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 p-10 border-b border-[#D5DBDB]/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-3xl font-bold text-[#2C3E50]">Kelas Saya</CardTitle>
                      <div className="px-3 py-1 rounded-full bg-[#147E7E]/10 border border-[#147E7E]/20">
                        <BarChart3 className="h-5 w-5 text-[#147E7E]" />
                      </div>
                    </div>
                    <CardDescription className="text-[#2C3E50]/70 text-lg leading-relaxed">
                      Kelola dan pantau progres pembelajaran murid di setiap kelas dengan mudah
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/guru/rooms/create">
                    <Button className="group relative overflow-hidden font-bold px-8 py-4 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl">
                      <Plus className="h-6 w-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                      <span className="text-lg">Tambah Kelas</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                {rooms && rooms.length > 0 ? (
                  <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                    {rooms.map((room) => (
                      <Card key={room.room_id} className="group relative overflow-hidden border-2 border-[#D5DBDB]/30 bg-white hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-3 hover:rotate-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <CardHeader className="relative pb-6 p-8">
                          <div className="flex items-start justify-between mb-4">
                            <CardTitle className="text-2xl font-bold text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300 leading-tight">
                              {room.name}
                            </CardTitle>
                            <div className="p-2 rounded-xl bg-[#147E7E]/10 group-hover:bg-[#147E7E]/20 transition-colors duration-300">
                              <BookOpen className="h-5 w-5 text-[#147E7E]" />
                            </div>
                          </div>
                          <CardDescription className="text-[#2C3E50]/70 leading-relaxed text-base">
                            {room.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative pt-0 p-8 space-y-6">
                          <div className="flex justify-between items-center p-5 bg-[#D5DBDB]/10 rounded-2xl border border-[#D5DBDB]/20">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-[#147E7E]/10">
                                <Target className="h-4 w-4 text-[#147E7E]" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-[#2C3E50]/60 uppercase tracking-wide">Kode Kelas</span>
                                <div className="font-mono text-lg font-bold text-[#147E7E] mt-1">{room.code}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 bg-[#F1C40F]/10 px-4 py-2 rounded-xl border border-[#F1C40F]/20">
                              <Users className="h-5 w-5 text-[#F1C40F]" />
                              <<span className="font-bold text-[#2C3E50] text-lg">
                                {room.student_count ?? 0}
                              </span>
                              <span className="text-sm text-[#2C3E50]/60 font-medium">murid</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Link href={`/dashboard/guru/rooms/${room.room_id}`} className="block">
                              <Button className="group w-full font-bold py-4 text-white bg-[#147E7E] hover:bg-[#2C3E50] transition-all duration-300 rounded-xl hover:scale-105 shadow-lg text-lg">
                                <span>Detail</span>
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/guru/rooms/${room.room_id}/students`} className="block">
                              <Button variant="outline" className="group w-full font-bold py-4 border-2 border-[#147E7E] text-[#147E7E] hover:bg-[#147E7E] hover:text-white transition-all duration-300 rounded-xl hover:scale-105 text-lg">
                                <Users className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                                <span>Murid</span>
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto mb-8 p-8 rounded-3xl bg-[#D5DBDB]/20 w-fit">
                      <BookOpen className="h-20 w-20 mx-auto text-[#2C3E50]/30" />
                    </div>
                    <h3 className="text-3xl font-bold text-[#2C3E50] mb-4">Belum ada kelas</h3>
                    <p className="text-[#2C3E50]/60 mb-10 text-xl max-w-lg mx-auto leading-relaxed">
                      Mulai perjalanan mengajar Anda dengan membuat kelas pertama untuk para murid
                    </p>
                    <Link href="/dashboard/guru/rooms/create">
                      <Button className="group relative overflow-hidden font-bold px-10 py-5 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-2xl text-xl">
                        <Plus className="h-7 w-7 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Buat Kelas Pertama</span>
                        <Sparkles className="h-6 w-6 ml-3 group-hover:rotate-12 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            {/* <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#F1C40F]/10 to-transparent p-8">
                <CardTitle className="text-2xl font-bold text-[#2C3E50] flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[#F1C40F]/20">
                    <TrendingUp className="h-6 w-6 text-[#F1C40F]" />
                  </div>
                  <span>Aksi Cepat</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <Link href="/dashboard/guru/rooms/create">
                  <Button className="group relative overflow-hidden w-full font-bold py-5 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-xl text-lg">
                    <Plus className="h-6 w-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Buat Kelas Baru</span>
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
                <Button variant="outline" className="group w-full font-semibold py-5 rounded-xl border-2 border-[#D5DBDB] bg-transparent text-[#2C3E50] hover:bg-[#D5DBDB]/30 transition-all duration-300 hover:scale-105 text-lg">
                  <Settings className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Pengaturan</span>
                </Button>
              </CardContent>
            </Card> */}

            {/* Enhanced Statistics Summary */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#2C3E50]/10 to-transparent p-8">
                <CardTitle className="text-2xl font-bold text-[#2C3E50] flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[#2C3E50]/20">
                    <BarChart3 className="h-6 w-6 text-[#2C3E50]" />
                  </div>
                  <span>Ringkasan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="text-center p-6 bg-[#147E7E]/5 rounded-2xl border border-[#147E7E]/10">
                  <div className="text-4xl font-black text-[#147E7E] mb-2">{rooms?.length || 0}</div>
                  <div className="text-sm text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Kelas Aktif</div>
                </div>
                <div className="text-center p-6 bg-[#F1C40F]/5 rounded-2xl border border-[#F1C40F]/10">
                  <div className="text-4xl font-black text-[#F1C40F] mb-2">{totalStudents || 0}</div>
                  <div className="text-sm text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Total Murid</div>
                </div>
                <div className="text-center p-6 bg-[#2C3E50]/5 rounded-2xl border border-[#2C3E50]/10">
                  <div className="text-4xl font-black text-[#2C3E50] mb-2">100%</div>
                  <div className="text-sm text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Kepuasan</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}