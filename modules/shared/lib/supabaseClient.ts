// COPY THIS ENTIRE FILE FROM: lib/supabaseClient.ts
// Move the complete contents of lib/supabaseClient.ts into this file 
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Configure Supabase client to use localStorage and enable persistent sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true, // Enable session persistence across browser restarts
    detectSessionInUrl: true
  }
})

// Helper function to create user profile after signup
export async function createUserProfile(user: any) {
  const { data, error } = await supabase.from("app_users").insert([
    {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || "",
      emoji: user.user_metadata?.emoji || "👤",
      color: user.user_metadata?.color || "#6b7280",
      is_premium: false,
      goal_focus: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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