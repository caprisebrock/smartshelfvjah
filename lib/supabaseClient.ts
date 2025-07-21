// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to create user profile after signup
export async function createUserProfile(user: any) {
  const { data, error } = await supabase.from("app_users").insert([
    {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || "",
      is_premium: false,
      goal_focus: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      last_active: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("❌ Error creating user profile:", error.message);
    return { success: false, error };
  } else {
    console.log("✅ User profile inserted:", data);
    return { success: true, data };
  }
} 