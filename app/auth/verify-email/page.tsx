'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing')
        return
      }

      try {
        // Use environment variable for API URL
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/verify-email?token=${token}`, {
          method: 'GET',
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error occurred')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  const handleResendVerification = async () => {
    if (!resendEmail) return

    setIsResending(true)
    try {
      // Use environment variable for API URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Verification email sent! Please check your inbox.')
        setResendEmail('')
      } else {
        alert(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Backend call error:', error)
      alert('Failed to connect to backend service')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="w-6 h-6 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {status === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Email verified successfully!'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            {message}
          </p>

          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-green-600 mb-4">
                You will be redirected to login page in a few seconds...
              </p>
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Resend Verification Email
                </h3>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleResendVerification}
                    disabled={!resendEmail || isResending}
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}