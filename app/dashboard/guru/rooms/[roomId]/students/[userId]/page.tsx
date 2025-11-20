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
  Star
} from "lucide-react"
import Link from "next/link"

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

// Component untuk popup halaman
function PagePopup({ 
  page, 
  status, 
  jilidName,
  jilidId,
  userId,
  roomId,
  onStatusChange 
}: { 
  page: number
  status: 'selesai' | 'belajar' | 'belum_mulai'
  jilidName: string
  jilidId: number
  userId: string
  roomId: string
  onStatusChange: (newStatus: 'selesai' | 'belajar' | 'belum_mulai') => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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

  const handleUpdateStatus = async (newStatus: 'selesai' | 'belajar' | 'belum_mulai') => {
    try {
      setIsUpdating(true)
      
      // Update via API
      const halamanId = `${jilidId}-${page}`
      const statusValue = newStatus === 'selesai' ? 1 : newStatus === 'belajar' ? 0 : -1
      
      await apiClient.post('/api/progress/halaman', {
        halamanId,
        status: statusValue,
        targetUserId: userId,
        roomId: parseInt(roomId)
      })

      onStatusChange(newStatus)
      setIsOpen(false)
    } catch (error) {
      console.error('Error updating page status:', error)
      alert('Gagal mengupdate status halaman')
    } finally {
      setIsUpdating(false)
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
            onClick={() => handleUpdateStatus('selesai')}
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={status === 'selesai' || isUpdating}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {status === 'selesai' ? '✅ Sudah Lulus' : '✅ Tandai Lulus'}
          </Button>
          
          <Button 
            onClick={() => handleUpdateStatus('belajar')}
            variant="outline"
            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
            disabled={status === 'belajar' || isUpdating}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {status === 'belajar' ? '📚 Sedang Belajar' : '📚 Tandai Belajar'}
          </Button>

          <Button 
            onClick={() => handleUpdateStatus('belum_mulai')}
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
            disabled={status === 'belum_mulai' || isUpdating}
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
  const { roomId, userId } = params
  const router = useRouter()

  const [student, setStudent] = useState<any>(null)
  const [room, setRoom] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [jilidProgress, setJilidProgress] = useState<JilidProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        console.log('🔍 Available user_ids:', enrollmentsRes.data.enrollments.map((e: any) => e.user_id))
        
        const studentEnrollment = enrollmentsRes.data.enrollments.find(
          (e: any) => String(e.user_id) === String(userId)
        )
        
        if (!studentEnrollment) {
          console.error('❌ Student not found! userId:', userId)
          console.error('Available enrollments:', enrollmentsRes.data.enrollments)
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

        // Fetch progress data for this student using correct query parameters
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
              
              console.log(`✅ Jilid ${jilid.jilid_id} has ${totalPages} pages`)
              
              // Fetch halaman progress for this specific jilid
              const halamanProgressRes = await apiClient.get(
                `/api/progress/halaman/by-jilid/${jilid.jilid_id}/${jilid.jilid_id}`,
                {
                  params: { targetUserId: userId }
                }
              )
              
              console.log(`✅ Halaman Progress for Jilid ${jilid.jilid_id}:`, halamanProgressRes.data)
              
              const halamanProgress = halamanProgressRes.data.progress || []
              
              // Get progress for this jilid
              const jilidProg = jilidProgressData.find((jp: any) => jp.jilid_id === jilid.jilid_id)
              
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

              return {
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
            } catch (jilidError) {
              console.error(`Error fetching progress for jilid ${jilid.jilid_id}:`, jilidError)
              
              // Return default values if fetch fails - use 14 as fallback based on database
              const pagesStatus: { [key: number]: 'selesai' | 'belajar' | 'belum_mulai' } = {}
              const defaultPages = 14
              for (let i = 1; i <= defaultPages; i++) {
                pagesStatus[i] = 'belum_mulai'
              }
              
              return {
                jilid_id: jilid.jilid_id,
                jilid_name: jilid.jilid_name,
                description: jilid.description || '',
                total_letters: jilid.total_letters || 0,
                completed_letters: 0,
                percentage: 0,
                status: 'belum_mulai' as const,
                total_pages: defaultPages,
                completed_pages: 0,
                pages_status: pagesStatus
              }
            }
          })
        )

        console.log('✅ Final Jilid Progress Array:', jilidProgressArray)
        setJilidProgress(jilidProgressArray)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#147E7E] border-t-transparent mb-4"></div>
          <p className="text-lg text-[#2C3E50] font-medium">Memuat data murid...</p>
        </div>
      </div>
    )
  }

  if (error || !student || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0]">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-2xl space-y-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-[#2C3E50]">Terjadi Kesalahan</h2>
          <p className="text-red-600 font-medium">{error || 'Data tidak ditemukan'}</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4 bg-[#147E7E] hover:bg-[#2C3E50] text-white"
          >
            Kembali
          </Button>
        </div>
      </div>
    )
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
                <div className="text-3xl font-black text-[#F1C40F]">{completedJilid}/{jilidProgress.length}</div>
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
                  <div className="text-3xl font-black text-purple-900">{completedJilid}/{jilidProgress.length}</div>
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
                                  jilidId={jilid.jilid_id}
                                  userId={userId}
                                  roomId={roomId}
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