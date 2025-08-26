"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

export default function JoinClassPage() {
  const [classCode, setClassCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("User not authenticated")

      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", classCode.toUpperCase())
        .single()

      if (roomError || !room) {
        throw new Error("Kode kelas tidak ditemukan")
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("room_id", room.room_id)
        .single()

      if (existingEnrollment) {
        throw new Error("Anda sudah bergabung dengan kelas ini")
      }

      // Join the class
      const { error: enrollError } = await supabase.from("enrollments").insert({
        user_id: user.user.id,
        room_id: room.room_id,
      })

      if (enrollError) throw enrollError

      setSuccess(`Berhasil bergabung dengan kelas "${room.name}"!`)
      setTimeout(() => {
        router.push("/dashboard/murid")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DBDB" }}>
      {/* Header */}
      <header className="py-4 px-6" style={{ backgroundColor: "#147E7E" }}>
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Link href="/dashboard/murid">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-white" />
            <h1 className="text-xl font-bold text-white">Gabung Kelas</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle style={{ color: "#2C3E50" }}>Masukkan Kode Kelas</CardTitle>
            <CardDescription>Dapatkan kode kelas dari guru Anda untuk bergabung</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinClass} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="classCode">Kode Kelas</Label>
                <Input
                  id="classCode"
                  type="text"
                  placeholder="Masukkan kode kelas (contoh: ABC123)"
                  required
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="border-gray-300 focus:border-[#147E7E] text-center text-lg font-mono"
                  maxLength={10}
                />
                <p className="text-sm text-gray-500">Kode kelas terdiri dari 6 karakter huruf dan angka</p>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

              {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</div>}

              <div className="flex space-x-4">
                <Link href="/dashboard/murid" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: "#147E7E" }}
                  disabled={isLoading || !classCode.trim()}
                >
                  {isLoading ? "Bergabung..." : "Gabung Kelas"}
                </Button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Cara Bergabung Kelas:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Minta kode kelas dari guru Anda</li>
                <li>Masukkan kode kelas di form di atas</li>
                <li>Klik "Gabung Kelas"</li>
                <li>Mulai belajar huruf hijaiyah!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
