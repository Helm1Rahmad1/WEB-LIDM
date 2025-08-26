import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Award, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function MuridDashboardPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  // Check if user is murid
  const userRole = user.user.user_metadata?.role
  if (userRole !== "murid") {
    redirect("/dashboard/guru")
  }

  // Get student's enrolled classes
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      rooms(name, description, code)
    `)
    .eq("user_id", user.user.id)

  // Get student's progress
  const { data: letterProgress } = await supabase.from("user_letter_progress").select("*").eq("user_id", user.user.id)

  // Get student's test results
  const { data: testResults } = await supabase.from("letter_tests").select("*").eq("user_id", user.user.id)

  const totalProgress = letterProgress?.length || 0
  const completedProgress = letterProgress?.filter((p) => p.status === "selesai").length || 0
  const completedTests = testResults?.filter((t) => t.status === "lulus").length || 0
  const averageScore = testResults?.length
    ? Math.round(testResults.reduce((sum, test) => sum + test.score, 0) / testResults.length)
    : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard Murid</h1>
              <p className="text-sm text-gray-200">Selamat datang, {user.user.user_metadata?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/murid/join-class">
              <Button className="text-white" style={{ backgroundColor: "#F1C40F", color: "#2C3E50" }}>
                <Plus className="h-4 w-4 mr-2" />
                Gabung Kelas
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Kelas Diikuti
              </CardTitle>
              <Users className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {enrollments?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Progress Huruf
              </CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {completedProgress}/{totalProgress}
              </div>
              <p className="text-xs text-gray-500">
                {totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}% selesai
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Tes Lulus
              </CardTitle>
              <Award className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {completedTests}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Rata-rata Nilai
              </CardTitle>
              <Award className="h-4 w-4" style={{ color: "#147E7E" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
                {averageScore}
              </div>
              <p className="text-xs text-gray-500">dari 100</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Classes List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle style={{ color: "#2C3E50" }}>Kelas Saya</CardTitle>
                    <CardDescription>Kelas yang sedang Anda ikuti</CardDescription>
                  </div>
                  <Link href="/dashboard/murid/join-class">
                    <Button className="text-white" style={{ backgroundColor: "#147E7E" }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Gabung Kelas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {enrollments && enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <Card key={enrollment.enrollment_id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1" style={{ color: "#2C3E50" }}>
                                {enrollment.rooms?.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">{enrollment.rooms?.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Kode: {enrollment.rooms?.code}</span>
                                <span>Bergabung {new Date(enrollment.joined_at).toLocaleDateString("id-ID")}</span>
                              </div>
                            </div>
                            <div className="ml-4 space-y-2">
                              <Link href={`/dashboard/murid/classes/${enrollment.room_id}/learn`}>
                                <Button size="sm" className="w-full text-white" style={{ backgroundColor: "#147E7E" }}>
                                  Belajar
                                </Button>
                              </Link>
                              <Link href={`/dashboard/murid/classes/${enrollment.room_id}/progress`}>
                                <Button size="sm" variant="outline" className="w-full bg-transparent">
                                  Progress
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Belum mengikuti kelas</h3>
                    <p className="text-gray-500 mb-4">Gabung kelas untuk mulai belajar huruf hijaiyah</p>
                    <Link href="/dashboard/murid/join-class">
                      <Button className="text-white" style={{ backgroundColor: "#147E7E" }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Gabung Kelas Pertama
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#2C3E50" }}>
                  Progress Keseluruhan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Huruf Hijaiyah</span>
                    <span>
                      {completedProgress}/{totalProgress}
                    </span>
                  </div>
                  <Progress value={totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0} className="h-2" />
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Tes Lulus:</span>
                      <span className="font-medium">{completedTests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rata-rata Nilai:</span>
                      <span className="font-medium">{averageScore}/100</span>
                    </div>
                  </div>
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
                <Link href="/dashboard/murid/learn">
                  <Button className="w-full text-white" style={{ backgroundColor: "#147E7E" }}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Mulai Belajar
                  </Button>
                </Link>
                <Link href="/dashboard/murid/progress">
                  <Button variant="outline" className="w-full bg-transparent">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Lihat Progress
                  </Button>
                </Link>
                <Link href="/dashboard/murid/tests">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Award className="h-4 w-4 mr-2" />
                    Ikuti Tes
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
