import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Award, Heart, ArrowRight, Sparkles, Eye, Target } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#147E7E]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-[#F1C40F]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#2C3E50]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-[#147E7E]/8 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 py-6 px-6 bg-gradient-to-r from-[#147E7E] to-[#147E7E]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sign Quran</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="group text-white border-2 border-white/60 hover:bg-white hover:text-[#147E7E] bg-transparent transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl px-6 py-2"
              >
                <span>Masuk</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="group bg-[#F1C40F] hover:bg-white text-[#2C3E50] font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-xl px-6 py-2">
                <span>Daftar</span>
                <Sparkles className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-white/20">
            <Eye className="h-5 w-5 text-[#147E7E]" />
            <span className="font-semibold text-[#2C3E50]">Platform Pembelajaran Visual</span>
            <Sparkles className="h-4 w-4 text-[#F1C40F]" />
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-[#2C3E50] leading-tight">
            Platform Pembelajaran
            <span className="block bg-gradient-to-r from-[#147E7E] to-[#147E7E]/80 bg-clip-text text-transparent">
              Al-Qur'an untuk Tunarungu
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-[#2C3E50]/80 leading-relaxed max-w-3xl mx-auto">
            Belajar huruf hijaiyah dan membaca Al-Qur'an dengan metode visual yang mudah dipahami. 
            Platform inklusif untuk pembelajaran yang bermakna.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/register">
              <Button 
                size="lg" 
                className="group bg-[#147E7E] hover:bg-[#147E7E]/90 text-white font-bold px-10 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 text-lg"
              >
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="#features">
              <Button 
                variant="outline"
                size="lg" 
                className="group border-2 border-[#2C3E50]/30 text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/60"
              >
                <span>Pelajari Lebih Lanjut</span>
                <Target className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-[#147E7E]/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-[#147E7E]/20">
              <Sparkles className="h-5 w-5 text-[#147E7E]" />
              <span className="font-semibold text-[#147E7E]">Fitur Unggulan</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-6">
              Pembelajaran yang Disesuaikan
            </h3>
            <p className="text-xl text-[#2C3E50]/70 max-w-3xl mx-auto">
              Fitur-fitur canggih yang dirancang khusus untuk memberikan pengalaman belajar terbaik
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-br from-[#147E7E]/5 to-transparent">
                <div className="mx-auto mb-6 p-4 rounded-2xl bg-[#147E7E]/10 border border-[#147E7E]/20 w-fit group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-12 w-12 text-[#147E7E] group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                  Pembelajaran Jilid
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <CardDescription className="text-center text-[#2C3E50]/70 text-base leading-relaxed">
                  Belajar huruf hijaiyah secara bertahap dari jilid 1 hingga 6 dengan metode visual yang interaktif dan mudah dipahami
                </CardDescription>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-br from-[#F1C40F]/5 to-transparent">
                <div className="mx-auto mb-6 p-4 rounded-2xl bg-[#F1C40F]/10 border border-[#F1C40F]/30 w-fit group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-12 w-12 text-[#147E7E] group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                  Kelas Virtual
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <CardDescription className="text-center text-[#2C3E50]/70 text-base leading-relaxed">
                  Guru dapat membuat kelas dan memantau progres belajar setiap murid secara real-time dengan dashboard yang komprehensif
                </CardDescription>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-br from-[#2C3E50]/5 to-transparent">
                <div className="mx-auto mb-6 p-4 rounded-2xl bg-[#2C3E50]/10 border border-[#2C3E50]/20 w-fit group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-12 w-12 text-[#147E7E] group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300">
                  Tes & Evaluasi
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <CardDescription className="text-center text-[#2C3E50]/70 text-base leading-relaxed">
                  Sistem tes per huruf dan jilid untuk mengukur kemampuan dan progres pembelajaran dengan feedback yang detail
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-[#147E7E] to-[#147E7E]/90 rounded-3xl overflow-hidden">
            <CardContent className="p-12 text-center text-white relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="mb-6 p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 w-fit mx-auto">
                  <Sparkles className="h-12 w-12 text-[#F1C40F]" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  Siap Memulai Perjalanan Belajar?
                </h3>
                <p className="text-xl mb-8 text-white/90 leading-relaxed">
                  Bergabunglah dengan ribuan murid dan guru yang telah merasakan kemudahan belajar Al-Qur'an dengan metode visual
                </p>
                <Link href="/auth/register">
                  <Button 
                    size="lg"
                    className="group bg-[#F1C40F] hover:bg-white text-[#2C3E50] font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg"
                  >
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-gradient-to-r from-[#2C3E50] to-[#2C3E50]/95 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-[#F1C40F]/20 border border-[#F1C40F]/30">
              <Heart className="h-6 w-6 text-[#F1C40F]" />
            </div>
            <p className="text-white text-lg font-medium">
              Dibuat dengan cinta untuk komunitas tunarungu Indonesia
            </p>
          </div>
          
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BookOpen className="h-5 w-5 text-[#F1C40F]" />
              <span className="text-white font-semibold">Sign Quran</span>
            </div>
            <p className="text-white/70 text-sm">
              © 2024 Sign Quran. Platform pembelajaran Al-Qur'an untuk tunarungu.
            </p>
            <p className="text-white/50 text-xs mt-2">
              Membangun masa depan pembelajaran yang inklusif dan bermakna
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}