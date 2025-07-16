import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { HabitsProvider } from '../lib/HabitsContext';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Sidebar only on dashboard and settings
  const showSidebar = router.pathname === '/' || router.pathname === '/settings';
  return (
    <HabitsProvider>
      <Layout showSidebar={showSidebar}>
        <Component {...pageProps} />
      </Layout>
    </HabitsProvider>
  );
} 