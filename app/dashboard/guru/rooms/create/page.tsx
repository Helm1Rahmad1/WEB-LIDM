"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BookOpen, Plus, Target, Users, Code, Info, Sparkles, CheckCircle, Zap } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function CreateRoomPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const roomCode = generateRoomCode()

      const response = await apiClient.post("/api/rooms", {
        name,
        description,
        code: roomCode,
      })

      if (response.status === 201 && response.data.room) {
        router.push("/dashboard/guru")
      } else {
        throw new Error(response.data?.error || "Failed to create room")
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data?.error || "Terjadi kesalahan pada server")
      } else {
        setError(error.message || "Terjadi kesalahan")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-40 left-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-20 backdrop-blur-lg bg-white/80 shadow-xl border-b border-gray-200/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard/guru">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="lg" className="group font-semibold px-6 py-3 text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all duration-300">
                    <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="text-lg">Kembali</span>
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Plus className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Buat Kelas Baru
                  </motion.h1>
                  <motion.p 
                    className="text-base text-gray-600 font-medium mt-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Mulai perjalanan pembelajaran yang menginspirasi
                  </motion.p>
                </div>
              </div>
            </div>

            <motion.div 
              className="hidden lg:flex items-center space-x-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 border border-yellow-300 flex items-center space-x-2 shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-white font-semibold text-sm">Langkah Mudah</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-5xl mx-auto p-6 space-y-8">
        {/* Progress Indicator */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 flex items-center justify-center shadow-lg"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(20, 126, 126, 0.4)",
                    "0 0 0 10px rgba(20, 126, 126, 0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <span className="text-white font-bold text-base">1</span>
              </motion.div>
              <span className="font-bold text-teal-700 text-base">Informasi Kelas</span>
            </motion.div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2 opacity-50">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-bold text-base">2</span>
              </div>
              <span className="font-semibold text-gray-500 text-base">Selesai</span>
            </div>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-yellow-50 p-10 border-b border-gray-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <motion.div 
                      className="p-3 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <BookOpen className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900">Informasi Kelas</CardTitle>
                      <CardDescription className="text-gray-600 text-lg mt-2">
                        Lengkapi detail kelas untuk memulai pembelajaran yang efektif
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Nama Kelas */}
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="name" className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                        <Target className="h-5 w-5 text-teal-600" />
                        <span>Nama Kelas</span>
                      </Label>
                      <div className="relative group">
                        <Input
                          id="name"
                          type="text"
                          placeholder="Contoh: Kelas Hijaiyah Pemula - Batch 2025"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-16 text-lg border-2 border-gray-200 focus:border-teal-500 bg-white rounded-xl px-6 font-medium transition-all duration-300 hover:shadow-lg focus:shadow-xl group-hover:border-teal-300"
                        />
                        <motion.div 
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <BookOpen className="h-5 w-5 text-teal-500" />
                        </motion.div>
                      </div>
                      <p className="text-sm text-gray-600 font-medium ml-1 flex items-center space-x-2">
                        <Info className="h-4 w-4 text-gray-400" />
                        <span>Berikan nama yang jelas dan mudah diingat oleh murid-murid Anda</span>
                      </p>
                    </motion.div>

                    {/* Deskripsi Kelas */}
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Label htmlFor="description" className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                        <Info className="h-5 w-5 text-yellow-500" />
                        <span>Deskripsi Kelas</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Jelaskan tujuan pembelajaran, materi yang akan dipelajari, dan target pencapaian murid di kelas ini. Contoh: Kelas ini dirancang untuk memperkenalkan huruf hijaiyah kepada pemula dengan metode interaktif dan menyenangkan..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[160px] text-lg border-2 border-gray-200 focus:border-yellow-500 bg-white rounded-xl p-6 font-medium transition-all duration-300 hover:shadow-lg focus:shadow-xl resize-none hover:border-yellow-300"
                      />
                      <p className="text-sm text-gray-600 font-medium ml-1 flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-gray-400" />
                        <span>Deskripsi yang menarik akan membantu murid memahami manfaat dari kelas ini</span>
                      </p>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          className="p-6 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start space-x-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-red-600 text-lg font-bold">!</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-red-800 mb-1 text-lg">Terjadi Kesalahan</h4>
                            <p className="text-red-700 font-medium">{error}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-4 pt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Link href="/dashboard/guru" className="flex-1">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            variant="outline"
                            className="group w-full h-16 font-bold text-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all duration-300 shadow-lg"
                          >
                            <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span>Batal</span>
                          </Button>
                        </motion.div>
                      </Link>
                      <motion.div 
                        className="flex-1"
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="group relative overflow-hidden w-full h-16 font-bold text-lg text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          <AnimatePresence mode="wait">
                            {isLoading ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center"
                              >
                                <motion.div 
                                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full mr-3"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <span>Membuat Kelas...</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="submit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center"
                              >
                                <Plus className="h-6 w-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                                <span>Buat Kelas</span>
                                <Zap className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar Information */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Kode Kelas Info */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-transparent p-8">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                  <motion.div 
                    className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Code className="h-6 w-6 text-white" />
                  </motion.div>
                  <span>Kode Kelas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl border border-yellow-200"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-yellow-500" />
                    <span>Otomatis Dibuat</span>
                  </h4>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    Kode kelas unik akan dibuat secara otomatis setelah kelas berhasil dibuat. 
                    Murid dapat menggunakan kode 6 karakter ini untuk bergabung.
                  </p>
                </motion.div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <motion.div 
                    className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-200"
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="text-3xl font-black text-teal-600 mb-1">6</div>
                    <div className="text-xs text-gray-700 font-semibold uppercase tracking-wide">Karakter</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200"
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="text-3xl font-black text-gray-900 mb-1">∞</div>
                    <div className="text-xs text-gray-700 font-semibold uppercase tracking-wide">Murid</div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent p-8">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                  <motion.div 
                    className="p-2 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Sparkles className="h-6 w-6 text-white" />
                  </motion.div>
                  <span>Tips Sukses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {[
                  { num: 1, title: "Nama Jelas", desc: "Gunakan nama yang mudah dipahami dan mencerminkan materi pembelajaran", color: "from-teal-600 to-teal-700" },
                  { num: 2, title: "Deskripsi Menarik", desc: "Jelaskan manfaat dan tujuan pembelajaran dengan bahasa yang menginspirasi", color: "from-yellow-400 to-yellow-500" },
                  { num: 3, title: "Target Jelas", desc: "Sebutkan pencapaian yang diharapkan setelah menyelesaikan kelas", color: "from-gray-700 to-gray-800" }
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <motion.div 
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${tip.color} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="text-white font-bold text-sm">{tip.num}</span>
                    </motion.div>
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">{tip.title}</h5>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        {tip.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div 
                    className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 w-fit mx-auto mb-4 border border-teal-200"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Users className="h-12 w-12 text-teal-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Siap Mengajar?</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    Setelah kelas dibuat, Anda dapat langsung mulai mengelola pembelajaran dan melihat progress murid
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}