import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import { HabitsProvider } from '../lib/HabitsContext';
import Layout from '../components/Layout';
import AuthWrapper from '../components/AuthWrapper';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Sidebar only on dashboard and settings
  const showSidebar = router.pathname === '/' || router.pathname === '/settings';
  
  // Force sign-out when user closes tab/browser
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Clear session storage and sign out
      if (typeof window !== 'undefined') {
        window.sessionStorage.clear();
        window.localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] + '-auth-token');
      }
      await supabase.auth.signOut();
    };

    const handleUnload = () => {
      // Synchronous cleanup for immediate effect
      if (typeof window !== 'undefined') {
        window.sessionStorage.clear();
        window.localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] + '-auth-token');
      }
    };

    // Add event listeners for both beforeunload (allows async) and unload (immediate)
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);
  
  return (
    <HabitsProvider>
      <AuthWrapper>
        <Layout showSidebar={showSidebar}>
          <Component {...pageProps} />
        </Layout>
      </AuthWrapper>
    </HabitsProvider>
  );
} 