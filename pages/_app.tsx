import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import '../styles/notes.css';
import '../styles/notes-advanced.css';
import { HabitsProvider } from '../modules/habits/context/HabitsContext';
import { ThemeProvider } from '../modules/shared/context/ThemeContext';
import { ToastProvider } from '../modules/shared/context/ToastContext';

import Layout from '../modules/shared/components/Layout';
import AuthWrapper from '../modules/auth/components/AuthWrapper';
import Toast from '../modules/shared/components/Toast';
import { useRouter } from 'next/router';
import { supabase } from '../modules/database/config/databaseConfig';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Sidebar only on dashboard and settings
  const showSidebar = router.pathname === '/' || router.pathname === '/settings';
  
  // Pages that need to handle their own layout and scrolling
  const customLayoutPages = ['/plan/[id]', '/plans', '/my-learning/[id]'];
  const needsCustomLayout = customLayoutPages.some(pattern => 
    pattern === router.pathname || 
    (pattern.includes('[id]') && router.pathname.startsWith(pattern.replace('/[id]', '/')))
  );
  
  // Remove auth clearing on unload to persist sessions properly
  // useEffect(() => {
  //   // Auth clearing removed to prevent sign-in loops
  // }, []);
  
  return (
    <ThemeProvider>
      <ToastProvider>
        <HabitsProvider>
          <AuthWrapper>
            {needsCustomLayout ? (
              <Component {...pageProps} />
            ) : (
              <Layout showSidebar={showSidebar}>
                <Component {...pageProps} />
              </Layout>
            )}
            <Toast />
          </AuthWrapper>
        </HabitsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
} 