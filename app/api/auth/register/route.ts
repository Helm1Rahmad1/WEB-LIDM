import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Validasi input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Use internal backend URL for server-side API calls
    const backendUrl = process.env.INTERNAL_API_URL || 'https://signquran.site/api';
    const url = `${backendUrl}/auth/register`;

    console.log('🔗 Calling backend URL:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Registration success:', data);
        return NextResponse.json(data, { status: 201 });
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
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}