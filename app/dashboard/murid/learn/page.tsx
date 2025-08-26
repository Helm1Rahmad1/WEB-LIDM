import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Play, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function LearnPage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  // Get all jilid with their letters
  const { data: jilid } = await supabase
    .from("jilid")
    .select(`
      *,
      jilid_letters(
        *,
        hijaiyah(*)
      )
    `)
    .order("jilid_id")

  // Get student's progress
  const { data: progress } = await supabase.from("user_practice_progress").select("*").eq("user_id", user.user.id)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/dashboard/murid">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Belajar Huruf Hijaiyah</h1>
              <p className="text-sm text-gray-200">Pilih jilid untuk mulai belajar</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jilid?.map((jilidItem) => {
            const jilidProgress = progress?.filter((p) =>
              jilidItem.jilid_letters?.some((jl) => jl.hijaiyah_id === p.hijaiyah_id),
            )
            const completedLetters = jilidProgress?.filter((p) => p.status === "selesai").length || 0
            const totalLetters = jilidItem.jilid_letters?.length || 0
            const progressPercentage = totalLetters > 0 ? Math.round((completedLetters / totalLetters) * 100) : 0

            return (
              <Card key={jilidItem.jilid_id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl" style={{ color: "#2C3E50" }}>
                        {jilidItem.jilid_name}
                      </CardTitle>
                      <CardDescription className="mt-2">{jilidItem.description}</CardDescription>
                    </div>
                    {progressPercentage === 100 && <CheckCircle className="h-6 w-6" style={{ color: "#F1C40F" }} />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <Badge
                      variant={progressPercentage === 100 ? "default" : "secondary"}
                      style={progressPercentage === 100 ? { backgroundColor: "#F1C40F", color: "#2C3E50" } : undefined}
                    >
                      {progressPercentage}%
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{totalLetters}</span> huruf hijaiyah
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">Huruf yang dipelajari:</div>
                    <div className="flex flex-wrap gap-1">
                      {jilidItem.jilid_letters?.slice(0, 8).map((jl) => (
                        <span
                          key={jl.id}
                          className="inline-block px-2 py-1 text-sm rounded"
                          style={{ backgroundColor: "#147E7E", color: "white" }}
                        >
                          {jl.hijaiyah?.arabic_char}
                        </span>
                      ))}
                      {(jilidItem.jilid_letters?.length || 0) > 8 && (
                        <span className="inline-block px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded">
                          +{(jilidItem.jilid_letters?.length || 0) - 8}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/dashboard/murid/learn/${jilidItem.jilid_id}`}>
                      <Button className="w-full text-white" style={{ backgroundColor: "#147E7E" }}>
                        <Play className="h-4 w-4 mr-2" />
                        {progressPercentage > 0 ? "Lanjutkan Belajar" : "Mulai Belajar"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {(!jilid || jilid.length === 0) && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada materi pembelajaran</h3>
            <p className="text-gray-500">Materi pembelajaran akan tersedia setelah guru menambahkannya</p>
          </div>
        )}
      </div>
    </div>
  )
}
