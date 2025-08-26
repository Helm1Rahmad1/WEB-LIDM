import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Mail, Calendar, TrendingUp } from "lucide-react"
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
            <Users className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Murid - {room.name}</h1>
              <p className="text-sm text-gray-200">{students?.length || 0} murid terdaftar</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: "#2C3E50" }}>Daftar Murid</CardTitle>
            <CardDescription>Pantau progres dan aktivitas setiap murid di kelas ini</CardDescription>
          </CardHeader>
          <CardContent>
            {students && students.length > 0 ? (
              <div className="space-y-4">
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
                    <Card key={enrollment.enrollment_id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                style={{ backgroundColor: "#147E7E" }}
                              >
                                {enrollment.users?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg" style={{ color: "#2C3E50" }}>
                                  {enrollment.users?.name}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{enrollment.users?.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Bergabung {new Date(enrollment.joined_at).toLocaleDateString("id-ID")}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-900">Progress Huruf</span>
                                </div>
                                <div className="text-lg font-bold text-blue-900">
                                  {completedProgress}/{totalProgress}
                                </div>
                                <div className="text-xs text-blue-700">
                                  {totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}%
                                  selesai
                                </div>
                              </div>

                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge className="h-4 w-4 bg-green-600" />
                                  <span className="text-sm font-medium text-green-900">Tes Lulus</span>
                                </div>
                                <div className="text-lg font-bold text-green-900">{completedTests}</div>
                                <div className="text-xs text-green-700">tes berhasil</div>
                              </div>

                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="h-4 w-4 bg-yellow-500 rounded-full" />
                                  <span className="text-sm font-medium text-yellow-900">Rata-rata Nilai</span>
                                </div>
                                <div className="text-lg font-bold text-yellow-900">{averageScore}</div>
                                <div className="text-xs text-yellow-700">dari 100</div>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4">
                            <Link href={`/dashboard/guru/rooms/${roomId}/students/${enrollment.user_id}`}>
                              <Button size="sm" className="text-white" style={{ backgroundColor: "#147E7E" }}>
                                Lihat Detail
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada murid</h3>
                <p className="text-gray-500 mb-4">
                  Bagikan kode kelas <strong>{room.code}</strong> kepada murid untuk bergabung
                </p>
                <Badge variant="secondary" className="text-lg font-mono px-4 py-2">
                  {room.code}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
