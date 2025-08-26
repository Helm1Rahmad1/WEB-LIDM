import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Award, Heart, ArrowRight, Star, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0]">
      {/* Modern Header with Glass Effect */}
      <header className="relative backdrop-blur-lg bg-gradient-to-r from-[#147E7E] to-[#147E7E]/95 shadow-2xl border-b border-white/10">
        <div className="absolute inset-0 bg-[#147E7E]/10 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Brand Section */}
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Sign Quran</h1>
                <p className="text-sm text-white/80 hidden sm:block">Platform Pembelajaran Al-Qur'an</p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="font-medium px-6 py-3 rounded-xl border-2 border-white/30 text-white bg-white/5 hover:bg-white hover:text-[#147E7E] backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="group relative overflow-hidden font-semibold px-6 py-3 rounded-xl bg-[#F1C40F] text-[#2C3E50] hover:bg-[#F39C12] transition-all duration-300 hover:scale-105 shadow-lg">
                  <span>Daftar</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#147E7E]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#F1C40F]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#147E7E]/20 text-[#147E7E] font-medium text-sm mb-8 shadow-lg">
            <Star className="h-4 w-4 mr-2 text-[#F1C40F]" />
            Platform Pembelajaran Terdepan untuk Tunarungu
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[#2C3E50] leading-tight">
            Belajar Al-Qur'an dengan
            <span className="block text-[#147E7E] mt-2">Metode Visual</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-12 text-[#2C3E50]/70 max-w-4xl mx-auto leading-relaxed">
            Platform inovatif untuk mempelajari huruf hijaiyah dan membaca Al-Qur'an 
            dengan pendekatan visual yang mudah dipahami oleh komunitas tunarungu
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth/register">
              <Button size="lg" className="group relative overflow-hidden font-bold px-8 py-4 text-lg rounded-xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-2xl">
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="font-semibold px-8 py-4 text-lg rounded-xl border-2 border-[#2C3E50]/20 text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white transition-all duration-300 hover:scale-105">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-[#2C3E50]/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#147E7E]" />
              <span className="font-medium">Gratis untuk Semua</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#147E7E]" />
              <span className="font-medium">Metode Terpercaya</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#147E7E]" />
              <span className="font-medium">Mudah Digunakan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#147E7E]/10 text-[#147E7E] font-medium text-sm mb-6">
              Fitur Unggulan Kami
            </div>
            <h3 className="text-3xl md:text-5xl font-bold text-[#2C3E50] mb-6">
              Pembelajaran yang Efektif & Inklusif
            </h3>
            <p className="text-xl text-[#2C3E50]/70 max-w-3xl mx-auto leading-relaxed">
              Dirancang khusus untuk memenuhi kebutuhan pembelajaran Al-Qur'an bagi komunitas tunarungu
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pembelajaran Jilid Card */}
            <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#147E7E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative text-center p-8">
                <div className="mx-auto mb-6 p-4 rounded-2xl bg-[#147E7E]/10 w-fit group-hover:bg-[#147E7E]/20 transition-colors duration-300">
                  <BookOpen className="h-12 w-12 text-[#147E7E]" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2C3E50] mb-3">Pembelajaran Jilid</CardTitle>
                <CardDescription className="text-[#2C3E50]/70 text-base leading-relaxed">
                  Kurikulum terstruktur dari jilid 1-6 dengan metode visual yang mudah dipahami dan dipraktikkan
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Kelas Virtual Card */}
            <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F1C40F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative text-center p-8">
                <div className="mx-auto mb-6 p-4 rounded-2xl bg-[#F1C40F]/10 w-fit group-hover:bg-[#F1C40F]/20 transition-colors duration-300">
                  <Users className="h-12 w-12 text-[#147E7E]" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2C3E50] mb-3">Kelas Virtual</CardTitle>
                <CardDescription className="text-[#2C3E50]/70 text-base leading-relaxed">
                  Sistem kelas online yang memungkinkan guru memantau dan membimbing progres setiap murid secara real-time
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Tes & Evaluasi Card */}
            <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl hover:-translate-y-2 md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative text-center p-8">
                <div className="mx-auto mb-6 p-4 rounded-2xl bg-[#2C3E50]/10 w-fit group-hover:bg-[#2C3E50]/20 transition-colors duration-300">
                  <Award className="h-12 w-12 text-[#147E7E]" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2C3E50] mb-3">Tes & Evaluasi</CardTitle>
                <CardDescription className="text-[#2C3E50]/70 text-base leading-relaxed">
                  Sistem penilaian komprehensif untuk mengukur kemampuan dan tracking progres pembelajaran setiap huruf
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#147E7E]/5 via-transparent to-[#F1C40F]/5"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h4 className="text-3xl md:text-4xl font-bold text-[#2C3E50] mb-6">
            Siap Memulai Perjalanan Belajar?
          </h4>
          <p className="text-xl text-[#2C3E50]/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan pelajar lainnya dan mulai perjalanan spiritual Anda hari ini
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="group relative overflow-hidden font-bold px-10 py-5 text-xl rounded-2xl bg-[#147E7E] text-white hover:bg-[#2C3E50] transition-all duration-300 hover:scale-105 shadow-2xl">
              <span>Daftar Sekarang - Gratis!</span>
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-r from-[#2C3E50] to-[#2C3E50]/95 py-12 px-6">
        <div className="absolute inset-0 bg-[#2C3E50]/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <Heart className="h-6 w-6 text-[#F1C40F]" />
              </div>
              <p className="text-white text-lg font-medium">
                Dibuat dengan <span className="text-[#F1C40F]">❤️</span> untuk komunitas tunarungu Indonesia
              </p>
            </div>
            
            {/* Brand Footer */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h5 className="text-xl font-bold text-white">Sign Quran</h5>
                <p className="text-white/80 text-sm">Platform Pembelajaran Al-Qur'an untuk Tunarungu</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-white/60 text-sm">
              © 2024 Sign Quran. Semua hak dilindungi. Misi kami adalah membuat pembelajaran Al-Qur'an dapat diakses oleh semua.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}