"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Calendar, 
  Mail, 
  CheckCircle,
  Circle,
  Clock,
  FileText,
  PlayCircle,
  Star,
  Award,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Props {
  params: { roomId: string; userId: string }
}

interface JilidProgress {
  jilid_id: number
  jilid_name: string
  description: string
  total_letters: number
  completed_letters: number
  percentage: number
  status: 'belum_mulai' | 'belajar' | 'selesai'
  total_pages: number
  completed_pages: number
  pages_status: { [key: number]: 'selesai' | 'belajar' | 'belum_mulai' }
}

// Component untuk menampilkan status halaman (READ-ONLY, tidak bisa edit)
function PageStatusDisplay({ 
  page, 
  status, 
  jilidName
}: { 
  page: number
  status: 'selesai' | 'belajar' | 'belum_mulai'
  jilidName: string
}) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'selesai':
        return {
          label: 'Selesai',
          color: 'bg-green-500 text-white shadow-md',
          hoverColor: 'hover:bg-green-600',
          tooltip: `Halaman ${page} - Sudah Selesai ✅`
        }
      case 'belajar':
        return {
          label: 'Belajar',
          color: 'bg-yellow-500 text-white shadow-md',
          hoverColor: 'hover:bg-yellow-600',
          tooltip: `Halaman ${page} - Sedang Belajar 📚`
        }
      default:
        return {
          label: 'Belum',
          color: 'bg-gray-300 text-gray-600 shadow-sm',
          hoverColor: 'hover:bg-gray-400',
          tooltip: `Halaman ${page} - Belum Dimulai ⚪`
        }
    }
  }

  const statusInfo = getStatusInfo(status)

  return (
    <motion.div
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${statusInfo.color} ${statusInfo.hoverColor} transition-colors`}
      whileHover={{ scale: 1.1 }}
      title={statusInfo.tooltip}
    >
      {page}
    </motion.div>
  )
}

export default function StudentDetailPage({ params }: Props) {
  const { roomId, userId } = params
  const router = useRouter()
  
  const [student, setStudent] = useState<any>(null)
  const [room, setRoom] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [jilidProgress, setJilidProgress] = useState<JilidProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        staggerChildren: 0.1
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('🔍 Fetching data for userId:', userId, 'roomId:', roomId)

        // Fetch room data
        const roomRes = await apiClient.get(`/api/rooms/${roomId}`)
        console.log('✅ Room data:', roomRes.data)
        setRoom(roomRes.data.room)

        // Fetch enrollment data to get student info
        const enrollmentsRes = await apiClient.get(`/api/enrollments`, {
          params: { roomId }
        })
        
        console.log('✅ Enrollments data:', enrollmentsRes.data)
        console.log('🔍 Looking for userId:', userId)
        
        const studentEnrollment = enrollmentsRes.data.enrollments.find(
          (e: any) => String(e.user_id) === String(userId)
        )
        
        if (!studentEnrollment) {
          console.error('❌ Student not found! userId:', userId)
          throw new Error('Student not found in this room')
        }

        console.log('✅ Found student enrollment:', studentEnrollment)

        setStudent({
          user_id: studentEnrollment.user_id,
          name: studentEnrollment.name,
          email: studentEnrollment.email
        })
        
        setEnrollment({
          joined_at: studentEnrollment.joined_at
        })

        // Fetch all jilid data
        const jilidRes = await apiClient.get('/api/jilid')
        const allJilid = jilidRes.data.jilid || []
        console.log('✅ All Jilid:', allJilid)

        // Fetch progress data for this student
        const [letterProgressRes, jilidProgressRes] = await Promise.all([
          apiClient.get('/api/progress/letter', {
            params: { targetUserId: userId, roomId }
          }),
          apiClient.get('/api/progress/jilid', {
            params: { targetUserId: userId, roomId }
          })
        ])

        console.log('✅ Letter Progress:', letterProgressRes.data)
        console.log('✅ Jilid Progress:', jilidProgressRes.data)

        const letterProgress = letterProgressRes.data.progress || []
        const jilidProgressData = jilidProgressRes.data.progress || []

        // Fetch halaman progress for each jilid
        const jilidProgressArray = await Promise.all(
          allJilid.map(async (jilid: any) => {
            try {
              // Fetch halaman data for this jilid to get the real number of pages
              const halamanDataRes = await apiClient.get('/api/halaman', {
                params: { jilidId: jilid.jilid_id }
              })
              
              const halamanData = halamanDataRes.data.halaman || []
              const totalPages = halamanData.length
              
              console.log(`✅ Jilid ${jilid.jilid_id} (${jilid.jilid_name}) has ${totalPages} pages`)
              
              // Skip jilid if it has no pages yet
              if (totalPages === 0) {
                console.log(`⚠️ Skipping Jilid ${jilid.jilid_id} - no pages found in database`)
                return null
              }
              
              // Fetch halaman progress for this specific jilid
              const halamanProgressRes = await apiClient.get(
                `/api/progress/halaman/by-jilid/${jilid.jilid_id}`,
                {
                  params: { targetUserId: userId }
                }
              )
              
              console.log(`✅ Halaman Progress for Jilid ${jilid.jilid_id}:`, halamanProgressRes.data)
              
              const halamanProgress = halamanProgressRes.data.progress || []
              
              // Get letter progress for this jilid
              const lettersInJilid = letterProgress.filter((lp: any) => lp.jilid_id === jilid.jilid_id)
              const completedLetters = lettersInJilid.filter((lp: any) => lp.status === 'selesai').length
              
              // Build pages status object based on real halaman data
              const pagesStatus: { [key: number]: 'selesai' | 'belajar' | 'belum_mulai' } = {}
              
              // Initialize all pages based on real halaman data
              for (let i = 1; i <= totalPages; i++) {
                pagesStatus[i] = 'belum_mulai'
              }
              
              // Update status based on progress data
              let completedPages = 0
              halamanProgress.forEach((hp: any) => {
                const pageNum = hp.nomor_halaman
                if (pageNum >= 1 && pageNum <= totalPages) {
                  if (hp.status === 1) {
                    pagesStatus[pageNum] = 'selesai'
                    completedPages++
                  } else if (hp.status === 0) {
                    pagesStatus[pageNum] = 'belajar'
                  } else {
                    pagesStatus[pageNum] = 'belum_mulai'
                  }
                }
              })

              const percentage = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0
              
              let status: 'belum_mulai' | 'belajar' | 'selesai' = 'belum_mulai'
              if (percentage === 100) {
                status = 'selesai'
              } else if (percentage > 0) {
                status = 'belajar'
              }

              const jilidProgressItem = {
                jilid_id: jilid.jilid_id,
                jilid_name: jilid.jilid_name,
                description: jilid.description || '',
                total_letters: jilid.total_letters || lettersInJilid.length,
                completed_letters: completedLetters,
                percentage,
                status,
                total_pages: totalPages,
                completed_pages: completedPages,
                pages_status: pagesStatus
              }
              
              console.log(`✅ Jilid ${jilid.jilid_id} progress:`, jilidProgressItem)
              
              return jilidProgressItem
            } catch (jilidError: any) {
              console.error(`❌ Error fetching progress for jilid ${jilid.jilid_id}:`, jilidError.message)
              
              // FALLBACK: If API fails, try to use fallback pages (14 for jilid 1-2)
              const fallbackPages = (jilid.jilid_id === 1 || jilid.jilid_id === 2) ? 14 : 0
              
              if (fallbackPages === 0) {
                console.log(`⚠️ Skipping Jilid ${jilid.jilid_id} - no fallback data`)
                return null
              }
              
              console.log(`⚠️ Using FALLBACK for Jilid ${jilid.jilid_id}: ${fallbackPages} pages`)
              
              // Try to fetch halaman progress even if halaman data fetch failed
              try {
                const halamanProgressRes = await apiClient.get(
                  `/api/progress/halaman/by-jilid/${jilid.jilid_id}`,
                  { params: { targetUserId: userId } }
                )
                
                const halamanProgress = halamanProgressRes.data.progress || []
                
                // Build pages status with fallback
                const pagesStatus: { [key: number]: 'selesai' | 'belajar' | 'belum_mulai' } = {}
                for (let i = 1; i <= fallbackPages; i++) {
                  pagesStatus[i] = 'belum_mulai'
                }
                
                let completedPages = 0
                halamanProgress.forEach((hp: any) => {
                  const pageNum = hp.nomor_halaman
                  if (pageNum >= 1 && pageNum <= fallbackPages) {
                    if (hp.status === 1) {
                      pagesStatus[pageNum] = 'selesai'
                      completedPages++
                    } else if (hp.status === 0) {
                      pagesStatus[pageNum] = 'belajar'
                    }
                  }
                })
                
                const percentage = fallbackPages > 0 ? Math.round((completedPages / fallbackPages) * 100) : 0
                let status: 'belum_mulai' | 'belajar' | 'selesai' = 'belum_mulai'
                if (percentage === 100) status = 'selesai'
                else if (percentage > 0) status = 'belajar'
                
                console.log(`✅ Fallback successful for Jilid ${jilid.jilid_id}: ${completedPages}/${fallbackPages} pages`)
                
                return {
                  jilid_id: jilid.jilid_id,
                  jilid_name: jilid.jilid_name,
                  description: jilid.description || '',
                  total_letters: jilid.total_letters || 0,
                  completed_letters: 0,
                  percentage,
                  status,
                  total_pages: fallbackPages,
                  completed_pages: completedPages,
                  pages_status: pagesStatus
                }
              } catch (fallbackError) {
                console.error(`❌ Fallback also failed for jilid ${jilid.jilid_id}:`, fallbackError)
                return null
              }
            }
          })
        )

        // Filter out null values (jilid with no pages or errors)
        const validJilidProgress = jilidProgressArray.filter((jp) => jp !== null) as JilidProgress[]

        console.log('✅ Valid Jilid Progress (after filtering):', validJilidProgress)
        console.log(`📊 Total jilid to display: ${validJilidProgress.length}`)
        
        setJilidProgress(validJilidProgress)
      } catch (err: any) {
        console.error('❌ Fetch student detail error:', err)
        setError(err.response?.data?.error || err.message || 'Gagal memuat data murid')
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId && userId) {
      fetchData()
    }
  }, [roomId, userId, router])

  // Calculate totals
  const totalPages = jilidProgress.reduce((sum, jp) => sum + jp.total_pages, 0)
  const totalCompletedPages = jilidProgress.reduce((sum, jp) => sum + jp.completed_pages, 0)
  const overallPercentage = totalPages > 0 ? Math.round((totalCompletedPages / totalPages) * 100) : 0
  const completedJilid = jilidProgress.filter(jp => jp.status === 'selesai').length
  const totalJilid = jilidProgress.length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-gray-900 font-semibold">Memuat...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !student || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-2xl space-y-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Terjadi Kesalahan</h2>
          <p className="text-red-600 font-medium">{error || 'Data tidak ditemukan'}</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
          >
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-20 backdrop-blur-lg bg-white/80 shadow-xl border-b border-gray-200/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <Link href={`/dashboard/guru/rooms/${room.room_id}/students`}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="group font-semibold px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg">
                    <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                  whileHover={{ rotate: 12, scale: 1.1 }}
                >
                  <User className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent">
                    {student.name}
                  </h1>
                  <div className="flex flex-wrap gap-3 text-sm mt-2">
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
                      <Mail className="h-4 w-4 text-teal-600" />
                      <span className="text-gray-700 font-medium">{student.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <span className="text-gray-700 font-medium">
                        {new Date(enrollment.joined_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.div 
                className="text-center p-4 rounded-2xl bg-white shadow-lg"
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl font-black text-teal-600">{overallPercentage}%</div>
                <div className="text-sm text-gray-600 font-medium">Progress</div>
              </motion.div>
              <motion.div 
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg"
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl font-black text-white">{completedJilid}/{totalJilid}</div>
                <div className="text-sm text-white/90 font-medium">Selesai</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: FileText, value: `${totalCompletedPages}/${totalPages}`, label: "Halaman", color: "from-blue-500 to-blue-600" },
            { icon: Award, value: `${completedJilid}/${totalJilid}`, label: "Jilid", color: "from-purple-500 to-purple-600" },
            { icon: TrendingUp, value: `${overallPercentage}%`, label: "Kemajuan", color: "from-green-500 to-green-600" }
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} whileHover={{ y: -10, scale: 1.02 }}>
              <Card className="border-0 bg-white shadow-xl rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                      <div className="text-sm font-semibold text-gray-700">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Jilid Progress */}
        <Card className="border-0 bg-white/95 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-yellow-50 p-8">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                whileHover={{ rotate: 360 }}
              >
                <BookOpen className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-3xl font-bold">Progress Per Jilid</CardTitle>
                <CardDescription className="text-lg">Klik kotak halaman untuk detail</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <motion.div 
              className="grid gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {jilidProgress.map((jilid, i) => (
                <motion.div key={jilid.jilid_id} variants={fadeInUp}>
                  <Card className="group border-2 border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-teal-300 transition-all rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {i + 1}
                              </div>
                            </motion.div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                {jilid.jilid_name}
                              </h3>
                              <p className="text-gray-600 text-sm">{jilid.description}</p>
                              <div className="flex gap-3 mt-2">
                                <Badge>{jilid.status === 'selesai' ? '✓ Selesai' : jilid.status === 'belajar' ? '⏳ Belajar' : '○ Belum'}</Badge>
                                <span className="text-sm text-gray-600">{jilid.completed_pages}/{jilid.total_pages} halaman</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm font-bold text-teal-600">{jilid.percentage}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${jilid.percentage}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="ml-6">
                          <div className="text-sm font-bold mb-2">Halaman</div>
                          <div className="text-xs text-gray-600 mb-3">💡 Klik kotak</div>
                          <motion.div 
                            className="grid grid-cols-5 gap-2 max-w-[200px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {Array.from({ length: jilid.total_pages }, (_, idx) => {
                              const pageNum = idx + 1
                              const pageStatus = jilid.pages_status[pageNum] || 'belum_mulai'
                              
                              return (
                                <PageStatusDisplay
                                  key={pageNum}
                                  page={pageNum}
                                  status={pageStatus}
                                  jilidName={jilid.jilid_name}
                                />
                              )
                            })}
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}