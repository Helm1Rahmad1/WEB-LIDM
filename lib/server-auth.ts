'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// This function checks if the user is authenticated by making an API call to the backend
export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get('token')?.value
  
  if (!token) {
    return false
  }

  try {
    // Make a server-side API call to validate the token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://signquran.site'}/api/auth/me`, {
      headers: {
        'Cookie': `token=${token}`,
      },
      cache: 'no-store' // Don't cache this request
    })

    return response.ok
  } catch (error) {
    console.error('Error validating token:', error)
    return false
  }
}

// This function gets the current user by making an API call to the backend
export async function getCurrentUser() {
  const token = cookies().get('token')?.value
  
  if (!token) {
    return null
  }

  try {
    // Make a server-side API call to get user info
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://signquran.site'}/api/auth/me`, {
      headers: {
        'Cookie': `token=${token}`,
      },
      cache: 'no-store' // Don't cache this request
    })

    if (response.ok) {
      const data = await response.json()
      return data.user
    }
    
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// This function redirects to login if user is not authenticated
export async function requireAuth(redirectPath: string = '/auth/login') {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    redirect(redirectPath)
  }
}

// This function redirects based on user role
export async function requireRole(roles: string[], redirectPath: string = '/auth/login') {
  const user = await getCurrentUser()
  
  if (!user || !roles.includes(user.role)) {
    redirect(redirectPath)
  }
  
  return user
}