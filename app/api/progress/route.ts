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
    const { hijaiyah_id, room_id, status = "belajar" } = body

    if (!hijaiyah_id) {
      return NextResponse.json({ error: "Missing hijaiyah_id" }, { status: 400 })
    }

    // Update practice progress
    const { error: practiceError } = await supabase.from("user_practice_progress").upsert({
      user_id: user.user.id,
      hijaiyah_id,
      status,
      attempts: 1,
      last_update: new Date().toISOString(),
    })

    if (practiceError) {
      console.error("Practice progress error:", practiceError)
      return NextResponse.json({ error: "Failed to update practice progress" }, { status: 500 })
    }

    // Update room-specific progress if room_id is provided
    if (room_id) {
      const { error: roomError } = await supabase.from("user_letter_progress").upsert({
        user_id: user.user.id,
        room_id,
        hijaiyah_id,
        status,
        last_update: new Date().toISOString(),
      })

      if (roomError) {
        console.error("Room progress error:", roomError)
        return NextResponse.json({ error: "Failed to update room progress" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Progress update error:", error)
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
    const hijaiyah_id = searchParams.get("hijaiyah_id")
    const room_id = searchParams.get("room_id")

    if (!hijaiyah_id) {
      return NextResponse.json({ error: "Missing hijaiyah_id" }, { status: 400 })
    }

    // Get practice progress
    const { data: practiceProgress } = await supabase
      .from("user_practice_progress")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("hijaiyah_id", hijaiyah_id)
      .single()

    // Get room progress if room_id is provided
    let roomProgress = null
    if (room_id) {
      const { data } = await supabase
        .from("user_letter_progress")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("room_id", room_id)
        .eq("hijaiyah_id", hijaiyah_id)
        .single()
      roomProgress = data
    }

    return NextResponse.json({
      practiceProgress,
      roomProgress,
    })
  } catch (error) {
    console.error("Progress fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
