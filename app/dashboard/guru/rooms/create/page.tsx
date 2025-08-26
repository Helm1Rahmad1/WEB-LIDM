"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

export default function CreateRoomPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("User not authenticated")

      const roomCode = generateRoomCode()

      const { error } = await supabase.from("rooms").insert({
        name,
        description,
        code: roomCode,
        created_by: user.user.id,
      })

      if (error) throw error

      router.push("/dashboard/guru")
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
          <Link href="/dashboard/guru">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-white" />
            <h1 className="text-xl font-bold text-white">Buat Kelas Baru</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: "#2C3E50" }}>Informasi Kelas</CardTitle>
            <CardDescription>Isi informasi untuk membuat kelas baru</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kelas</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: Kelas Hijaiyah Pemula"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-gray-300 focus:border-[#147E7E]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Kelas</Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan tujuan dan materi yang akan dipelajari di kelas ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-gray-300 focus:border-[#147E7E] min-h-[100px]"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Informasi Kode Kelas</h4>
                <p className="text-sm text-blue-700">
                  Kode kelas akan dibuat secara otomatis setelah kelas berhasil dibuat. Murid dapat menggunakan kode ini
                  untuk bergabung ke kelas Anda.
                </p>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

              <div className="flex space-x-4">
                <Link href="/dashboard/guru" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: "#147E7E" }}
                  disabled={isLoading}
                >
                  {isLoading ? "Membuat..." : "Buat Kelas"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
