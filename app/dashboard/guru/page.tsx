"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Award, Plus, ArrowRight, Sparkles, Target, BarChart3, LogOut } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"

export const dynamic = 'force-dynamic'

// Interactive Card with Mouse Tracking
function InteractiveCard({ children, className = "", ...props }: any) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = ((y - centerY) / centerY) * -10
    const rotateYValue = ((x - centerX) / centerX) * 10
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s ease-out',
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// Magnetic Button
function MagneticButton({ children, className = "", ...props }: any) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPosition({ x: x * 0.3, y: y * 0.3 })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.2s ease-out',
      }}
      {...props}
    >
      {children}
    </button>
  )
}

// Mouse Follower
function MouseFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }
    const handleMouseLeave = () => setIsVisible(false)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      <div
        className="fixed pointer-events-none z-50 transition-opacity duration-300"
        style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)', opacity: isVisible ? 0.5 : 0 }}
      >
        <div className="w-8 h-8 rounded-full bg-teal-500/30 blur-xl animate-pulse" />
      </div>
      <div
        className="fixed pointer-events-none z-40 transition-all duration-700 ease-out"
        style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)', opacity: isVisible ? 0.3 : 0 }}
      >
        <div className="w-16 h-16 rounded-full bg-yellow-500/20 blur-2xl" />
      </div>
    </>
  )
}

