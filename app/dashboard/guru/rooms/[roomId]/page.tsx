import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Copy, BookOpen, Award, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function RoomDetailPage({ params }: Props) {
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

  // Get students in this room
  const { data: students } = await supabase
    .from("enrollments")
    .select(`
      *,
      users(name, email)
    `)
    .eq("room_id", roomId)

  // Get progress statistics
  const { data: progressStats } = await supabase.from("user_letter_progress").select("status").eq("room_id", roomId)

  const totalProgress = progressStats?.length || 0
  const completedProgress = progressStats?.filter((p) => p.status === "selesai").length || 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/dashboard/guru">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">{room.name}</h1>
              <p className="text-sm text-gray-200">Detail Kelas</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Room Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: "#2C3E50" }}>Informasi Kelas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Nama Kelas</h4>
                  <p style={{ color: "#2C3E50" }}>{room.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Deskripsi</h4>
                  <p className="text-gray-600">{room.description || "Tidak ada deskripsi"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Kode Kelas</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-lg font-mono px-3 py-1">
                      {room.code}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Bagikan kode ini kepada murid untuk bergabung</p>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle style={{ color: "#2C3E50" }}>Daftar Murid</CardTitle>
                    <CardDescription>{students?.length || 0} murid terdaftar</CardDescription>
                  </div>
                  <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                    <Button size="sm" className="text-white" style={{ backgroundColor: "#147E7E" }}>
                      Lihat Semua
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {students && students.length > 0 ? (
                  <div className="space-y-3">
                    {students.slice(0, 5).map((enrollment) => (
                      <div
                        key={enrollment.enrollment_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium" style={{ color: "#2C3E50" }}>
                            {enrollment.users?.name}
                          </p>
                          <p className="text-sm text-gray-500">{enrollment.users?.email}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Bergabung {new Date(enrollment.joined_at).toLocaleDateString("id-ID")}
                        </div>
                      </div>
                    ))}
                    {students.length > 5 && (
                      <div className="text-center pt-2">
                        <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                          <Button variant="outline" size="sm">
                            Lihat {students.length - 5} murid lainnya
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Belum ada murid yang bergabung</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#2C3E50" }}>
                  Statistik Kelas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" style={{ color: "#147E7E" }} />
                    <span className="text-sm">Total Murid</span>
                  </div>
                  <span className="font-bold" style={{ color: "#2C3E50" }}>
                    {students?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" style={{ color: "#147E7E" }} />
                    <span className="text-sm">Progress Selesai</span>
                  </div>
                  <span className="font-bold" style={{ color: "#2C3E50" }}>
                    {completedProgress}/{totalProgress}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" style={{ color: "#147E7E" }} />
                    <span className="text-sm">Tes Selesai</span>
                  </div>
                  <span className="font-bold" style={{ color: "#2C3E50" }}>
                    0
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#2C3E50" }}>
                  Aksi Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                  <Button className="w-full text-white" style={{ backgroundColor: "#147E7E" }}>
                    <Users className="h-4 w-4 mr-2" />
                    Kelola Murid
                  </Button>
                </Link>
                <Link href={`/dashboard/guru/rooms/${roomId}/progress`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Lihat Progress
                  </Button>
                </Link>
                <Link href={`/dashboard/guru/rooms/${roomId}/tests`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Award className="h-4 w-4 mr-2" />
                    Hasil Tes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
