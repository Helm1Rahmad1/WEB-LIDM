import { NextRequest, NextResponse } from 'next/server'

// Disable middleware temporarily - we'll handle auth on client side
export function middleware(request: NextRequest) {
  // Allow all requests to pass through
  return NextResponse.next()
}

// Apply middleware only to dashboard routes
export const config = {
  matcher: '/dashboard/:path*',
}