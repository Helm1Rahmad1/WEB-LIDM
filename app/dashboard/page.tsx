import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user role from metadata
  const userRole = data.user.user_metadata?.role || "murid"

  // Redirect based on role
  if (userRole === "guru") {
    redirect("/dashboard/guru")
  } else {
    redirect("/dashboard/murid")
  }
}
