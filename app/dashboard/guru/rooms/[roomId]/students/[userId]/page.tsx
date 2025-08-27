"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Mail, 
  Award, 
  Target, 
  Clock,
  ChevronRight,
  Star,
  CheckCircle,
  Circle,
  Trophy,
  Sparkles,
  BarChart3,
  FileText,
  X,
  PlayCircle
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface Props {
  params: Promise<{ roomId: string; userId: string }>
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

interface PageStatus {
  page: number
  status: 'selesai' | 'belajar' | 'belum_mulai'
  score?: number
}

// Hardcoded data untuk testing
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
    },
    {
      jilid_id: 3,
      jilid_name: "Jilid 3",
      description: "Huruf hijaiyah sambung dan tajwid dasar",
      total_letters: 12,
      completed_letters: 0,
      percentage: 0,
      status: 'belum_mulai' as const,
      total_pages: 12,
      completed_pages: 0,
      pages_status: Object.fromEntries(Array.from({length: 15}, (_, i) => [i + 1, 'belum_mulai' as const]))
    },
    {
      jilid_id: 4,
      jilid_name: "Jilid 4",
      description: "Membaca kata dan kalimat sederhana",
      total_letters: 15,
      completed_letters: 0,
      percentage: 0,
      status: 'belum_mulai' as const,
      total_pages: 15,
      completed_pages: 0,
      pages_status: Object.fromEntries(Array.from({length: 15}, (_, i) => [i + 1, 'belum_mulai' as const]))
    },
    {
      jilid_id: 5,
      jilid_name: "Jilid 5",
      description: "Bacaan panjang dan pendek",
      total_letters: 18,
      completed_letters: 0,
      percentage: 0,
      status: 'belum_mulai' as const,
      total_pages: 18,
      completed_pages: 0,
      pages_status: Object.fromEntries(Array.from({length: 18}, (_, i) => [i + 1, 'belum_mulai' as const]))
    },
    {
      jilid_id: 6,
      jilid_name: "Jilid 6",
      description: "Tajwid dan bacaan Al-Quran",
      total_letters: 20,
      completed_letters: 0,
      percentage: 0,
      status: 'belum_mulai' as const,
      total_pages: 20,
      completed_pages: 0,
      pages_status: Object.fromEntries(Array.from({length: 20}, (_, i) => [i + 1, 'belum_mulai' as const]))
    },
    {
      jilid_id: 7,
      jilid_name: "Jilid 7",
      description: "Mahir membaca Al-Quran",
      total_letters: 17,
      completed_letters: 0,
      percentage: 0,
      status: 'belum_mulai' as const,
      total_pages: 17,
      completed_pages: 0,
      pages_status: Object.fromEntries(Array.from({length: 22}, (_, i) => [i + 1, 'belum_mulai' as const]))
    }
  ]
}

