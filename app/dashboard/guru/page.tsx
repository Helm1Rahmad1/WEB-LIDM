import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Award, Plus, Table2, Settings, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function GuruDashboardPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  // Check if user is guru
  const userRole = user.user.user_metadata?.role
  if (userRole !== "guru") {
    redirect("/dashboard/murid")
  }

  // Get teacher's rooms
  const { data: rooms } = await supabase
    .from("rooms")
    .select(`
      *,
      enrollments(count)
    `)
    .eq("created_by", user.user.id)

  // Get total students across all rooms
  const { count: totalStudents } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .in("room_id", rooms?.map((room) => room.room_id) || [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0]">
      {/* Modern Header with Gradient and Glass Effect */}
      <header className="relative backdrop-blur-lg bg-gradient-to-r from-[#147E7E] to-[#147E7E]/90 shadow-2xl border-b border-white/10">
        <div className="absolute inset-0 bg-[#147E7E]/5 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Brand Section */}
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Guru</h1>
                <p className="text-sm text-white/80 font-medium">
                  Selamat datang, <span className="text-[#F1C40F]">{user.user.user_metadata?.name}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/guru/rooms/create">
                <Button className="group relative overflow-hidden font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 bg-[#F1C40F] text-[#2C3E50] hover:bg-[#F39C12] shadow-lg hover:shadow-xl">
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Buat Kelas</span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
              <form action="/auth/logout" method="post">
                <Button
                  variant="outline"
                  className="font-medium px-6 py-3 rounded-xl border-2 border-white/30 text-white bg-white/5 hover:bg-white hover:text-[#147E7E] backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Keluar
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Stats Cards with Modern Design */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Kelas Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#147E7E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-semibold text-[#2C3E50]/70 uppercase tracking-wide">
                  Total Kelas
                </CardTitle>
                <div className="text-3xl font-bold text-[#2C3E50] mt-2">
                  {rooms?.length || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#147E7E]/10 group-hover:bg-[#147E7E]/20 transition-colors duration-300">
                <BookOpen className="h-6 w-6 text-[#147E7E]" />
              </div>
            </CardHeader>
          </Card>

          {/* Total Murid Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F1C40F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-semibold text-[#2C3E50]/70 uppercase tracking-wide">
                  Total Murid
                </CardTitle>
                <div className="text-3xl font-bold text-[#2C3E50] mt-2">
                  {totalStudents || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F1C40F]/10 group-hover:bg-[#F1C40F]/20 transition-colors duration-300">
                <Users className="h-6 w-6 text-[#F1C40F]" />
              </div>
            </CardHeader>
          </Card>

          {/* Tes Selesai Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-semibold text-[#2C3E50]/70 uppercase tracking-wide">
                  Tes Selesai
                </CardTitle>
                <div className="text-3xl font-bold text-[#2C3E50] mt-2">
                  0
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#2C3E50]/10 group-hover:bg-[#2C3E50]/20 transition-colors duration-300">
                <Award className="h-6 w-6 text-[#2C3E50]" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Classes Section - Takes 3/4 width */}
          <div className="lg:col-span-3">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#147E7E]/5 to-transparent p-8 border-b border-[#D5DBDB]/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="text-2xl font-bold text-[#2C3E50] mb-2">Kelas Saya</CardTitle>
                    <CardDescription className="text-[#2C3E50]/60 text-base">
                      Kelola dan pantau progres murid di setiap kelas
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/guru/rooms/create">
                    <Button className="group relative overflow-hidden font-semibold px-6 py-3 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-lg">
                      <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Tambah Kelas</span>
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {rooms && rooms.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                      <Card key={room.room_id} className="group relative overflow-hidden border-2 border-[#D5DBDB]/30 bg-white hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <CardHeader className="relative pb-4">
                          <CardTitle className="text-xl font-bold text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                            {room.name}
                          </CardTitle>
                          <CardDescription className="text-[#2C3E50]/60 leading-relaxed">{room.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="relative pt-0 space-y-6">
                          <div className="flex justify-between items-center p-4 bg-[#D5DBDB]/20 rounded-xl">
                            <div className="text-sm text-[#2C3E50]">
                              <span className="font-semibold text-[#147E7E]">Kode:</span> 
                              <span className="font-mono ml-1 px-2 py-1 bg-[#147E7E]/10 rounded-md">{room.code}</span>
                            </div>
                            <div className="flex items-center text-sm text-[#2C3E50] bg-[#F1C40F]/10 px-3 py-1 rounded-lg">
                              <Users className="h-4 w-4 mr-1 text-[#147E7E]" />
                              <span className="font-semibold">{room.enrollments?.[0]?.count || 0} murid</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Link href={`/dashboard/guru/rooms/${room.room_id}`} className="block">
                              <Button size="sm" className="w-full font-medium text-white bg-[#147E7E] hover:bg-[#2C3E50] transition-all duration-300 rounded-lg hover:scale-105 shadow-md">
                                Detail
                              </Button>
                            </Link>
                            <Link href={`/dashboard/guru/rooms/${room.room_id}/students`} className="block">
                              <Button size="sm" variant="outline" className="w-full font-medium border-2 border-[#147E7E] text-[#147E7E] hover:bg-[#147E7E] hover:text-white transition-all duration-300 rounded-lg hover:scale-105">
                                Murid
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto mb-6 p-6 rounded-2xl bg-[#D5DBDB]/30 w-fit">
                      <BookOpen className="h-16 w-16 mx-auto text-[#2C3E50]/40" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Belum ada kelas</h3>
                    <p className="text-[#2C3E50]/60 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                      Mulai perjalanan mengajar Anda dengan membuat kelas pertama
                    </p>
                    <Link href="/dashboard/guru/rooms/create">
                      <Button className="group relative overflow-hidden font-semibold px-8 py-4 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-xl text-lg">
                        <Plus className="h-6 w-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Buat Kelas Pertama</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 1/4 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#F1C40F]/10 to-transparent p-6">
                <CardTitle className="text-xl font-bold text-[#2C3E50] flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-[#F1C40F]" />
                  Aksi Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Link href="/dashboard/guru/rooms/create">
                  <Button className="group relative overflow-hidden w-full font-semibold py-4 rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-lg">
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Buat Kelas Baru</span>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full font-medium py-4 rounded-xl border-2 border-[#D5DBDB] bg-transparent text-[#2C3E50] hover:bg-[#D5DBDB]/50 transition-all duration-300 hover:scale-105">
                  <Settings className="h-5 w-5 mr-2" />
                  Pengaturan
                </Button>
                <form action="/auth/logout" method="post">
                  <Button variant="outline" className="w-full font-medium py-4 rounded-xl border-2 border-red-200 bg-transparent text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105">
                    Keluar
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Statistics Summary */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#2C3E50]/10 to-transparent p-6">
                <CardTitle className="text-xl font-bold text-[#2C3E50]">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="text-center p-4 bg-[#147E7E]/5 rounded-xl">
                  <div className="text-2xl font-bold text-[#147E7E]">{rooms?.length || 0}</div>
                  <div className="text-sm text-[#2C3E50]/60">Kelas Aktif</div>
                </div>
                <div className="text-center p-4 bg-[#F1C40F]/5 rounded-xl">
                  <div className="text-2xl font-bold text-[#F1C40F]">{totalStudents || 0}</div>
                  <div className="text-sm text-[#2C3E50]/60">Total Murid</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}