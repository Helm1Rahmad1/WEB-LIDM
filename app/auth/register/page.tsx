"use client"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Mail, Lock, User, UserCheck, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"guru" | "murid">("murid")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    try {
      await register({ name, email, password, role: role })
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      // Registrasi berhasil
      router.push("/auth/register-success")
    } catch (error: any) {
      setError(error.response?.data?.error || "Terjadi kesalahan saat registrasi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#147E7E]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F1C40F]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2C3E50]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-[#147E7E] hover:text-[#2C3E50] transition-colors duration-300 font-medium"
      >
        <ArrowRight className="h-5 w-5 rotate-180" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="relative w-full max-w-md z-10">
        {/* Main Register Card */}
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95 hover:shadow-3xl transition-all duration-500 group">
          {/* Header with Gradient */}
          <CardHeader className="relative text-center pb-8 bg-gradient-to-br from-[#147E7E] to-[#147E7E]/90 text-white">
            <div className="absolute inset-0 bg-[#147E7E]/20 backdrop-blur-sm"></div>
            
            {/* Logo/Icon */}
            <div className="relative mx-auto mb-4 p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 w-fit">
              <BookOpen className="h-10 w-10 text-white" />
            </div>

            <CardTitle className="relative text-3xl font-bold mb-2 tracking-tight">
              Daftar Akun Baru
            </CardTitle>
            <CardDescription className="relative text-white/90 text-base font-medium leading-relaxed">
              Bergabunglah dengan platform<br />pembelajaran Al-Qur'an
            </CardDescription>
          </CardHeader>

          {/* Form Content */}
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[#2C3E50] font-semibold flex items-center space-x-2">
                  <User className="h-4 w-4 text-[#147E7E]" />
                  <span>Nama Lengkap</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 pl-4 pr-4 border-2 border-[#D5DBDB] focus:border-[#147E7E] focus:ring-2 focus:ring-[#147E7E]/20 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-[#147E7E]/20 to-[#F1C40F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[#2C3E50] font-semibold flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-[#147E7E]" />
                  <span>Email</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="masukkan@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-4 pr-4 border-2 border-[#D5DBDB] focus:border-[#147E7E] focus:ring-2 focus:ring-[#147E7E]/20 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-[#147E7E]/20 to-[#F1C40F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              </div>

              {/* Role Field */}
              <div className="space-y-3">
                <Label htmlFor="role" className="text-[#2C3E50] font-semibold flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-[#147E7E]" />
                  <span>Peran</span>
                </Label>
                <div className="relative group">
                  <Select value={role} onValueChange={(value: "guru" | "murid") => setRole(value)}>
                    <SelectTrigger className="h-12 border-2 border-[#D5DBDB] focus:border-[#147E7E] focus:ring-2 focus:ring-[#147E7E]/20 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80">
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="murid">Murid</SelectItem>
                      <SelectItem value="guru">Guru</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-[#147E7E]/20 to-[#F1C40F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-[#2C3E50] font-semibold flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-[#147E7E]" />
                  <span>Password</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-4 pr-4 border-2 border-[#D5DBDB] focus:border-[#147E7E] focus:ring-2 focus:ring-[#147E7E]/20 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-[#147E7E]/20 to-[#F1C40F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-[#2C3E50] font-semibold flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-[#147E7E]" />
                  <span>Konfirmasi Password</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Konfirmasi password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pl-4 pr-4 border-2 border-[#D5DBDB] focus:border-[#147E7E] focus:ring-2 focus:ring-[#147E7E]/20 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-[#147E7E]/20 to-[#F1C40F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Terjadi Kesalahan</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Register Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative overflow-hidden w-full h-12 text-[#2C3E50] font-bold bg-[#F1C40F] hover:bg-[#147E7E] hover:text-white transition-all duration-300 hover:scale-105 rounded-xl shadow-lg hover:shadow-xl text-lg"
              >
                <span className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Mendaftar...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Daftar</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-[#D5DBDB]/50">
              <p className="text-[#2C3E50]/70 mb-3">Sudah punya akun?</p>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="group font-semibold border-2 border-[#147E7E] text-[#147E7E] hover:bg-[#147E7E] hover:text-white transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3"
                >
                  <span>Masuk di sini</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="mt-6 border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-[#2C3E50]/70">
              <BookOpen className="h-5 w-5 text-[#147E7E]" />
              <span className="font-medium">Bergabunglah dengan komunitas pembelajaran yang inklusif</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}