"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Award, ArrowRight, Eye, Target, Check, Smartphone, GraduationCap, BarChart3, MessageSquare, Sparkles, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import Image from 'next/image'
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState, useRef } from "react"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const fadeInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Enhanced Animated Background Elements with Parallax */}
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
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
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
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`
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

      {/* Header with Glass Effect */}
      <motion.header 
        className="relative z-50 py-4 px-6 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="p-2 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <BookOpen className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent">
                Sign Quran
              </h1>
              <p className="text-xs text-gray-600 font-medium">Platform Pembelajaran Inklusif</p>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="group text-gray-700 hover:text-teal-700 hover:bg-teal-50 transition-all duration-300 font-semibold"
                >
                  Masuk
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="group bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                  Daftar Gratis
                  <Sparkles className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Parallax */}
      <motion.section 
        ref={heroRef}
        className="relative z-10 py-16 md:py-24 px-6"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center space-x-2 bg-teal-50 rounded-full px-4 py-2 mb-6 border border-teal-200 shadow-sm"
                whileHover={{ scale: 1.05, shadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
              >
                <Eye className="h-4 w-4 text-teal-700" />
                <span className="text-sm font-semibold text-teal-800">Platform Pembelajaran Visual</span>
              </motion.div>

              <motion.h2 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                Belajar Al-Qur'an
                <span className="block bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent mt-2">
                  untuk Tunarungu
                </span>
              </motion.h2>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl mb-8 text-gray-600 leading-relaxed"
              >
                Platform pembelajaran inklusif dengan metode visual yang mudah dipahami. 
                Tersedia untuk <span className="font-semibold text-teal-700">Guru</span> dan <span className="font-semibold text-teal-700">Murid</span> dengan aplikasi mobile yang interaktif.
              </motion.p>

              {/* Feature Highlights with Enhanced Animation */}
              <motion.div 
                variants={fadeInUp}
                className="space-y-3 mb-8"
              >
                {[
                  "Pembelajaran Jilid 1-6 secara bertahap",
                  "Kelas virtual untuk guru & murid",
                  "Tersedia di Web & Aplikasi Mobile",
                  "Evaluasi & tracking progres real-time"
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    variants={fadeInUp}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="h-4 w-4 text-teal-700" />
                    </motion.div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/auth/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      className="group bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-base w-full sm:w-auto"
                    >
                      Mulai Belajar Sekarang
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="#features">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline"
                      size="lg" 
                      className="group border-2 border-gray-300 text-gray-700 hover:border-teal-600 hover:bg-teal-50 font-bold px-8 py-6 rounded-xl transition-all duration-300 text-base w-full sm:w-auto"
                    >
                      Pelajari Fitur
                      <Target className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Mockup - MAINTAINED ALL ORIGINAL ANIMATIONS */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
              className="relative"
            >
              {/* Main Floating Phone Animation - PRESERVED */}
              <motion.div 
                className="relative z-10"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="relative mx-auto w-full max-w-sm">
                  {/* Glow Effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-yellow-500/20 rounded-[3rem] blur-3xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Phone Image */}
                  {!imageError ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src="/phone.png"
                        alt="Sign Quran Mobile App"
                        width={400}
                        height={800}
                        className="relative z-10 drop-shadow-2xl rounded-[3rem]"
                        priority
                        onError={() => setImageError(true)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="relative z-10 bg-white rounded-[3rem] shadow-2xl p-8 aspect-[9/16] flex items-center justify-center border-8 border-gray-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-center">
                        <Smartphone className="h-20 w-20 text-teal-600 mx-auto mb-4" />
                        <p className="text-gray-600 font-semibold">Sign Quran Mobile App</p>
                        <p className="text-sm text-gray-400 mt-2">Mockup Preview</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Floating Elements - PRESERVED WITH ENHANCEMENTS */}
              <motion.div
                className="absolute top-10 -right-10 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                animate={{
                  y: [0, 15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Smartphone className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Tersedia di</p>
                    <p className="font-bold text-gray-800">Mobile App</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-20 -left-10 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Award className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pembelajaran</p>
                    <p className="font-bold text-gray-800">Interaktif</p>
                  </div>
                </div>
              </motion.div>

              {/* NEW: Additional Floating Badge */}
              <motion.div
                className="absolute top-1/2 -left-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-2xl p-3 border-2 border-white"
                animate={{
                  x: [0, 10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                whileHover={{ scale: 1.15 }}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-white" />
                  <span className="text-white font-bold text-sm">Real-time</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section Khusus untuk Guru */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center space-x-2 bg-white rounded-full px-5 py-2 mb-6 border border-teal-200 shadow-sm"
              whileHover={{ scale: 1.05 }}
            >
              <GraduationCap className="h-5 w-5 text-teal-700" />
              <span className="font-bold text-teal-800">Fitur untuk Guru</span>
            </motion.div>
            
            <motion.h3 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Kelola Pembelajaran dengan Mudah
            </motion.h3>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Platform lengkap untuk guru dalam memantau dan mengelola pembelajaran Al-Qur'an murid tunarungu
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Users,
                color: "from-teal-500 to-teal-600",
                title: "Manajemen Kelas",
                description: "Buat dan kelola kelas virtual, tambahkan murid, dan atur materi pembelajaran dengan mudah"
              },
              {
                icon: BarChart3,
                color: "from-blue-500 to-blue-600",
                title: "Monitoring Progres",
                description: "Pantau perkembangan setiap murid secara real-time dengan dashboard yang komprehensif"
              },
              {
                icon: MessageSquare,
                color: "from-purple-500 to-purple-600",
                title: "Evaluasi & Feedback",
                description: "Berikan tes, evaluasi hasil belajar, dan feedback personal untuk setiap murid"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white h-full group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative text-center pb-4">
                    <motion.div 
                      className={`mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br ${feature.color} w-fit shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h3 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Fitur Pembelajaran Lengkap
            </motion.h3>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Semua yang dibutuhkan untuk pembelajaran Al-Qur'an yang efektif dan menyenangkan
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: BookOpen,
                title: "Pembelajaran Jilid",
                description: "Belajar huruf hijaiyah secara bertahap dari jilid 1 hingga 6 dengan metode visual yang interaktif"
              },
              {
                icon: Users,
                title: "Kelas Virtual",
                description: "Guru dapat membuat kelas dan memantau progres belajar setiap murid secara real-time"
              },
              {
                icon: Award,
                title: "Tes & Evaluasi",
                description: "Sistem tes per huruf dan jilid untuk mengukur kemampuan dan progres pembelajaran"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white h-full group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative text-center pb-4">
                    <motion.div 
                      className="mx-auto mb-4 p-4 rounded-2xl bg-teal-50 border-2 border-teal-100 w-fit"
                      whileHover={{ scale: 1.1, borderColor: "#14b8a6" }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="h-8 w-8 text-teal-700" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section with Enhanced Animation */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl overflow-hidden">
              <CardContent className="p-12 md:p-16 text-center text-white relative">
                {/* Animated Background Pattern */}
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "30px 30px"
                  }}
                />
                
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                    className="mb-6 mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
                  >
                    <BookOpen className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-3xl md:text-4xl font-bold mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    Siap Memulai Perjalanan Belajar?
                  </motion.h3>
                  
                  <motion.p 
                    className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    Bergabunglah dengan komunitas guru dan murid yang telah merasakan kemudahan belajar Al-Qur'an
                  </motion.p>
                  
                  <Link href="/auth/register">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg"
                        className="group bg-white hover:bg-gray-50 text-teal-700 font-bold px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                      >
                        Daftar Sekarang - Gratis
                        <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Sign Quran</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Platform pembelajaran Al-Qur'an untuk tunarungu yang inklusif dan bermakna
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Web Application</li>
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Mobile App (iOS & Android)</li>
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Dashboard Guru</li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-bold text-white mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Pembelajaran Jilid 1-6</li>
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Kelas Virtual</li>
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Evaluasi & Tes</li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div 
            className="border-t border-gray-800 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-400 text-sm">
              © 2024 Sign Quran. Membangun masa depan pembelajaran yang inklusif.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}