"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Plus, ArrowRight, Sparkles, Target, BarChart3, LogOut, Calendar, Check } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"

export const dynamic = 'force-dynamic'

export default function GuruDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)

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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login')
        return
      }
      if (user.role !== 'guru') {
        router.replace(`/dashboard/${user.role}`)
        return
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user || user.role !== 'guru') return
      try {
        setLoadingRooms(true)
        const response = await apiClient.get('/api/rooms')
        setRooms(response.data.rooms || [])
      } catch (error) {
        console.error('Error fetching rooms:', error)
        setRooms([])
      } finally {
        setLoadingRooms(false)
      }
    }
    fetchRooms()
  }, [user])

  if (loading || loadingRooms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center">
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
            Memuat dashboard...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (!user || user.role !== 'guru') return null

  const totalStudents = rooms.reduce((sum, r) => sum + (r.student_count || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"
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
          className="absolute bottom-40 -right-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"
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
        <motion.div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-500/3 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
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
                  Dashboard Guru
                </motion.h1>
                <motion.p 
                  className="text-base text-gray-600 font-medium mt-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Selamat datang, <span className="font-bold text-teal-700">{user?.name || user?.email || 'Guru'}</span>
                </motion.p>
              </div>
            </div>

            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/dashboard/guru/rooms/create">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="group font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base">
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Buat Kelas</span>
                  </Button>
                </motion.div>
              </Link>
              <form action="/auth/logout" method="post">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="group font-semibold px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 text-base"
                  >
                    <LogOut className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Keluar</span>
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Cards */}
        <motion.div 
          className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: BookOpen,
              title: "Total Kelas",
              value: rooms?.length || 0,
              subtitle: "Kelas aktif",
              color: "from-teal-600 to-teal-700",
              bgColor: "from-teal-50 to-teal-100/50",
              iconBg: "bg-teal-100",
              iconColor: "text-teal-600"
            },
            {
              icon: Users,
              title: "Total Murid",
              value: totalStudents || 0,
              subtitle: "Murid terdaftar",
              color: "from-yellow-400 to-yellow-500",
              bgColor: "from-yellow-50 to-yellow-100/50",
              iconBg: "bg-yellow-100",
              iconColor: "text-yellow-600"
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
                    className={`p-4 rounded-2xl ${stat.iconBg} shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                  </motion.div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-yellow-50 p-8 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="p-3 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <BarChart3 className="h-7 w-7 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-gray-900">Kelas Saya</CardTitle>
                        <CardDescription className="text-gray-600 text-lg mt-1">
                          Kelola dan pantau progres pembelajaran murid
                        </CardDescription>
                      </div>
                    </div>
                    <Link href="/dashboard/guru/rooms/create">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="group font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base">
                          <Plus className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                          <span>Tambah Kelas</span>
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <AnimatePresence mode="wait">
                    {rooms && rooms.length > 0 ? (
                      <motion.div 
                        className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {rooms.map((room, index) => (
                          <motion.div
                            key={room.room_id}
                            variants={fadeInUp}
                            whileHover="hover"
                            initial="rest"
                          >
                            <Card className="group relative overflow-hidden border-2 border-gray-100 bg-white hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-2 hover:border-teal-300">
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              />
                              <CardHeader className="relative pb-4 p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-300 flex-1">
                                    {room.name}
                                  </CardTitle>
                                  <motion.div 
                                    className="p-2 rounded-xl bg-teal-50 border border-teal-100 group-hover:bg-teal-100"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                  >
                                    <BookOpen className="h-5 w-5 text-teal-600" />
                                  </motion.div>
                                </div>
                                <CardDescription className="text-gray-600 text-sm line-clamp-2">
                                  {room.description || "Tidak ada deskripsi"}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="relative pt-0 p-6 space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                  <div className="flex items-center space-x-3">
                                    <motion.div 
                                      className="p-2 rounded-lg bg-teal-100"
                                      whileHover={{ scale: 1.1, rotate: 12 }}
                                    >
                                      <Target className="h-4 w-4 text-teal-600" />
                                    </motion.div>
                                    <div>
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kode Kelas</span>
                                      <div className="font-mono text-base font-bold text-teal-600">{room.code}</div>
                                    </div>
                                  </div>
                                  <motion.div 
                                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 rounded-xl shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <Users className="h-4 w-4 text-white" />
                                    <span className="font-bold text-white text-base">{room.student_count || 0}</span>
                                  </motion.div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <Link href={`/dashboard/guru/rooms/${room.room_id}`}>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                      <Button className="w-full font-semibold py-2.5 text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm group">
                                        Detail
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                      </Button>
                                    </motion.div>
                                  </Link>
                                  <Link href={`/dashboard/guru/rooms/${room.room_id}/students`}>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                      <Button 
                                        variant="outline"
                                        className="w-full font-semibold py-2.5 border-2 border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white rounded-xl transition-all duration-300 text-sm group"
                                      >
                                        <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                        Murid
                                      </Button>
                                    </motion.div>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
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
                          <BookOpen className="h-20 w-20 mx-auto text-teal-600" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Belum ada kelas</h3>
                        <p className="text-gray-600 mb-10 text-xl max-w-md mx-auto leading-relaxed">
                          Mulai perjalanan mengajar dengan membuat kelas pertama Anda
                        </p>
                        <Link href="/dashboard/guru/rooms/create">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className="group font-bold px-10 py-5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 text-xl">
                              <Plus className="h-6 w-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                              <span>Buat Kelas Pertama</span>
                              <Sparkles className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                            </Button>
                          </motion.div>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
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
                  <span>Ringkasan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {[
                  { value: rooms?.length || 0, label: "Kelas Aktif", color: "from-teal-600 to-teal-700", bg: "from-teal-50 to-teal-100/50", icon: BookOpen },
                  { value: totalStudents || 0, label: "Total Murid", color: "from-yellow-400 to-yellow-500", bg: "from-yellow-50 to-yellow-100/50", icon: Users }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className={`text-center p-6 bg-gradient-to-br ${stat.bg} rounded-2xl border-2 border-opacity-50`}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <motion.div
                      className="mx-auto w-12 h-12 mb-3 rounded-full bg-white/50 flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                    </motion.div>
                    <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-700 font-semibold uppercase tracking-wide">{stat.label}</div>
                    <motion.div 
                      className={`mt-4 h-2 bg-gradient-to-r ${stat.color} rounded-full`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent p-6">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="h-5 w-5 text-teal-600" />
                  </motion.div>
                  <span>Tips Hari Ini</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {[
                  "Pantau progres murid secara berkala",
                  "Berikan feedback yang konstruktif",
                  "Update materi pembelajaran"
                ].map((tip, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <motion.div 
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center mt-0.5 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{tip}</p>
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