// This API route is moved to backend server
// Use the backend API at http://localhost:3001/api/tests instead

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ 
    message: "This API route has been moved to backend server at /api/tests" 
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: "This API route has been moved to backend server at /api/tests" 
  })
}
