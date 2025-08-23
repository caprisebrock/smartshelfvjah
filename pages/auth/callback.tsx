import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../../modules/database/config/databaseConfig";
import { Target, RefreshCw } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [status, setStatus] = useState("Verifying your authentication...");
  const hasRun = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent double execution in development mode
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Starting auth callback process');
        setLoading(true);
        setAuthError(null);
        
        // Wait 100ms for Supabase auth state to settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setStatus("Checking your session...");
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('❌ Error getting user:', userError);
          throw new Error('Authentication failed. Please try signing in again.');
        }

        if (!user) {
          console.log('❌ No user found after auth callback');
          throw new Error('No user session found. Please try signing in again.');
        }

        console.log('✅ User authenticated:', user.id);
        console.log('👤 User metadata:', user.user_metadata);
        setStatus("Setting up your profile...");

        // Enhanced profile creation with robust error handling
        await ensureUserProfile(user);

        // Set redirecting state - no errors should show after this point
        setRedirecting(true);
        setLoading(false);

        // Check if user needs onboarding by fetching their profile
        const { data: profile, error: profileError } = await supabase
          .from('app_users')
          .select('goal_focus, emoji, color')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching user profile after creation:', profileError);
          // Continue anyway, redirect to onboarding
        }

        console.log('📋 User profile data:', profile);

        // Determine redirect destination
        const shouldOnboard = !profile?.goal_focus || profile.goal_focus.trim() === '';
        const destination = shouldOnboard ? '/onboarding/step1' : '/';
        
        if (shouldOnboard) {
          console.log('🆕 New user or incomplete profile, redirecting to onboarding');
          setStatus("Welcome! Setting up your learning journey...");
        } else {
          console.log('👋 Returning user, redirecting to dashboard');
          setStatus("Welcome back! Taking you to your dashboard...");
        }

        // Redirect after a short delay for smooth UX
        setTimeout(() => {
          console.log(`🚀 Redirecting to: ${destination}`);
          router.replace(destination);
        }, 1500);

      } catch (err) {
        console.error('💥 Auth callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong during authentication.';
        
        // Only show error if we're not already redirecting
        if (!redirecting) {
          setAuthError(errorMessage);
          setLoading(false);
        }
      }
    };

    // Enhanced profile creation function
    const ensureUserProfile = async (user: any) => {
      try {
        console.log('🔍 Checking if profile exists for user:', user.id);
        
        // First, check if profile already exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // Real error (not "not found")
          console.error('❌ Error checking existing profile:', checkError);
          throw new Error(`Failed to check existing profile: ${checkError.message}`);
        }

        if (existingProfile) {
          console.log('✅ Profile already exists for user:', user.id);
          return existingProfile;
        }

        // Profile doesn't exist, create it with enhanced fallback values
        console.log('🆕 Creating new profile for user:', user.id);
        
        // Extract data with robust fallbacks
        const userEmail = user.email || '';
        const userName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.user_metadata?.display_name || 
                        userEmail.split('@')[0] || 
                        'User';
        
        // Enhanced fallback values for avatar
        const avatarEmoji = user.user_metadata?.emoji || 
                           '🙂'; // Friendly default
        
        const avatarColor = user.user_metadata?.color || 
                           '#10b981'; // Nice green default
        
        const payload = {
          id: user.id,
          email: userEmail,
          name: userName,
          emoji: avatarEmoji,
          color: avatarColor,
          is_premium: false,
          goal_focus: '', // Empty - user needs to complete onboarding
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                     marketing_opt_in: false,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString(),
        };

        console.log('👉 Inserting new user profile with payload:', payload);

        const { data: newProfile, error: insertError } = await supabase
          .from('app_users')
          .insert(payload)
          .select('*')
          .single();

        if (insertError) {
          console.error('❌ Failed to create user profile:', insertError);
          
          // Enhanced error handling with specific error messages
          if (insertError.code === '23505') {
            throw new Error('Profile already exists but was not found in initial check.');
          } else if (insertError.code === '23503') {
            throw new Error('Database constraint violation. Please contact support.');
          } else {
            throw new Error(`Failed to create profile: ${insertError.message}`);
          }
        }

        console.log('✅ New user profile created successfully:', newProfile);
        return newProfile;

      } catch (err) {
        console.error('❌ Error in ensureUserProfile:', err);
        
        // Add user-friendly error message and fallback
        const errorMsg = err instanceof Error ? err.message : 'Unknown error creating profile';
        throw new Error(`Profile setup failed: ${errorMsg}. Please try signing in again.`);
      }
    };

    // Set up fallback timeout to handle stuck states
    timeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Auth callback timeout - redirecting to signin');
      if (!redirecting) {
        setAuthError('Authentication is taking too long. Please try signing in again.');
        setLoading(false);
      }
    }, 8000); // Increased to 8 seconds for profile creation

    // Start the auth callback process
    handleAuthCallback();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router, redirecting]);

  return (
    <>
      <Head>
        <title>Setting Up Account - SmartShelf</title>
        <meta name="description" content="Setting up your SmartShelf account" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Target className="w-10 h-10 text-white" />
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            {authError && !redirecting ? (
              // Error State - Only show if we have a real error AND we're not redirecting
              <div className="space-y-6">
                <div className="text-4xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Error</h1>
                <p className="text-red-600 dark:text-red-400 text-sm mb-6 leading-relaxed">{authError}</p>
                
                {/* Enhanced error information */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="mb-2"><strong>Troubleshooting:</strong></p>
                  <ul className="text-left space-y-1">
                    <li>• Clear your browser cache and cookies</li>
                    <li>• Try signing in with an incognito/private window</li>
                    <li>• Check your internet connection</li>
                  </ul>
                </div>
                
                {/* Retry Button */}
                <div className="space-y-3">
                  <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Link>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Or contact support if the problem persists
                  </div>
                </div>
              </div>
            ) : (
              // Loading/Success State
              <div className="space-y-6">
                <div className="text-4xl mb-4">{redirecting ? '🎉' : '✨'}</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {redirecting ? 'Success!' : 'Almost Ready!'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">{status}</p>
                
                {/* Loading Spinner - only show if still loading, not if redirecting */}
                {!redirecting && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* Enhanced Progress Steps */}
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Authentication verified</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${redirecting ? 'bg-green-500' : (loading ? 'bg-blue-500 animate-pulse' : 'bg-gray-400')}`}></div>
                    <span>
                      {redirecting ? 'Profile ready!' : (loading ? 'Creating your profile...' : 'Checking session...')}
                    </span>
                  </div>
                  {redirecting && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 animate-pulse rounded-full"></div>
                      <span>Redirecting...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
            Welcome to SmartShelf - Your Personal Learning Dashboard
          </div>
        </div>
      </div>
    </>
  );
} 