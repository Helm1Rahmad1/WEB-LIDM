"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Users,
  Mail,
  Calendar,
  BookOpen,
  Award,
  Target,
  BarChart3,
  User,
  ArrowRight,
  Trophy,
  FileText,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

interface Props {
  params: { roomId: string }
}

interface Room {
  room_id: number
  name: string
  code: string
  description?: string
}

interface StudentEnrollment {
  enrollment_id: number
  user_id: string
  joined_at: string
  users: {
    name: string
    email: string
  }
  totalPages?: number
  totalCompletedPages?: number
  completedJilid?: number
  totalJilid?: number
  progressPercentage?: number
}

export default function RoomStudentsPage({ params }: Props) {
  const { roomId } = params
  const router = useRouter()

  const [room, setRoom] = useState<Room | null>(null)
  const [students, setStudents] = useState<StudentEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const scaleOnHover = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [roomRes, enrollRes] = await Promise.all([
          apiClient.get(`/api/rooms/${roomId}`),
          apiClient.get(`/api/enrollments`, {
            params: { roomId },
          }),
        ])

        setRoom(roomRes.data.room)
        const rawEnrollments = enrollRes.data.enrollments || []

        // Fetch progress data for each student
        const studentsWithProgress = await Promise.all(
          rawEnrollments.map(async (row: any) => {
            try {
              // Fetch jilid progress for this student
              const jilidProgressRes = await apiClient.get(`/api/progress/jilid`, {
                params: { 
                  userId: row.user_id,
                  roomId: roomId 
                }
              })
              
              const jilidProgress = jilidProgressRes.data.progress || []
              
              // Calculate completed jilid (where completed = true)
              const completedJilid = jilidProgress.filter((j: any) => j.completed).length
              const totalJilid = jilidProgress.length
              
              // Fetch letter/halaman progress for this student
              const letterProgressRes = await apiClient.get(`/api/progress/letter`, {
                params: { 
                  userId: row.user_id,
                  roomId: roomId 
                }
              })
              
              const letterProgress = letterProgressRes.data.progress || []
              const totalCompletedPages = letterProgress.filter((l: any) => l.completed).length
              const totalPages = letterProgress.length
              
              // Calculate overall progress percentage
              const progressPercentage = totalJilid > 0 
                ? Math.round((completedJilid / totalJilid) * 100) 
                : 0

              return {
                enrollment_id: row.enrollment_id,
                user_id: row.user_id,
                joined_at: row.joined_at,
                users: {
                  name: row.name,
                  email: row.email,
                },
                totalPages,
                totalCompletedPages,
                completedJilid,
                totalJilid,
                progressPercentage,
              }
            } catch (progressError) {
              console.error(`Error fetching progress for user ${row.user_id}:`, progressError)
              
              // Return default values if progress fetch fails
              return {
                enrollment_id: row.enrollment_id,
                user_id: row.user_id,
                joined_at: row.joined_at,
                users: {
                  name: row.name,
                  email: row.email,
                },
                totalPages: 0,
                totalCompletedPages: 0,
                completedJilid: 0,
                totalJilid: 7, // default 7 jilid
                progressPercentage: 0,
              }
            }
          })
        )

        setStudents(studentsWithProgress)
      } catch (err: any) {
        console.error("Fetch room/students error:", err)
        if (err.response?.status === 401) {
          router.push("/auth/login")
          return
        }
        setError(err.response?.data?.error || "Gagal memuat data murid")
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId) {
      fetchData()
    }
  }, [roomId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
            <motion.div
              className="absolute inset-0 w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <motion.p 
            className="text-gray-900 font-semibold text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Memuat data murid...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 bg-white rounded-3xl shadow-2xl space-y-4 text-center border border-gray-100"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Terjadi Kesalahan</h2>
          <p className="text-red-600 font-medium">{error}</p>
          <Button 
            onClick={() => location.reload()} 
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Coba Lagi
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!room) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, -20, 0],
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <Link href={`/dashboard/guru/rooms/${room.room_id}`}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="group relative overflow-hidden font-semibold px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Kembali</span>
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Users className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Murid - {room.name}
                  </motion.h1>
                  <motion.p 
                    className="text-base text-gray-600 font-medium mt-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {students.length} murid terdaftar di kelas
                  </motion.p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div 
                className="text-center p-4 rounded-2xl bg-white shadow-lg border border-gray-100"
                whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
              >
                <div className="text-3xl font-black text-teal-600">{students.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Murid</div>
              </motion.div>
              <motion.div 
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg"
                whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
              >
                <div className="text-3xl font-black text-white">{room.code}</div>
                <div className="text-sm text-white/90 font-medium">Kode Kelas</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-yellow-50 p-10 border-b border-gray-100">
              <motion.div 
                className="flex items-center space-x-4"
                variants={fadeInUp}
              >
                <motion.div 
                  className="p-3 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">Daftar Murid</CardTitle>
                  <CardDescription className="text-gray-600 text-lg mt-1">
                    Pantau progres dan aktivitas setiap murid di kelas ini secara detail
                  </CardDescription>
                </div>
              </motion.div>
            </CardHeader>
            <CardContent className="p-10">
              <AnimatePresence mode="wait">
                {students.length > 0 ? (
                  <motion.div 
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {students.map((enrollment, index) => {
                      const completedJilid = enrollment.completedJilid || 0
                      const totalJilid = enrollment.totalJilid || 7
                      const totalPages = enrollment.totalPages || 0
                      const totalCompletedPages = enrollment.totalCompletedPages || 0
                      const progressPercentage = enrollment.progressPercentage || 0

                      return (
                        <motion.div
                          key={enrollment.enrollment_id}
                          variants={fadeInUp}
                          whileHover="hover"
                          initial="rest"
                        >
                          <Card className="group relative overflow-hidden border-2 border-gray-100 bg-white hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-2 hover:border-teal-300">
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            />
                            <CardContent className="relative p-8">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {/* Student Header */}
                                  <div className="flex items-center space-x-4 mb-6">
                                    <motion.div 
                                      className="relative"
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {enrollment.users?.name?.charAt(0).toUpperCase() || "U"}
                                      </div>
                                      <motion.div 
                                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      >
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      </motion.div>
                                    </motion.div>
                                    <div className="flex-1">
                                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-300 mb-2">
                                        {enrollment.users?.name || "Nama tidak tersedia"}
                                      </h3>
                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700">halaman pembelajaran</span>
                                          </div>
                                          {/* Progress bar */}
                                          <div className="mt-3 bg-blue-200 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                              initial={{ width: 0 }}
                                              animate={{ width: `${totalPages > 0 ? (totalCompletedPages / totalPages) * 100 : 0}%` }}
                                              transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>

                                    {/* Jilid Selesai */}
                                    <motion.div 
                                      className="group/stat relative overflow-hidden p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border-2 border-green-200/50 hover:shadow-xl transition-all duration-300"
                                      whileHover={{ y: -5, scale: 1.02 }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                                      <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center space-x-3">
                                            <motion.div 
                                              className="p-2 rounded-xl bg-green-500/10 border border-green-500/20"
                                              whileHover={{ rotate: 360 }}
                                              transition={{ duration: 0.6 }}
                                            >
                                              <Trophy className="h-5 w-5 text-green-600" />
                                            </motion.div>
                                            <span className="text-sm font-bold text-green-900 uppercase tracking-wide">
                                              Jilid Selesai
                                            </span>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="text-3xl font-black text-green-900">
                                            {completedJilid}/{totalJilid}
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Award className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-700">jilid diselesaikan</span>
                                          </div>
                                          {/* Progress bar */}
                                          <div className="mt-3 bg-green-200 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                              initial={{ width: 0 }}
                                              animate={{ width: `${totalJilid > 0 ? (completedJilid / totalJilid) * 100 : 0}%` }}
                                              transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.1 }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>

                                    {/* Persentase Kemajuan */}
                                    <motion.div 
                                      className="group/stat relative overflow-hidden p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl border-2 border-yellow-200/50 hover:shadow-xl transition-all duration-300"
                                      whileHover={{ y: -5, scale: 1.02 }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                                      <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center space-x-3">
                                            <motion.div 
                                              className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                                              whileHover={{ rotate: 360 }}
                                              transition={{ duration: 0.6 }}
                                            >
                                              <BarChart3 className="h-5 w-5 text-yellow-600" />
                                            </motion.div>
                                            <span className="text-sm font-bold text-yellow-900 uppercase tracking-wide">
                                              Kemajuan
                                            </span>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="text-3xl font-black text-yellow-900">{progressPercentage}%</div>
                                          <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm font-medium text-yellow-700">progres pembelajaran</span>
                                          </div>
                                          {/* Circular progress */}
                                          <div className="mt-3 flex items-center justify-center">
                                            <div className="relative w-16 h-16">
                                              <svg className="w-full h-full -rotate-90">
                                                <circle
                                                  cx="32"
                                                  cy="32"
                                                  r="28"
                                                  stroke="currentColor"
                                                  strokeWidth="4"
                                                  fill="none"
                                                  className="text-yellow-200"
                                                />
                                                <motion.circle
                                                  cx="32"
                                                  cy="32"
                                                  r="28"
                                                  stroke="currentColor"
                                                  strokeWidth="4"
                                                  fill="none"
                                                  className="text-yellow-500"
                                                  strokeLinecap="round"
                                                  initial={{ strokeDasharray: "0 175.93" }}
                                                  animate={{ strokeDasharray: `${(progressPercentage / 100) * 175.93} 175.93` }}
                                                  transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.2 }}
                                                />
                                              </svg>
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="h-6 w-6 text-yellow-600" />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <div className="ml-8 flex flex-col space-y-4">
                                  <Link href={`/dashboard/guru/rooms/${roomId}/students/${enrollment.user_id}`}>
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button className="group relative overflow-hidden font-bold px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg">
                                        <User className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>Lihat Detail</span>
                                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                      </Button>
                                    </motion.div>
                                  </Link>
                                  <motion.div 
                                    className="text-center p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <div className="text-lg font-bold text-white">{progressPercentage}%</div>
                                    <div className="text-xs text-white/90 font-semibold uppercase tracking-wide">Kemajuan</div>
                                  </motion.div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="mx-auto mb-8 p-8 rounded-3xl bg-gradient-to-br from-teal-50 to-yellow-50 w-fit"
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Users className="h-20 w-20 mx-auto text-teal-600" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Belum ada murid</h3>
                    <p className="text-gray-600 mb-10 text-xl max-w-lg mx-auto leading-relaxed">
                      Bagikan kode kelas kepada murid untuk bergabung dan memulai pembelajaran
                    </p>
                    <div className="space-y-6">
                      <div className="flex items-center justify-center space-x-4">
                        <span className="text-lg font-semibold text-gray-700">Kode Kelas:</span>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Badge className="text-2xl font-mono px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white border-2 border-teal-500 shadow-lg hover:shadow-xl transition-all duration-300">
                            {room.code}
                          </Badge>
                        </motion.div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="group relative overflow-hidden font-bold px-10 py-5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 text-xl">
                          <BookOpen className="h-7 w-7 mr-3 group-hover:rotate-12 transition-transform duration-500" />
                          <span>Panduan Bergabung</span>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}