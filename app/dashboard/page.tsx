"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return

    // Wait for auth context to determine if user is authenticated
    if (!authLoading) {
      if (!user) {
        console.log('❌ No user found, redirecting to login')
        setHasRedirected(true)
        window.location.href = '/auth/login'
        return
      }

      console.log('✅ User authenticated:', user.email, 'Role:', user.role)
      
      // Redirect based on user role from auth context
      if (user.role === 'guru') {
        console.log('➡️ Redirecting to guru dashboard')
        setHasRedirected(true)
        window.location.href = '/dashboard/guru'
      } else if (user.role === 'murid') {
        console.log('➡️ Redirecting to murid dashboard')
        setHasRedirected(true)
        window.location.href = '/dashboard/murid'
      } else {
        console.error('❌ Invalid role:', user.role)
        setHasRedirected(true)
        window.location.href = '/auth/login'
      }
    }
  }, [user, authLoading, hasRedirected])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D5DBDB] via-[#D5DBDB] to-[#c8d0d0]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#147E7E] border-t-transparent mb-4"></div>
        <p className="text-lg text-[#2C3E50] font-medium">
          {authLoading ? 'Memuat...' : 'Mengarahkan...'}
        </p>
      </div>
    </div>
  )
}