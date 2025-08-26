import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: user, error: authError } = await supabase.auth.getUser()

    if (authError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { room_id, hijaiyah_id, score, status } = body

    if (!room_id || !hijaiyah_id || score === undefined || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert test result
    const { data, error } = await supabase.from("letter_tests").insert({
      user_id: user.user.id,
      room_id,
      hijaiyah_id,
      score,
      status,
      tested_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Test result error:", error)
      return NextResponse.json({ error: "Failed to save test result" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: user, error: authError } = await supabase.auth.getUser()

    if (authError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const room_id = searchParams.get("room_id")
    const user_id = searchParams.get("user_id")

    let query = supabase
      .from("letter_tests")
      .select(`
        *,
        hijaiyah(latin_name, arabic_char),
        users(name, email),
        rooms(name)
      `)
      .order("tested_at", { ascending: false })

    if (room_id) {
      query = query.eq("room_id", room_id)
    }

    if (user_id) {
      query = query.eq("user_id", user_id)
    } else {
      // If no specific user_id, only show current user's tests
      query = query.eq("user_id", user.user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error("Test fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch test results" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
