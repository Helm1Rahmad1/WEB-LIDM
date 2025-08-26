import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Award, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-6 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Sign Quran</h1>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-[#147E7E] bg-transparent"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="text-white" style={{ backgroundColor: "#F1C40F", color: "#2C3E50" }}>
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#2C3E50" }}>
            Platform Pembelajaran Al-Qur'an untuk Tunarungu
          </h2>
          <p className="text-xl mb-8 text-gray-600">
            Belajar huruf hijaiyah dan membaca Al-Qur'an dengan metode visual yang mudah dipahami
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="text-white font-semibold px-8 py-3" style={{ backgroundColor: "#147E7E" }}>
              Mulai Belajar Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: "#2C3E50" }}>
            Fitur Unggulan
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: "#147E7E" }} />
                <CardTitle style={{ color: "#2C3E50" }}>Pembelajaran Jilid</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Belajar huruf hijaiyah secara bertahap dari jilid 1 hingga 6 dengan metode visual
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: "#147E7E" }} />
                <CardTitle style={{ color: "#2C3E50" }}>Kelas Virtual</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Guru dapat membuat kelas dan memantau progres belajar setiap murid secara real-time
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 mx-auto mb-4" style={{ color: "#147E7E" }} />
                <CardTitle style={{ color: "#2C3E50" }}>Tes & Evaluasi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Sistem tes per huruf dan jilid untuk mengukur kemampuan dan progres pembelajaran
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ backgroundColor: "#2C3E50" }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-5 w-5" style={{ color: "#F1C40F" }} />
            <p className="text-white">Dibuat dengan cinta untuk komunitas tunarungu Indonesia</p>
          </div>
          <p className="text-gray-400 text-sm">© 2024 Sign Quran. Platform pembelajaran Al-Qur'an untuk tunarungu.</p>
        </div>
      </footer>
    </div>
  )
}
