"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Copy, BookOpen, Award, TrendingUp, Target, BarChart3, ArrowRight, Calendar, Clock, Sparkles, Check } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  params: Promise<{ roomId: string }>
}

export default function RoomDetailPage({ params }: Props) {
  const router = useRouter()
  const [roomId, setRoomId] = useState<string>("")
  const [room, setRoom] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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
      scale: 1.05,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }

  // Unwrap params
  useEffect(() => {
    params.then(p => setRoomId(p.roomId))
  }, [params])

  // Fetch room and students data
  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return

      try {
        setLoading(true)
        
        const roomResponse = await apiClient.get(`/api/rooms/${roomId}`)
        console.log('✅ Room data:', roomResponse.data)
        setRoom(roomResponse.data.room)

        const studentsResponse = await apiClient.get(`/api/rooms/${roomId}/students`)
        console.log('✅ Students data:', studentsResponse.data)
        
        // Normalize student data structure
        const raw = studentsResponse.data.students || []
        const normalized = raw.map((row: any) => ({
          enrollment_id: row.enrollment_id,
          user_id: row.user_id,
          joined_at: row.joined_at,
          users: {
            name: row.name || row.users?.name,
            email: row.email || row.users?.email,
          },
          totalPages: row.total_pages || row.totalPages,
          totalCompletedPages: row.completed_pages || row.totalCompletedPages,
        }))
        
        console.log('✅ Normalized students:', normalized)
        setStudents(normalized)
        
      } catch (error) {
        console.error('❌ Error fetching data:', error)
        router.push('/dashboard/guru')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roomId, router])

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
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
            Memuat...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (!room) {
    return null
  }

  const totalProgress = students.reduce((sum, s) => sum + (s.totalPages || 0), 0)
  const completedProgress = students.reduce((sum, s) => sum + (s.totalCompletedPages || 0), 0)

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
              <Link href="/dashboard/guru">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="group font-semibold px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
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
                  <BookOpen className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {room.name}
                  </motion.h1>
                  <motion.p 
                    className="text-base text-gray-600 font-medium mt-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Detail Kelas & Manajemen Murid
                  </motion.p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="group font-bold px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg">
                    <Users className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Kelola Murid</span>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
        {/* Stats Cards */}
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: Users,
              title: "Total Murid",
              value: students?.length || 0,
              subtitle: "Murid terdaftar",
              color: "from-teal-600 to-teal-700",
              bgColor: "from-teal-50 to-teal-100/50"
            },
            {
              icon: TrendingUp,
              title: "Progress",
              value: completedProgress,
              subtitle: `Dari ${totalProgress}`,
              color: "from-yellow-400 to-yellow-500",
              bgColor: "from-yellow-50 to-yellow-100/50"
            },
            {
              icon: Award,
              title: "Tes Selesai",
              value: 0,
              subtitle: "Evaluasi lengkap",
              color: "from-gray-700 to-gray-800",
              bgColor: "from-gray-50 to-gray-100/50"
            },
            {
              icon: BarChart3,
              title: "Kemajuan",
              value: `${totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}%`,
              subtitle: "Rata-rata kelas",
              color: "from-green-500 to-green-600",
              bgColor: "from-green-50 to-green-100/50"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`group relative overflow-hidden border-0 bg-gradient-to-br ${stat.bgColor} shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl`}>
                <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4 p-8">
                  <div className="space-y-2">
                    <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center space-x-2">
                      <stat.icon className="h-4 w-4" />
                      <span>{stat.title}</span>
                    </CardTitle>
                    <div className="text-4xl font-black text-gray-900 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{stat.subtitle}</p>
                  </div>
                  <motion.div 
                    className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </motion.div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Room Info Section */}
          <div className="lg:col-span-3 space-y-8">
            {/* Room Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-yellow-50 p-10 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="p-3 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Target className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900">Informasi Kelas</CardTitle>
                      <CardDescription className="text-gray-600 text-lg mt-1">
                        Detail lengkap tentang kelas dan pengaturannya
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <motion.div 
                        className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200"
                        whileHover={{ scale: 1.02, shadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                      >
                        <h4 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-sm flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Nama Kelas</span>
                        </h4>
                        <p className="text-2xl font-bold text-gray-900">{room.name}</p>
                      </motion.div>
                      <motion.div 
                        className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200"
                        whileHover={{ scale: 1.02, shadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                      >
                        <h4 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-sm flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Dibuat</span>
                        </h4>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(room.created_at).toLocaleDateString("id-ID", { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </motion.div>
                    </div>
                    <div className="space-y-6">
                      <motion.div 
                        className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200"
                        whileHover={{ scale: 1.02, shadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                      >
                        <h4 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-sm flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>Kode Kelas</span>
                        </h4>
                        <div className="flex items-center space-x-4">
                          <Badge className="text-2xl font-mono px-6 py-3 bg-white border-2 border-teal-300 text-teal-700 hover:bg-teal-50 shadow-lg">
                            {room.code}
                          </Badge>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button 
                              size="lg" 
                              onClick={handleCopyCode}
                              className={`group rounded-xl transition-all duration-300 ${
                                copied 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800'
                              } text-white shadow-lg`}
                            >
                              <AnimatePresence mode="wait">
                                {copied ? (
                                  <motion.div
                                    key="check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                  >
                                    <Check className="h-5 w-5" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="copy"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                  >
                                    <Copy className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Button>
                          </motion.div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3 font-medium">Bagikan kode ini kepada murid</p>
                      </motion.div>
                      <motion.div 
                        className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200"
                        whileHover={{ scale: 1.02, shadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                      >
                        <h4 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-sm flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Status</span>
                        </h4>
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className="w-3 h-3 bg-green-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span className="text-lg font-bold text-green-600">Aktif</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {room.description && (
                    <motion.div 
                      className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200"
                      whileHover={{ scale: 1.01, shadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                    >
                      <h4 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-sm">Deskripsi</h4>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {room.description}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Students List Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-yellow-50 via-white to-teal-50 p-10 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Users className="h-8 w-8 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-gray-900">Daftar Murid</CardTitle>
                        <CardDescription className="text-gray-600 text-lg mt-1">
                          {students?.length || 0} murid terdaftar di kelas ini
                        </CardDescription>
                      </div>
                    </div>
                    <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="group font-bold px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg">
                          <span>Lihat Semua</span>
                          <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  {students && students.length > 0 ? (
                    <motion.div 
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {students.slice(0, 5).map((enrollment, index) => (
                        <motion.div
                          key={enrollment.enrollment_id}
                          variants={fadeInUp}
                          whileHover={{ y: -5, scale: 1.01 }}
                        >
                          <div className="group p-6 bg-gradient-to-r from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <motion.div 
                                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center border-2 border-teal-500 shadow-lg"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  <Users className="h-6 w-6 text-white" />
                                </motion.div>
                                <div>
                                  <p className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-300">
                                    {enrollment.users?.name}
                                  </p>
                                  <p className="text-sm text-gray-600 font-medium">{enrollment.users?.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
                                  <p className="text-sm font-bold text-white uppercase tracking-wide">Bergabung</p>
                                  <p className="text-lg font-semibold text-white">
                                    {new Date(enrollment.joined_at).toLocaleDateString("id-ID")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {students.length > 5 && (
                        <div className="text-center pt-6">
                          <Link href={`/dashboard/guru/rooms/${roomId}/students`}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="group font-bold px-8 py-4 rounded-xl border-2 border-teal-600 text-teal-700 bg-transparent hover:bg-teal-600 hover:text-white transition-all duration-300 text-lg shadow-lg">
                                <span>Lihat {students.length - 5} murid lainnya</span>
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                              </Button>
                            </motion.div>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="text-center py-20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
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
                        Bagikan kode kelas <span className="font-bold text-teal-600">{room.code}</span> kepada murid untuk bergabung
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-transparent p-8">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <motion.div 
                    className="p-2 rounded-xl bg-gray-200"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <BarChart3 className="h-6 w-6 text-gray-700" />
                  </motion.div>
                  <span>Statistik Kelas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {[
                  { value: students?.length || 0, label: "Total Murid", color: "from-teal-600 to-teal-700", bg: "from-teal-50 to-teal-100/50" },
                  { value: completedProgress, label: "Progress Selesai", color: "from-yellow-400 to-yellow-500", bg: "from-yellow-50 to-yellow-100/50" },
                  { value: `${totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0}%`, label: "Tingkat Kemajuan", color: "from-green-500 to-green-600", bg: "from-green-50 to-green-100/50" }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className={`text-center p-6 bg-gradient-to-br ${stat.bg} rounded-2xl border-2 border-opacity-50`}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-700 font-semibold uppercase tracking-wide">{stat.label}</div>
                    <motion.div 
                      className={`mt-4 h-2 bg-gradient-to-r ${stat.color} rounded-full`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}