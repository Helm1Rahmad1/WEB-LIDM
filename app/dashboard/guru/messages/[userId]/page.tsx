"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, User, Clock } from "lucide-react"
import Link from "next/link"

interface Props {
    params: { userId: string }
}

interface Message {
    message_id: number
    sender_id: number
    receiver_id: number
    message: string
    created_at: string
    is_read: boolean
    sender_name: string
    sender_email: string
    receiver_name: string
    receiver_email: string
}

interface UserInfo {
    user_id: number
    name: string
    email: string
    role: string
}

export default function ChatPage({ params }: Props) {
    const { userId } = params
    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [messages, setMessages] = useState<Message[]>([])
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
    const [otherUser, setOtherUser] = useState<UserInfo | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchCurrentUser()
        fetchMessages()

        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000)
        return () => clearInterval(interval)
    }, [userId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchCurrentUser = async () => {
        try {
            const res = await apiClient.get('/api/auth/me')
            setCurrentUser(res.data.user)
        } catch (err) {
            console.error('Fetch current user error:', err)
        }
    }

    const fetchMessages = async () => {
        try {
            setError(null)
            const res = await apiClient.get('/api/messages', {
                params: { conversation_with: userId }
            })
            setMessages(res.data.messages || [])

            // Get other user info from first message
            if (res.data.messages && res.data.messages.length > 0) {
                const firstMsg = res.data.messages[0]
                const isCurrentUserSender = currentUser && firstMsg.sender_id === currentUser.user_id
                setOtherUser({
                    user_id: isCurrentUserSender ? firstMsg.receiver_id : firstMsg.sender_id,
                    name: isCurrentUserSender ? firstMsg.receiver_name : firstMsg.sender_name,
                    email: isCurrentUserSender ? firstMsg.receiver_email : firstMsg.sender_email,
                    role: 'murid'
                })
            } else {
                // Fetch user info if no messages yet
                try {
                    const userRes = await apiClient.get(`/api/users/${userId}`)
                    setOtherUser(userRes.data.user)
                } catch (err) {
                    console.error('Fetch user error:', err)
                }
            }

            // Mark messages as read
            await apiClient.put('/api/messages/mark-conversation-read', {
                sender_id: userId
            })
        } catch (err: any) {
            console.error('Fetch messages error:', err)
            if (err.response?.status === 401) {
                router.push('/auth/login')
                return
            }
            setError(err.response?.data?.error || 'Gagal memuat pesan')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newMessage.trim()) return

        try {
            setIsSending(true)
            await apiClient.post('/api/messages', {
                receiver_id: userId,
                message: newMessage.trim()
            })

            setNewMessage("")
            await fetchMessages()
        } catch (err: any) {
            console.error('Send message error:', err)
            alert(err.response?.data?.error || 'Gagal mengirim pesan')
        } finally {
            setIsSending(false)
        }
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return 'Hari ini'
        if (date.toDateString() === yesterday.toDateString()) return 'Kemarin'
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
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
                    <p className="text-gray-900 font-semibold text-lg">Memuat pesan...</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex flex-col">
            {/* Header */}
            <motion.header
                className="backdrop-blur-lg bg-white/80 shadow-xl border-b border-gray-200/50"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard/guru/messages">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button className="font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white">
                                        <ArrowLeft className="h-5 w-5 mr-2" />
                                        Kembali
                                    </Button>
                                </motion.div>
                            </Link>
                            {otherUser && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg">
                                        {otherUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">{otherUser.name}</h1>
                                        <p className="text-sm text-gray-600">{otherUser.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
                <div className="max-w-5xl mx-auto h-full flex flex-col p-6">
                    <Card className="flex-1 border-0 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden flex flex-col">
                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length > 0 ? (
                                <>
                                    {messages.map((msg, index) => {
                                        const isCurrentUserSender = currentUser && msg.sender_id === currentUser.user_id
                                        const showDateDivider = index === 0 ||
                                            formatDate(messages[index - 1].created_at) !== formatDate(msg.created_at)

                                        return (
                                            <div key={msg.message_id}>
                                                {showDateDivider && (
                                                    <div className="flex items-center justify-center my-4">
                                                        <div className="px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700">
                                                            {formatDate(msg.created_at)}
                                                        </div>
                                                    </div>
                                                )}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[70%] ${isCurrentUserSender ? 'items-end' : 'items-start'} flex flex-col space-y-1`}>
                                                        <div className={`px-4 py-3 rounded-2xl ${isCurrentUserSender
                                                                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                            }`}>
                                                            <p className="text-sm font-medium break-words">{msg.message}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500 px-2">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatTime(msg.created_at)}</span>
                                                            {isCurrentUserSender && msg.is_read && (
                                                                <span className="text-teal-600">✓✓</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )
                                    })}
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600 text-lg">Belum ada pesan</p>
                                        <p className="text-gray-500 text-sm">Mulai percakapan dengan mengirim pesan</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Ketik pesan..."
                                    className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-200 focus:border-teal-500 text-base"
                                    disabled={isSending}
                                />
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        type="submit"
                                        disabled={isSending || !newMessage.trim()}
                                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold shadow-lg disabled:opacity-50"
                                    >
                                        <Send className="h-5 w-5 mr-2" />
                                        {isSending ? 'Mengirim...' : 'Kirim'}
                                    </Button>
                                </motion.div>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
