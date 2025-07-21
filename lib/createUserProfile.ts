import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Inserts/updates the `public.app_users` row for a freshly‑signed‑up user.
 * Returns `{ data, error }` so the caller can act on failures.
 */
export async function createUserProfile (
  supabase: SupabaseClient,
  user: User | null
) {
  if (!user) {
    console.error('❌ createUserProfile called with `null` user')
    return { data: null, error: new Error('User is null') }
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    is_premium: false,
    goal_focus: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    last_active: new Date().toISOString(),
  }

  console.log('👉 Inserting user profile payload:', payload)

  const { data, error } = await supabase
    .from('app_users')
    .upsert(payload, { onConflict: 'id' })

  if (error) {
    console.error('❌ Failed to insert user profile:', error.message)
  } else {
    console.log('✅ User profile row upserted:', data)
  }

  return { data, error }
} 