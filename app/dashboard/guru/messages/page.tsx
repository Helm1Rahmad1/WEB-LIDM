"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowLeft, Mail, Clock, User, Send } from "lucide-react"
import Link from "next/link"

interface Conversation {
    user_id: number
    name: string
    email: string
    role: string
    last_message: string
    last_message_time: string
    unread_count: number
}

export default function MessagesPage() {
    const router = useRouter()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchConversations()
    }, [])

    const fetchConversations = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const res = await apiClient.get('/api/messages/conversations')
            setConversations(res.data.conversations || [])
        } catch (err: any) {
            console.error('Fetch conversations error:', err)
            if (err.response?.status === 401) {
                router.push('/auth/login')
                return
            }
            setError(err.response?.data?.error || 'Gagal memuat percakapan')
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Baru saja'
        if (diffMins < 60) return `${diffMins} menit lalu`
        if (diffHours < 24) return `${diffHours} jam lalu`
        if (diffDays < 7) return `${diffDays} hari lalu`
        return date.toLocaleDateString('id-ID')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center space-y-4"
                >
                    <div className="w-16 h-16 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
                    <p className="text-gray-900 font-semibold text-lg">Memuat percakapan...</p>
                </motion.div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full p-8 bg-white rounded-3xl shadow-2xl space-y-4 text-center"
                >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Terjadi Kesalahan</h2>
                    <p className="text-red-600 font-medium">{error}</p>
                    <Button onClick={() => location.reload()} className="mt-4 bg-teal-600 hover:bg-teal-700">
                        Coba Lagi
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
            {/* Header */}
            <motion.header
                className="backdrop-blur-lg bg-white/80 shadow-xl border-b border-gray-200/50"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <Link href="/dashboard/guru">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button className="group font-semibold px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg">
                                        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                        Kembali
                                    </Button>
                                </motion.div>
                            </Link>
                            <div className="flex items-center space-x-4">
                                <motion.div
                                    className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg"
                                    whileHover={{ rotate: 12, scale: 1.1 }}
                                >
                                    <MessageSquare className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent">
                                        Pesan
                                    </h1>
                                    <p className="text-base text-gray-600 font-medium mt-1">
                                        {conversations.length} percakapan
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6">
                <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-yellow-50 p-10 border-b">
                        <div className="flex items-center space-x-4">
                            <MessageSquare className="h-8 w-8 text-teal-600" />
                            <div>
                                <CardTitle className="text-3xl font-bold text-gray-900">Daftar Percakapan</CardTitle>
                                <CardDescription className="text-gray-600 text-lg mt-1">
                                    Kelola komunikasi dengan murid Anda
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <AnimatePresence mode="wait">
                            {conversations.length > 0 ? (
                                <motion.div className="space-y-4">
                                    {conversations.map((conv, index) => (
                                        <motion.div
                                            key={conv.user_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link href={`/dashboard/guru/messages/${conv.user_id}`}>
                                                <Card className="group relative overflow-hidden border-2 border-gray-100 bg-white hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1 hover:border-teal-300 cursor-pointer">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-4 flex-1">
                                                                <motion.div
                                                                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                                >
                                                                    {conv.name.charAt(0).toUpperCase()}
                                                                </motion.div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center space-x-3 mb-2">
                                                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                                                            {conv.name}
                                                                        </h3>
                                                                        <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                                                                            {conv.role}
                                                                        </Badge>
                                                                        {conv.unread_count > 0 && (
                                                                            <Badge className="bg-red-500 text-white">
                                                                                {conv.unread_count} baru
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                                                        <Mail className="h-4 w-4" />
                                                                        <span>{conv.email}</span>
                                                                    </div>
                                                                    <p className="text-gray-700 font-medium line-clamp-2">
                                                                        {conv.last_message}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end space-y-2">
                                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span>{formatTime(conv.last_message_time)}</span>
                                                                </div>
                                                                <motion.div whileHover={{ scale: 1.05 }}>
                                                                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                                                                        <Send className="h-4 w-4 mr-2" />
                                                                        Buka Chat
                                                                    </Button>
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="text-center py-20"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <MessageSquare className="h-20 w-20 mx-auto text-teal-600 mb-4" />
                                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Belum ada percakapan</h3>
                                    <p className="text-gray-600 text-xl">
                                        Mulai percakapan dengan murid Anda dari halaman detail murid
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
