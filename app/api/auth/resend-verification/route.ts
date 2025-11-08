import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use internal backend URL for server-side API calls
    const backendUrl = process.env.INTERNAL_API_URL || 'https://signquran.site/api';
    const url = `${backendUrl}/auth/resend-verification`;

    console.log('Backend URL:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Success:', data);
        return NextResponse.json(data);
      } else {
        console.log('❌ Backend error:', data);
        return NextResponse.json(data, { status: response.status });
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to communicate with backend service' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}