// Component untuk popup halaman
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
          description: 'Siswa belum memulai halaman ini - silakan pilih status',
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
        <div
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110 cursor-pointer
            ${status === 'selesai' 
              ? 'bg-green-500 text-white shadow-md hover:bg-green-600' 
              : status === 'belajar'
              ? 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600'
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
            }
          `}
          title={`Halaman ${page} - Klik untuk ubah status`}
        >
          {page}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
            <span>Halaman {page} - {jilidName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <div className="flex items-center space-x-3 mb-4">
            <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
            <div>
              <h3 className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.title}</h3>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4">
          <Button 
            onClick={() => {
              onStatusChange('selesai')
              setIsOpen(false)
            }}
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={status === 'selesai'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {status === 'selesai' ? '✅ Sudah Lulus' : '✅ Tandai Lulus'}
          </Button>
          
          <Button 
            onClick={() => {
              onStatusChange('belajar')
              setIsOpen(false)
            }}
            variant="outline"
            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
            disabled={status === 'belajar'}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {status === 'belajar' ? '📚 Sedang Belajar' : '📚 Tandai Belajar'}
          </Button>

          <Button 
            onClick={() => {
              onStatusChange('belum_mulai')
              setIsOpen(false)
            }}
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
            disabled={status === 'belum_mulai'}
          >
            <Circle className="h-4 w-4 mr-2" />
            {status === 'belum_mulai' ? '⚪ Sudah Reset' : '⚪ Reset/Belum Mulai'}
          </Button>
        </div>

        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 text-center">
            👨‍🏫 <strong>Pilih status yang sesuai untuk halaman {page}</strong>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function StudentDetailPage({ params }: Props) {
  const [jilidProgress, setJilidProgress] = useState(HARDCODED_STUDENT_DATA.jilidProgress)
  
  // Menggunakan hardcoded data
  const student = HARDCODED_STUDENT_DATA.student
  const room = HARDCODED_STUDENT_DATA.room
  const enrollment = HARDCODED_STUDENT_DATA.enrollment

  // Function to handle status changes
  const handlePageStatusChange = (jilidId: number, page: number, newStatus: 'selesai' | 'belajar' | 'belum_mulai') => {
    setJilidProgress(prev => prev.map(jilid => {
      if (jilid.jilid_id === jilidId) {
        const newPagesStatus = { ...jilid.pages_status, [page]: newStatus }
        const completedPages = Object.values(newPagesStatus).filter(status => status === 'selesai').length
        const percentage = Math.round((completedPages / jilid.total_pages) * 100)
        
        let jilidStatus: 'belum_mulai' | 'belajar' | 'selesai' = 'belum_mulai'
        if (percentage === 100) {
          jilidStatus = 'selesai'
        } else if (percentage > 0) {
          jilidStatus = 'belajar'
        }

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

  // Calculate overall stats
  const totalPages = jilidProgress.reduce((sum, jp) => sum + jp.total_pages, 0)
  const totalCompletedPages = jilidProgress.reduce((sum, jp) => sum + jp.completed_pages, 0)
  const overallPercentage = totalPages > 0 ? Math.round((totalCompletedPages / totalPages) * 100) : 0

  const completedJilid = jilidProgress.filter(jp => jp.status === 'selesai').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#147E7E]/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-[#F1C40F]/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#2C3E50]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-[#147E7E]/6 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header */}
      <header className="relative z-20 backdrop-blur-lg bg-gradient-to-r from-[#147E7E] to-[#147E7E]/90 shadow-2xl border-b border-white/10">
        <div className="absolute inset-0 bg-[#147E7E]/10 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Navigation and Student Info */}
            <div className="flex items-center space-x-6">
              <Link href={`/dashboard/guru/rooms/${room.room_id}/students`}>
                <Button className="group relative overflow-hidden font-semibold px-6 py-3 rounded-xl border-2 border-white/40 text-white bg-white/10 hover:bg-white hover:text-[#147E7E] backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span>Kembali ke Murid</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 group hover:scale-110 transition-transform duration-300">
                  <User className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{student.name}</h1>
                    <div className="px-3 py-1 rounded-full bg-[#F1C40F]/20 border border-[#F1C40F]/30">
                      <Sparkles className="h-4 w-4 text-[#F1C40F]" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm mb-2">
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15">
                      <Mail className="h-4 w-4 text-white" />
                      <span className="text-white/90 font-medium">{student.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15">
                      <Calendar className="h-4 w-4 text-white" />
                      <span className="text-white/90 font-medium">
                        Bergabung {new Date(enrollment.joined_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-white/90 font-medium">Progress pembelajaran dalam {room.name}</p>
                </div>
              </div>
            </div>

            {/* Overall Stats */}
            <div className="flex items-center space-x-4">
              <div className="text-center p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-white">{overallPercentage}%</div>
                <div className="text-sm text-white/80 font-medium">Total Progress</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-[#F1C40F]">{completedJilid}/7</div>
                <div className="text-sm text-white/80 font-medium">Jilid Selesai</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Quick Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-blue-500/10">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-blue-900">{totalCompletedPages}/{totalPages}</div>
                  <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Halaman</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-purple-500/10">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-purple-900">{completedJilid}/7</div>
                  <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Jilid Selesai</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jilid Progress Cards */}
        <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#147E7E]/5 via-transparent to-[#F1C40F]/5 p-8 border-b border-[#D5DBDB]/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-[#147E7E]/10">
                <BookOpen className="h-8 w-8 text-[#147E7E]" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-[#2C3E50]">Progress Per Jilid</CardTitle>
                <CardDescription className="text-[#2C3E50]/70 text-lg">
                  Pantau kemajuan pembelajaran di setiap jilid Hijaiyah (Klik kotak halaman untuk detail)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6">
              {jilidProgress.map((jilid, index) => (
                <Card key={jilid.jilid_id} className="group relative overflow-hidden border-2 border-[#D5DBDB]/30 bg-white hover:shadow-xl transition-all duration-500 rounded-2xl hover:-translate-y-1 hover:border-[#147E7E]/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#147E7E]/3 via-transparent to-[#F1C40F]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#147E7E] to-[#2C3E50] flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {index + 1}
                            </div>
                            {jilid.status === 'selesai' && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                            {jilid.status === 'belajar' && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                                <Clock className="w-3 h-3 text-white" />
                              </div>
                            )}
                            {jilid.status === 'belum_mulai' && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                                <Circle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[#2C3E50] group-hover:text-[#147E7E] transition-colors duration-300 mb-1">
                              {jilid.jilid_name}
                            </h3>
                            <p className="text-[#2C3E50]/60 text-sm mb-2">{jilid.description}</p>
                            <div className="flex items-center space-x-4 mb-3">
                              <Badge 
                                variant={jilid.status === 'selesai' ? 'default' : jilid.status === 'belajar' ? 'secondary' : 'outline'} 
                                className="text-xs font-semibold">
                                {jilid.status === 'selesai' ? '✓ Selesai' : 
                                 jilid.status === 'belajar' ? '⏳ Sedang Belajar' : '○ Belum Mulai'}
                              </Badge>
                              <span className="text-sm text-[#2C3E50]/60">
                                {jilid.completed_letters}/{jilid.total_letters} huruf selesai
                              </span>
                            </div>
                            
                            {/* Page Progress */}
                            <div className="flex items-center space-x-2 mb-3">
                              <FileText className="h-4 w-4 text-[#2C3E50]/50" />
                              <span className="text-sm text-[#2C3E50]/60">
                                {jilid.completed_pages}/{jilid.total_pages} halaman selesai
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-[#2C3E50]">Progress Pembelajaran</span>
                            <span className="text-sm font-bold text-[#147E7E]">{jilid.percentage}%</span>
                          </div>
                          <Progress 
                            value={jilid.percentage} 
                            className="h-3 bg-[#D5DBDB]/30"
                          />
                        </div>
                      </div>

                      {/* Interactive Page Progress Grid */}
                      <div className="ml-6">
                        <div className="flex flex-col items-end">
                          <div className="text-sm font-medium text-[#2C3E50] mb-2">
                            Halaman ({jilid.completed_pages}/{jilid.total_pages})
                          </div>
                          <div className="text-xs text-[#2C3E50]/60 mb-3 text-right">
                            Klik kotak untuk melihat detail
                          </div>
                          <div className="grid grid-cols-5 gap-2 max-w-[200px]">
                            {Array.from({ length: jilid.total_pages }, (_, index) => {
                              const pageNumber = index + 1
                              const pageStatus = jilid.pages_status[pageNumber] || 'belum_mulai'
                              
                              return (
                                <PagePopup
                                  key={pageNumber}
                                  page={pageNumber}
                                  status={pageStatus}
                                  jilidName={jilid.jilid_name}
                                  onStatusChange={(newStatus) => 
                                    handlePageStatusChange(jilid.jilid_id, pageNumber, newStatus)
                                  }
                                />
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}