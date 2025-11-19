"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const role = "guru"
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, label: "", color: "" }
    if (pass.length < 6) return { strength: 1, label: "Lemah", color: "bg-red-500" }
    if (pass.length < 10) return { strength: 2, label: "Sedang", color: "bg-yellow-500" }
    return { strength: 3, label: "Kuat", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      setIsLoading(false)
      return
    }

    try {
      await register({ name, email, password, role: role })
      router.push("/auth/register-success")
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat registrasi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-40 -right-20 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Back to Home Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link 
          href="/" 
          className="absolute top-6 left-6 flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition-colors duration-300 font-medium group z-50"
        >
          <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </motion.div>

      <motion.div 
        className="relative w-full max-w-md z-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {/* Main Register Card */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95 hover:shadow-3xl transition-all duration-500">
            {/* Header with Gradient */}
            <CardHeader className="relative text-center pb-8 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
              <div className="absolute inset-0 bg-teal-600/20 backdrop-blur-sm"></div>
              
              {/* Logo/Icon with Animation */}
              <motion.div 
                className="relative mx-auto mb-4 p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 w-fit"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <BookOpen className="h-10 w-10 text-white" />
              </motion.div>

              <CardTitle className="relative text-3xl font-bold mb-2 tracking-tight">
                Daftar Akun Baru
              </CardTitle>
              <CardDescription className="relative text-white/90 text-base font-medium leading-relaxed">
                Bergabunglah dengan platform<br />pembelajaran Al-Qur'an
              </CardDescription>

              {/* Floating decorative elements */}
              <motion.div
                className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/5 border border-white/10"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, 90, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </CardHeader>

            {/* Form Content */}
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Name Field */}
                <motion.div variants={fadeInUp} className="space-y-3">
                  <Label htmlFor="name" className="text-gray-900 font-semibold flex items-center space-x-2">
                    <User className="h-4 w-4 text-teal-700" />
                    <span>Nama Lengkap</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 pl-4 pr-4 border-2 border-gray-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all duration-300 rounded-xl bg-white hover:border-gray-300"
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div variants={fadeInUp} className="space-y-3">
                  <Label htmlFor="email" className="text-gray-900 font-semibold flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-teal-700" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="masukkan@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-4 pr-4 border-2 border-gray-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all duration-300 rounded-xl bg-white hover:border-gray-300"
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div variants={fadeInUp} className="space-y-3">
                  <Label htmlFor="password" className="text-gray-900 font-semibold flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-teal-700" />
                    <span>Password</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-4 pr-12 border-2 border-gray-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all duration-300 rounded-xl bg-white hover:border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${passwordStrength.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Minimal 6 karakter</p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={fadeInUp} className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-gray-900 font-semibold flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-teal-700" />
                    <span>Konfirmasi Password</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Konfirmasi password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pl-4 pr-12 border-2 border-gray-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all duration-300 rounded-xl bg-white hover:border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {confirmPassword.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2"
                    >
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Password cocok</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600 font-medium">Password tidak cocok</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Terjadi Kesalahan</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Register Button */}
                <motion.div variants={fadeInUp}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="group relative overflow-hidden w-full h-12 text-white font-bold bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl shadow-lg text-lg"
                  >
                    <span className="relative z-10">
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <motion.div
                            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Mendaftar...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Daftar</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </form>

              {/* Login Link */}
              <motion.div 
                variants={fadeInUp}
                className="text-center pt-6 border-t border-gray-200"
              >
                <p className="text-gray-600 mb-3">Sudah punya akun?</p>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="group font-semibold border-2 border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3"
                  >
                    <span>Masuk di sini</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info Card */}
        <motion.div variants={fadeInUp}>
          <Card className="mt-6 border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardContent className="p-6 text-center">
              <motion.div 
                className="flex items-center justify-center space-x-2 text-gray-700"
                whileHover={{ scale: 1.02 }}
              >
                <BookOpen className="h-5 w-5 text-teal-700" />
                <span className="font-medium">Bergabunglah dengan komunitas pembelajaran yang inklusif</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}