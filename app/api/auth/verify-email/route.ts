import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Verification token is required' },
      { status: 400 }
    )
  }

  // Use internal backend URL for server-side API calls
  const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:3001';
  const url = `${backendUrl}/auth/verify-email?token=${token}`;

  console.log('Backend URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Verification success:', data);
      return NextResponse.json(data);
    } else {
      console.log('❌ Verification error:', data);
      return NextResponse.json(data, { status: response.status });
    }
  } catch (fetchError) {
    console.error('❌ Backend communication error:', fetchError);
    return NextResponse.json(
      { error: 'Failed to verify email - backend service unavailable' },
      { status: 503 }
    );
  }
}