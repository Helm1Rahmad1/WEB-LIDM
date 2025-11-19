import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, BookOpen, ArrowRight, Mail, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#147E7E]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F1C40F]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2C3E50]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-[#147E7E] hover:text-[#2C3E50] transition-colors duration-300 font-medium"
      >
        <ArrowRight className="h-5 w-5 rotate-180" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="relative w-full max-w-md z-10">
        {/* Success Card */}
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95 hover:shadow-3xl transition-all duration-500">
          {/* Header with Gradient */}
          <CardHeader className="relative text-center pb-8 bg-gradient-to-br from-[#147E7E] to-[#147E7E]/90 text-white">
            <div className="absolute inset-0 bg-[#147E7E]/20 backdrop-blur-sm"></div>
            
            {/* Success Icon */}
            <div className="relative mx-auto mb-4 p-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 w-fit">
              <CheckCircle className="h-16 w-16 text-[#F1C40F]" />
            </div>

            <CardTitle className="relative text-3xl font-bold mb-2 tracking-tight">
              Pendaftaran Berhasil!
            </CardTitle>
            <CardDescription className="relative text-white/90 text-base font-medium leading-relaxed">
              Selamat bergabung dengan<br />Sign Quran
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-8 space-y-6">
            {/* Success Message */}
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                  <Mail className="h-5 w-5" />
                  <span className="font-semibold">Email Konfirmasi Dikirim</span>
                </div>
                <p className="text-sm text-green-600">
                  Kami telah mengirimkan email konfirmasi ke alamat email Anda. 
                  Silakan cek email dan klik link konfirmasi untuk mengaktifkan akun.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
                  <RefreshCw className="h-5 w-5" />
                  <span className="font-semibold">Tidak Menerima Email?</span>
                </div>
                <p className="text-sm text-blue-600">
                  Cek folder spam atau junk mail Anda. Email konfirmasi mungkin 
                  memerlukan waktu beberapa menit untuk sampai.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              {/* Go to Login Button */}
              <Link href="/auth/login">
                <Button className="group relative overflow-hidden w-full h-12 text-[#2C3E50] font-bold bg-[#F1C40F] hover:bg-[#147E7E] hover:text-white transition-all duration-300 hover:scale-105 rounded-xl shadow-lg hover:shadow-xl text-lg">
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Lanjutkan ke Login</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>

              {/* Back to Home Button */}
              <Link href="/">
                <Button
                  variant="outline"
                  className="group w-full font-semibold border-2 border-[#147E7E] text-[#147E7E] hover:bg-[#147E7E] hover:text-white transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 h-12"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Kembali ke Beranda</span>
                    <BookOpen className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="mt-6 border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-[#2C3E50]/70">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Akun Anda sedang dalam proses aktivasi</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}