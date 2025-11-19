"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, BookOpen, ArrowRight, Mail, RefreshCw, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RegisterSuccessPage() {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-40 -right-20 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Back to Home Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link 
          href="/" 
          className="absolute top-6 left-6 flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition-colors duration-300 font-medium group z-50"
        >
          <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </motion.div>

      <motion.div 
        className="relative w-full max-w-md z-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15
            }
          }
        }}
      >
        {/* Success Card */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95 hover:shadow-3xl transition-all duration-500">
            {/* Header with Gradient */}
            <CardHeader className="relative text-center pb-8 bg-gradient-to-br from-teal-600 to-teal-700 text-white overflow-hidden">
              <div className="absolute inset-0 bg-teal-600/20 backdrop-blur-sm"></div>
              
              {/* Success Icon with Pulse Animation */}
              <motion.div 
                className="relative mx-auto mb-4 p-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 w-fit"
                variants={scaleIn}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2 
                  }}
                >
                  <CheckCircle className="h-16 w-16 text-yellow-400" />
                </motion.div>
              </motion.div>

              <CardTitle className="relative text-3xl font-bold mb-2 tracking-tight">
                Pendaftaran Berhasil!
              </CardTitle>
              <CardDescription className="relative text-white/90 text-base font-medium leading-relaxed">
                Selamat bergabung dengan<br />Sign Quran
              </CardDescription>

              {/* Confetti-like elements */}
              <motion.div
                className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full"
                animate={{
                  y: [0, -20, 0],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-4 left-4 w-3 h-3 bg-yellow-400 rounded-full"
                animate={{
                  y: [0, 20, 0],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </CardHeader>

            {/* Content */}
            <CardContent className="p-8 space-y-6">
              {/* Success Messages */}
              <motion.div 
                variants={fadeInUp}
                className="text-center space-y-4"
              >
                <motion.div 
                  className="p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                    <Mail className="h-5 w-5" />
                    <span className="font-semibold">Email Konfirmasi Dikirim</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Kami telah mengirimkan email konfirmasi ke alamat email Anda. 
                    Silakan cek email dan klik link konfirmasi untuk mengaktifkan akun.
                  </p>
                </motion.div>

                <motion.div 
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
                    <RefreshCw className="h-5 w-5" />
                    <span className="font-semibold">Tidak Menerima Email?</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Cek folder spam atau junk mail Anda. Email konfirmasi mungkin 
                    memerlukan waktu beberapa menit untuk sampai.
                  </p>
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="space-y-4 pt-4"
              >
                {/* Go to Login Button */}
                <Link href="/auth/login">
                  <Button className="group relative overflow-hidden w-full h-12 text-white font-bold bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl shadow-lg text-lg">
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <span>Lanjutkan ke Login</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>

                {/* Back to Home Button */}
                <Link href="/">
                  <Button
                    variant="outline"
                    className="group w-full font-semibold border-2 border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 h-12"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Kembali ke Beranda</span>
                      <BookOpen className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info Card */}
        <motion.div variants={fadeInUp}>
          <Card className="mt-6 border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardContent className="p-6 text-center">
              <motion.div 
                className="flex items-center justify-center space-x-2 text-gray-700"
                whileHover={{ scale: 1.02 }}
              >
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Akun Anda sedang dalam proses aktivasi</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}