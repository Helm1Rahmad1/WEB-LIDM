import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Award, Plus, Table2 } from "lucide-react"
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
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard Guru</h1>
              <p className="text-sm text-gray-200">Selamat datang, {user.user.user_metadata?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/guru/rooms/create">
              <Button className="text-white" style={{ backgroundColor: "#F1C40F", color: "#2C3E50" }}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Kelas
              </Button>
            </Link>
            <form action="/auth/logout" method="post">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-[#147E7E] bg-transparent"
              >
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Total Kelas
              </CardTitle>
              <BookOpen className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {rooms?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Total Murid
              </CardTitle>
              <Users className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {totalStudents || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Tes Selesai
              </CardTitle>
              <Award className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                0
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle style={{ color: "#2C3E50" }}>Kelas Saya</CardTitle>
                    <CardDescription>Kelola dan pantau progres murid di setiap kelas</CardDescription>
                  </div>
                  <Link href="/dashboard/guru/rooms/create">
                    <Button className="text-white" style={{ backgroundColor: "#147E7E" }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kelas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {rooms && rooms.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                      <Card key={room.room_id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg" style={{ color: "#2C3E50" }}>
                            {room.name}
                          </CardTitle>
                          <CardDescription className="text-sm">{room.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Kode:</span> {room.code}
                            </div>
                            <div className="text-sm text-gray-600">
                              <Users className="h-4 w-4 inline mr-1" />
                              {room.enrollments?.[0]?.count || 0} murid
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link href={`/dashboard/guru/rooms/${room.room_id}`} className="flex-1">
                              <Button size="sm" className="w-full text-white" style={{ backgroundColor: "#147E7E" }}>
                                Lihat Detail
                              </Button>
                            </Link>
                            <Link href={`/dashboard/guru/rooms/${room.room_id}/students`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full bg-transparent">
                                Murid
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada kelas</h3>
                    <p className="text-gray-500 mb-4">Mulai dengan membuat kelas pertama Anda</p>
                    <Link href="/dashboard/guru/rooms/create">
                      <Button className="text-white" style={{ backgroundColor: "#147E7E" }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Kelas Pertama
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#2C3E50" }}>
                  Aksi Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/guru/rooms/create">
                  <Button className="w-full text-white" style={{ backgroundColor: "#147E7E" }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Kelas Baru
                  </Button>
                </Link>
                <form action="/auth/logout" method="post">
                  <Button variant="outline" className="w-full bg-transparent">
                    Keluar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}