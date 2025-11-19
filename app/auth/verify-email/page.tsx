'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Loader2, Mail, AlertCircle, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('Token verifikasi tidak ditemukan')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://signquran.site'}/api/auth/verify-email?token=${token}`, {
          method: 'GET',
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Email berhasil diverifikasi!')
          setTimeout(() => {
            router.push('/auth/login?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verifikasi gagal')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Terjadi kesalahan jaringan')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  const handleResendVerification = async () => {
    if (!resendEmail) return

    setIsResending(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://signquran.site'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Email verifikasi berhasil dikirim! Silakan cek inbox Anda.')
        setResendEmail('')
      } else {
        alert(data.error || 'Gagal mengirim email verifikasi')
      }
    } catch (error) {
      console.error('Backend call error:', error)
      alert('Gagal terhubung ke server')
    } finally {
      setIsResending(false)
    }
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
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="relative w-full max-w-md z-10"
      >
        <motion.div variants={fadeInUp}>
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95">
            {/* Header */}
            <CardHeader className={`relative text-center pb-8 text-white ${
              status === 'loading' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
              status === 'success' ? 'bg-gradient-to-br from-green-600 to-green-700' :
              'bg-gradient-to-br from-red-600 to-red-700'
            }`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              
              {/* Status Icon */}
              <motion.div 
                className="relative mx-auto mb-4 p-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 w-fit"
                variants={scaleIn}
              >
                {status === 'loading' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-12 w-12 text-white" />
                  </motion.div>
                )}
                {status === 'success' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle className="h-12 w-12 text-white" />
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <XCircle className="h-12 w-12 text-white" />
                  </motion.div>
                )}
              </motion.div>

              <CardTitle className="relative text-2xl font-bold mb-2">
                {status === 'loading' && 'Memverifikasi Email'}
                {status === 'success' && 'Email Terverifikasi!'}
                {status === 'error' && 'Verifikasi Gagal'}
              </CardTitle>
              <CardDescription className="relative text-white/90 font-medium">
                {status === 'loading' && 'Mohon tunggu sebentar...'}
                {status === 'success' && 'Akun Anda berhasil diaktifkan'}
                {status === 'error' && 'Terjadi kesalahan verifikasi'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {/* Message */}
              <motion.div variants={fadeInUp}>
                <p className={`text-center text-sm ${
                  status === 'success' ? 'text-green-600' :
                  status === 'error' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {message}
                </p>
              </motion.div>

              {/* Success Content */}
              {status === 'success' && (
                <motion.div variants={fadeInUp} className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <Sparkles className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-600 mb-4">
                      Anda akan diarahkan ke halaman login dalam beberapa detik...
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => router.push('/auth/login')}
                    className="group w-full h-12 text-white font-bold bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl shadow-lg"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Lanjut ke Login</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              )}

              {/* Error Content */}
              {status === 'error' && (
                <motion.div variants={fadeInUp} className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium mb-1">
                          Token mungkin sudah kadaluarsa atau tidak valid
                        </p>
                        <p className="text-xs text-red-600">
                          Silakan kirim ulang email verifikasi
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resend Form */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 text-teal-700" />
                      <span>Kirim Ulang Email Verifikasi</span>
                    </div>
                    <Input
                      type="email"
                      placeholder="Masukkan email Anda"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-teal-600 rounded-xl"
                    />
                    <Button
                      onClick={handleResendVerification}
                      disabled={!resendEmail || isResending}
                      className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                    >
                      {isResending ? (
                        <span className="flex items-center justify-center space-x-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Mengirim...</span>
                        </span>
                      ) : (
                        'Kirim Email Verifikasi'
                      )}
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/auth/login')}
                    className="w-full border-2 border-gray-300 hover:bg-gray-50 rounded-xl"
                  >
                    Kembali ke Login
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl">
          <CardHeader className="text-center bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-t-3xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4"
            >
              <Loader2 className="h-12 w-12" />
            </motion.div>
            <CardTitle>Memuat...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
