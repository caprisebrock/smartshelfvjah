import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../../lib/supabaseClient";
import { Target } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Checking your account...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus("Verifying your email confirmation...");
        
        // Handle the auth callback
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('Auth error:', authError);
          setError('Authentication failed. Please try signing in again.');
          setTimeout(() => router.replace('/login'), 3000);
          return;
        }

        if (!data.session) {
          setError('No session found. Redirecting to login...');
          setTimeout(() => router.replace('/login'), 2000);
          return;
        }

        setStatus("Account verified! Checking your profile...");
        
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('app_users')
          .select('name, goal_focus')
          .eq('id', data.session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error:', profileError);
          // If there's an error checking profile, assume they need onboarding
          setStatus("Setting up your profile...");
          setTimeout(() => router.replace('/onboarding/step1'), 1500);
          return;
        }

        // Determine where to redirect based on onboarding status
        if (!profile || !profile.name || !profile.goal_focus) {
          setStatus("Welcome! Let's set up your profile...");
          setTimeout(() => router.replace('/onboarding/step1'), 1500);
        } else {
          setStatus("Welcome back! Taking you to your dashboard...");
          setTimeout(() => router.replace('/'), 1500);
        }

      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('Something went wrong. Please try again.');
        setTimeout(() => router.replace('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <>
      <Head>
        <title>Verifying Account - SmartShelf</title>
        <meta name="description" content="Verifying your account and setting up your profile" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Target className="w-10 h-10 text-white" />
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {error ? (
              // Error State
              <div className="space-y-4">
                <div className="text-4xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <div className="text-xs text-gray-500">Redirecting you to login...</div>
              </div>
            ) : (
              // Loading State
              <div className="space-y-6">
                <div className="text-4xl mb-4">🔄</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Almost Ready!</h1>
                <p className="text-gray-600 text-lg mb-6">{status}</p>
                
                {/* Loading Spinner */}
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
                
                {/* Progress Steps */}
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Email verified</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                    <span>Checking profile...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-xs text-gray-400">
            Welcome to SmartShelf - Your Personal Learning Dashboard
          </div>
        </div>
      </div>
    </>
  );
} 