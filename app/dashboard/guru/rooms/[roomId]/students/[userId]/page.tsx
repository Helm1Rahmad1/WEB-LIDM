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

const HARDCODED_STUDENT_DATA = {
  student: {
    user_id: "123",
    name: "Helmi",
    email: "helmirahmadi@gmail.com"
  },
  room: {
    room_id: 1,
    name: "Kelas Hijaiyah A",
    description: "Kelas belajar huruf hijaiyah untuk pemula"
  },
  enrollment: {
    joined_at: "2025-08-01T10:30:00Z"
  },
  jilidProgress: [
    {
      jilid_id: 1,
      jilid_name: "Jilid 1",
      description: "Pengenalan huruf hijaiyah dasar",
      total_letters: 10,
      completed_letters: 8,
      percentage: 80,
      status: 'belajar' as const,
      total_pages: 10,
      completed_pages: 7,
      pages_status: {
        1: 'selesai' as const,
        2: 'selesai' as const,
        3: 'selesai' as const,
        4: 'selesai' as const,
        5: 'selesai' as const,
        6: 'belajar' as const,
        7: 'belajar' as const,
        8: 'belum_mulai' as const,
        9: 'belum_mulai' as const,
        10: 'belum_mulai' as const,
      }
    },
    {
      jilid_id: 2,
      jilid_name: "Jilid 2",
      description: "Lanjutan huruf hijaiyah dengan harakat",
      total_letters: 8,
      completed_letters: 0,
      percentage: 0,
      status: 'belum_mulai' as const,
      total_pages: 8,
      completed_pages: 0,
      pages_status: Object.fromEntries(Array.from({length: 15}, (_, i) => [i + 1, 'belum_mulai' as const]))
    }
  ]
}

function PagePopup({ 
  page, 
  status, 
  jilidName, 
  onStatusChange 
}: { 
  page: number
  status: 'selesai' | 'belajar' | 'belum_mulai'
  jilidName: string
  onStatusChange: (newStatus: 'selesai' | 'belajar' | 'belum_mulai') => void 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'selesai':
        return {
          title: '✅ Halaman Selesai',
          description: 'Siswa telah menyelesaikan halaman ini dengan baik',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle
        }
      case 'belajar':
        return {
          title: '📚 Sedang Belajar',
          description: 'Siswa sedang mempelajari materi di halaman ini',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: PlayCircle
        }
      default:
        return {
          title: '⚪ Belum Dimulai',
          description: 'Siswa belum memulai halaman ini',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Circle
        }
    }
  }

  const statusInfo = getStatusInfo(status)
  const StatusIcon = statusInfo.icon

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer
            ${status === 'selesai' 
              ? 'bg-green-500 text-white shadow-lg' 
              : status === 'belajar'
              ? 'bg-yellow-500 text-white shadow-lg'
              : 'bg-gray-300 text-gray-600 shadow-md'
            }
          `}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          title={`Halaman ${page} - Klik untuk ubah status`}
        >
          {page}
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
            <span>Halaman {page} - {jilidName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <motion.div 
          className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
            <div>
              <h3 className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.title}</h3>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-2 mt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => {
                onStatusChange('selesai')
                setIsOpen(false)
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
              disabled={status === 'selesai'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {status === 'selesai' ? '✅ Sudah Lulus' : '✅ Tandai Lulus'}
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => {
                onStatusChange('belajar')
                setIsOpen(false)
              }}
              variant="outline"
              className="w-full border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
              disabled={status === 'belajar'}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              {status === 'belajar' ? '📚 Sedang Belajar' : '📚 Tandai Belajar'}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => {
                onStatusChange('belum_mulai')
                setIsOpen(false)
              }}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              disabled={status === 'belum_mulai'}
            >
              <Circle className="h-4 w-4 mr-2" />
              {status === 'belum_mulai' ? '⚪ Sudah Reset' : '⚪ Reset'}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function StudentDetailPage({ params }: Props) {
  const [jilidProgress, setJilidProgress] = useState(HARDCODED_STUDENT_DATA.jilidProgress)
  const [isLoading, setIsLoading] = useState(false)
  const [student, setStudent] = useState(HARDCODED_STUDENT_DATA.student)
  const [room, setRoom] = useState(HARDCODED_STUDENT_DATA.room)
  const [enrollment, setEnrollment] = useState(HARDCODED_STUDENT_DATA.enrollment)
  const { roomId, userId } = params

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

  const handlePageStatusChange = (jilidId: number, page: number, newStatus: 'selesai' | 'belajar' | 'belum_mulai') => {
    setJilidProgress(prev => prev.map(jilid => {
      if (jilid.jilid_id === jilidId) {
        const newPagesStatus = { ...jilid.pages_status, [page]: newStatus }
        const completedPages = Object.values(newPagesStatus).filter(s => s === 'selesai').length
        const percentage = Math.round((completedPages / jilid.total_pages) * 100)
        
        let jilidStatus: 'belum_mulai' | 'belajar' | 'selesai' = 'belum_mulai'
        if (percentage === 100) jilidStatus = 'selesai'
        else if (percentage > 0) jilidStatus = 'belajar'

        return {
          ...jilid,
          pages_status: newPagesStatus,
          completed_pages: completedPages,
          percentage,
          status: jilidStatus
        }
      }
      return jilid
    }))
  }

  const totalPages = jilidProgress.reduce((sum, jp) => sum + jp.total_pages, 0)
  const totalCompletedPages = jilidProgress.reduce((sum, jp) => sum + jp.completed_pages, 0)
  const overallPercentage = totalPages > 0 ? Math.round((totalCompletedPages / totalPages) * 100) : 0
  const completedJilid = jilidProgress.filter(jp => jp.status === 'selesai').length

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
                <div className="text-3xl font-black text-white">{completedJilid}/7</div>
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
            { icon: Award, value: `${completedJilid}/7`, label: "Jilid", color: "from-purple-500 to-purple-600" },
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
                                <PagePopup
                                  key={pageNum}
                                  page={pageNum}
                                  status={pageStatus}
                                  jilidName={jilid.jilid_name}
                                  onStatusChange={(newStatus) => 
                                    handlePageStatusChange(jilid.jilid_id, pageNum, newStatus)
                                  }
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