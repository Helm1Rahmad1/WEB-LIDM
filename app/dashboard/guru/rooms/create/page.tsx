"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BookOpen, Plus, Sparkles, Target, Users, Code, Info } from "lucide-react"
import Link from "next/link"

export default function CreateRoomPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("User not authenticated")

      const roomCode = generateRoomCode()

      const { error } = await supabase.from("rooms").insert({
        name,
        description,
        code: roomCode,
        created_by: user.user.id,
      })

      if (error) throw error

      router.push("/dashboard/guru")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#147E7E]/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-[#F1C40F]/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#2C3E50]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-[#147E7E]/6 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header with Glass Effect */}
      <header className="relative z-20 backdrop-blur-lg bg-gradient-to-r from-[#147E7E] to-[#147E7E]/90 shadow-2xl border-b border-white/10">
        <div className="absolute inset-0 bg-[#147E7E]/10 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center space-x-6">
              <Link href="/dashboard/guru">
                <Button variant="ghost" size="lg" className="group font-semibold px-6 py-3 text-white hover:bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 transition-all duration-300 hover:scale-105">
                  <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="text-lg">Kembali</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 group">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Buat Kelas Baru</h1>
                  <p className="text-base text-white/90 font-medium mt-1">Mulai perjalanan pembelajaran yang menginspirasi</p>
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="px-4 py-2 rounded-full bg-[#F1C40F]/20 border border-[#F1C40F]/30 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-[#F1C40F]" />
                <span className="text-white font-semibold text-sm">Langkah Mudah</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content container: increased max width and responsive padding for better layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/40">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#147E7E] flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="font-semibold text-[#147E7E] text-sm">Informasi Kelas</span>
            </div>
            <div className="w-12 h-0.5 bg-[#D5DBDB]"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#D5DBDB] flex items-center justify-center">
                <span className="text-[#2C3E50]/50 font-bold text-sm">2</span>
              </div>
              <span className="font-semibold text-[#2C3E50]/50 text-sm">Selesai</span>
            </div>
          </div>
        </div>

        {/* Main Form Card - responsive grid and spacing adjustments */}
        <div className="grid lg:grid-cols-3 lg:gap-10 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 p-8 sm:p-10 border-b border-[#D5DBDB]/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-2xl bg-[#147E7E]/10">
                    <BookOpen className="h-7 w-7 text-[#147E7E]" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">Informasi Kelas</CardTitle>
                    <CardDescription className="text-[#2C3E50]/70 text-base sm:text-lg mt-2">
                      Lengkapi detail kelas untuk memulai pembelajaran yang efektif
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Nama Kelas */}
                  <div className="space-y-4">
                    <Label htmlFor="name" className="text-lg font-bold text-[#2C3E50] flex items-center space-x-2">
                      <Target className="h-5 w-5 text-[#147E7E]" />
                      <span>Nama Kelas</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        placeholder="Contoh: Kelas Hijaiyah Pemula - Batch 2025"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 sm:h-14 text-base sm:text-lg border-2 border-[#D5DBDB] focus:border-[#147E7E] bg-white/80 backdrop-blur-sm rounded-xl px-6 font-medium transition-all duration-300 hover:shadow-lg focus:shadow-xl"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <BookOpen className="h-5 w-5 text-[#147E7E]/50" />
                      </div>
                    </div>
                    <p className="text-sm text-[#2C3E50]/60 font-medium ml-1">
                      Berikan nama yang jelas dan mudah diingat oleh murid-murid Anda
                    </p>
                  </div>

                  {/* Deskripsi Kelas */}
                  <div className="space-y-4">
                    <Label htmlFor="description" className="text-lg font-bold text-[#2C3E50] flex items-center space-x-2">
                      <Info className="h-5 w-5 text-[#F1C40F]" />
                      <span>Deskripsi Kelas</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Jelaskan tujuan pembelajaran, materi yang akan dipelajari, dan target pencapaian murid di kelas ini. Contoh: Kelas ini dirancang untuk memperkenalkan huruf hijaiyah kepada pemula dengan metode interaktif dan menyenangkan..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[140px] sm:min-h-[160px] text-base sm:text-lg border-2 border-[#D5DBDB] focus:border-[#F1C40F] bg-white/80 backdrop-blur-sm rounded-xl p-6 font-medium transition-all duration-300 hover:shadow-lg focus:shadow-xl resize-none"
                    />
                    <p className="text-sm text-[#2C3E50]/60 font-medium ml-1">
                      Deskripsi yang menarik akan membantu murid memahami manfaat dari kelas ini
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start space-x-4">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-sm font-bold">!</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-red-800 mb-1">Terjadi Kesalahan</h4>
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Link href="/dashboard/guru" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="group w-full h-14 font-bold text-lg border-2 border-[#D5DBDB] bg-white/80 text-[#2C3E50] hover:bg-[#D5DBDB]/30 hover:border-[#2C3E50] rounded-xl transition-all duration-300 hover:scale-105"
                      >
                        <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span>Batal</span>
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="group relative overflow-hidden flex-1 h-14 font-bold text-lg text-white bg-[#147E7E] hover:bg-[#2C3E50] rounded-xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          <span>Membuat Kelas...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-6 w-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                          <span>Buat Kelas</span>
                          <Sparkles className="h-5 w-5 ml-3 group-hover:rotate-12 transition-transform duration-300" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Kode Kelas Info */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#F1C40F]/10 to-transparent p-8">
                <CardTitle className="text-xl font-bold text-[#2C3E50] flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[#F1C40F]/20">
                    <Code className="h-6 w-6 text-[#F1C40F]" />
                  </div>
                  <span>Kode Kelas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="p-6 bg-[#F1C40F]/5 rounded-2xl border border-[#F1C40F]/10">
                  <h4 className="font-bold text-[#2C3E50] mb-3 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-[#F1C40F]" />
                    <span>Otomatis Dibuat</span>
                  </h4>
                  <p className="text-[#2C3E50]/70 leading-relaxed font-medium">
                    Kode kelas unik akan dibuat secara otomatis setelah kelas berhasil dibuat. 
                    Murid dapat menggunakan kode 6 karakter ini untuk bergabung.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-[#147E7E]/5 rounded-xl border border-[#147E7E]/10">
                    <div className="text-2xl font-bold text-[#147E7E] mb-1">6</div>
                    <div className="text-xs text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Karakter</div>
                  </div>
                  <div className="text-center p-4 bg-[#2C3E50]/5 rounded-xl border border-[#2C3E50]/10">
                    <div className="text-2xl font-bold text-[#2C3E50] mb-1">∞</div>
                    <div className="text-xs text-[#2C3E50]/60 font-semibold uppercase tracking-wide">Murid</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#147E7E]/10 to-transparent p-8">
                <CardTitle className="text-xl font-bold text-[#2C3E50] flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[#147E7E]/20">
                    <Sparkles className="h-6 w-6 text-[#147E7E]" />
                  </div>
                  <span>Tips Sukses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-[#147E7E]/5 rounded-xl border border-[#147E7E]/10">
                    <div className="w-6 h-6 rounded-full bg-[#147E7E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">1</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-[#2C3E50] mb-1">Nama Jelas</h5>
                      <p className="text-sm text-[#2C3E50]/70 font-medium leading-relaxed">
                        Gunakan nama yang mudah dipahami dan mencerminkan materi pembelajaran
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-[#F1C40F]/5 rounded-xl border border-[#F1C40F]/10">
                    <div className="w-6 h-6 rounded-full bg-[#F1C40F] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#2C3E50] font-bold text-xs">2</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-[#2C3E50] mb-1">Deskripsi Menarik</h5>
                      <p className="text-sm text-[#2C3E50]/70 font-medium leading-relaxed">
                        Jelaskan manfaat dan tujuan pembelajaran dengan bahasa yang menginspirasi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-[#2C3E50]/5 rounded-xl border border-[#2C3E50]/10">
                    <div className="w-6 h-6 rounded-full bg-[#2C3E50] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">3</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-[#2C3E50] mb-1">Target Jelas</h5>
                      <p className="text-sm text-[#2C3E50]/70 font-medium leading-relaxed">
                        Sebutkan pencapaian yang diharapkan setelah menyelesaikan kelas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="p-4 rounded-2xl bg-[#147E7E]/10 w-fit mx-auto mb-4">
                    <Users className="h-8 w-8 text-[#147E7E]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">Siap Mengajar?</h3>
                  <p className="text-[#2C3E50]/70 font-medium leading-relaxed">
                    Setelah kelas dibuat, Anda dapat langsung mulai mengelola pembelajaran dan melihat progress murid
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}