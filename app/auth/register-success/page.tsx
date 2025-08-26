import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#D5DBDB" }}>
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-6" style={{ backgroundColor: "#147E7E", color: "white" }}>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12" style={{ color: "#F1C40F" }} />
            </div>
            <CardTitle className="text-2xl font-bold">Pendaftaran Berhasil!</CardTitle>
            <CardDescription className="text-gray-100">Silakan cek email untuk konfirmasi</CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Kami telah mengirimkan email konfirmasi ke alamat email Anda. Silakan cek email dan klik link konfirmasi
              untuk mengaktifkan akun.
            </p>
            <p className="text-xs text-gray-500">Tidak menerima email? Cek folder spam atau junk mail Anda.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
