import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ [useUser] Error getting session:', sessionError);
          setError('Failed to get authentication session');
          setUser(null);
        } else {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          // Log user state for debugging
          if (currentUser) {
            console.log('✅ [useUser] User authenticated:', currentUser.id);
          } else {
            console.log('👤 [useUser] No authenticated user');
          }
        }
      } catch (err) {
        console.error('❌ [useUser] Unexpected error getting session:', err);
        setError('Unexpected authentication error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [useUser] Auth state changed:', event, session?.user?.email || 'no user');
        
        try {
          setError(null); // Clear any previous errors
          
          // Handle different auth events
          switch (event) {
            case 'SIGNED_IN':
              console.log('✅ [useUser] User signed in:', session?.user?.id);
              setUser(session?.user ?? null);
              break;
            case 'SIGNED_OUT':
              console.log('👋 [useUser] User signed out');
              setUser(null);
              break;
            case 'TOKEN_REFRESHED':
              console.log('🔄 [useUser] Token refreshed for user:', session?.user?.id);
              setUser(session?.user ?? null);
              break;
            case 'PASSWORD_RECOVERY':
              console.log('🔒 [useUser] Password recovery for user:', session?.user?.id);
              setUser(session?.user ?? null);
              break;
            case 'USER_UPDATED':
              console.log('📝 [useUser] User updated:', session?.user?.id);
              setUser(session?.user ?? null);
              break;
            default:
              console.log('🔄 [useUser] Other auth event:', event);
              setUser(session?.user ?? null);
          }
        } catch (err) {
          console.error('❌ [useUser] Error handling auth state change:', err);
          setError('Authentication state error');
        } finally {
          setLoading(false);
        }
      }
    );

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { 
    user, 
    loading, 
    error,
    isAuthenticated: !!user && !loading,
    isLoading: loading
  };
} 