export default function GuruDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-orange-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'guru') return null

  const totalStudents = rooms.reduce((sum, r) => sum + (r.student_count || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-orange-50/30 to-purple-50/20 relative overflow-hidden">
      <MouseFollower />

      {/* Animated Background with Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl transition-transform duration-500 ease-out"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        />
        <div 
          className="absolute bottom-40 -right-20 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl transition-transform duration-700 ease-out"
          style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
        />
      </div>

      {/* Header - Colorful */}
      <header className="relative z-20 backdrop-blur-lg bg-gradient-to-r from-teal-600 to-cyan-600 shadow-2xl border-b border-white/10">
        <div className="absolute inset-0 bg-teal-600/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 group hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Guru</h1>
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
                <p className="text-sm text-white/90 font-medium">
                  Selamat datang, <span className="text-yellow-400 font-bold">{user?.name || user?.email || 'Guru'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/dashboard/guru/rooms/create">
                <MagneticButton className="group relative overflow-hidden font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 hover:from-yellow-500 hover:to-orange-500 text-gray-900 shadow-lg hover:shadow-xl border-0">
                  <Plus className="h-5 w-5 mr-2 inline-block group-hover:rotate-180 transition-transform duration-500" />
                  <span>Buat Kelas</span>
                </MagneticButton>
              </Link>
              <form action="/auth/logout" method="post">
                <MagneticButton
                  type="submit"
                  className="group font-semibold px-5 py-3 rounded-xl border-2 border-white/40 text-white bg-white/10 hover:bg-white hover:text-teal-700 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="h-4 w-4 mr-2 inline-block" />
                  <span>Keluar</span>
                </MagneticButton>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Colorful Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Kelas - Teal */}
          <InteractiveCard className="group relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 p-6">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-gray-600 uppercase tracking-wide">Total Kelas</CardTitle>
                <div className="text-3xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  {rooms?.length || 0}
                </div>
                <p className="text-xs text-gray-500 font-medium">Kelas aktif</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
          </InteractiveCard>

          {/* Total Murid - Yellow/Orange */}
          <InteractiveCard className="group relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 p-6">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-gray-600 uppercase tracking-wide">Total Murid</CardTitle>
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {totalStudents || 0}
                </div>
                <p className="text-xs text-gray-500 font-medium">Murid terdaftar</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
          </InteractiveCard>

          {/* Tes Selesai - Purple/Pink */}
          <InteractiveCard className="group relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 p-6">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tes Selesai</CardTitle>
                <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  0
                </div>
                <p className="text-xs text-gray-500 font-medium">Evaluasi lengkap</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
          </InteractiveCard>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="border-0 bg-white shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 via-orange-50/30 to-purple-50/20 p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-2xl font-bold text-gray-900">Kelas Saya</CardTitle>
                      <BarChart3 className="h-5 w-5 text-teal-700" />
                    </div>
                    <CardDescription className="text-gray-600 text-sm">
                      Kelola dan pantau progres pembelajaran murid
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/guru/rooms/create">
                    <MagneticButton className="group font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white transition-all duration-300 hover:scale-105 shadow-lg border-0">
                      <Plus className="h-4 w-4 mr-2 inline-block group-hover:rotate-180 transition-transform duration-500" />
                      <span>Tambah Kelas</span>
                    </MagneticButton>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {rooms && rooms.length > 0 ? (
                  <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
                    {rooms.map((room) => (
                      <InteractiveCard key={room.room_id} className="group relative overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all duration-500 rounded-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <CardHeader className="relative pb-4 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors duration-300">
                              {room.name}
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 group-hover:from-teal-200 group-hover:to-cyan-200 transition-colors duration-300">
                              <BookOpen className="h-4 w-4 text-teal-700" />
                            </div>
                          </div>
                          <CardDescription className="text-gray-600 text-sm">
                            {room.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative pt-0 p-5 space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-teal-50/30 rounded-xl">
                            <div className="flex items-center space-x-2">
                              <Target className="h-3 w-3 text-teal-700" />
                              <div>
                                <span className="text-xs font-semibold text-gray-500">KODE</span>
                                <div className="font-mono text-sm font-bold text-teal-700">{room.code}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                              <Users className="h-4 w-4 text-orange-600" />
                              <span className="font-bold text-sm">{room.student_count || 0}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Link href={`/dashboard/guru/rooms/${room.room_id}`}>
                              <MagneticButton className="w-full font-semibold py-2 text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg shadow-md text-sm border-0">
                                Detail
                                <ArrowRight className="h-4 w-4 ml-1 inline-block" />
                              </MagneticButton>
                            </Link>
                            <Link href={`/dashboard/guru/rooms/${room.room_id}/students`}>
                              <MagneticButton className="w-full font-semibold py-2 border-2 border-teal-600 text-teal-700 hover:bg-gradient-to-r hover:from-teal-600 hover:to-cyan-600 hover:text-white hover:border-transparent rounded-lg text-sm bg-white">
                                <Users className="h-4 w-4 mr-1 inline-block" />
                                Murid
                              </MagneticButton>
                            </Link>
                          </div>
                        </CardContent>
                      </InteractiveCard>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum ada kelas</h3>
                    <p className="text-gray-600 mb-8 text-base max-w-md mx-auto">
                      Mulai perjalanan mengajar dengan membuat kelas pertama
                    </p>
                    <Link href="/dashboard/guru/rooms/create">
                      <MagneticButton className="font-bold px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg border-0">
                        <Plus className="h-5 w-5 mr-2 inline-block" />
                        Buat Kelas Pertama
                      </MagneticButton>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Colorful */}
          <div className="space-y-6">
            <Card className="border-0 bg-white shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-teal-50/30 p-5">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-gray-700" />
                  <span>Ringkasan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <InteractiveCard className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                  <div className="text-3xl font-black text-teal-700 mb-1">{rooms?.length || 0}</div>
                  <div className="text-xs text-gray-600 font-semibold uppercase">Kelas Aktif</div>
                </InteractiveCard>
                <InteractiveCard className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-orange-100">
                  <div className="text-3xl font-black text-orange-600 mb-1">{totalStudents || 0}</div>
                  <div className="text-xs text-gray-600 font-semibold uppercase">Total Murid</div>
                </InteractiveCard>
                <InteractiveCard className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="text-3xl font-black text-green-600 mb-1">100%</div>
                  <div className="text-xs text-gray-600 font-semibold uppercase">Kepuasan</div>
                </InteractiveCard>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}