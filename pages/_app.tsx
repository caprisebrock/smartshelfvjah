import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import { HabitsProvider } from '../lib/HabitsContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { ToastProvider } from '../lib/ToastContext';
import { ChatProvider } from '../lib/ChatContext';
import Layout from '../components/Layout';
import AuthWrapper from '../components/AuthWrapper';
import Toast from '../components/Toast';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Sidebar only on dashboard and settings (AI Chat has its own layout)
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
    <ThemeProvider>
      <ToastProvider>
        <ChatProvider>
          <HabitsProvider>
            <AuthWrapper>
              <Layout showSidebar={showSidebar}>
                <Component {...pageProps} />
              </Layout>
              <Toast />
            </AuthWrapper>
          </HabitsProvider>
        </ChatProvider>
      </ToastProvider>
    </ThemeProvider>
  );
} 