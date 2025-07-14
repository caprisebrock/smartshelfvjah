import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { HabitsProvider } from '../lib/HabitsContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HabitsProvider>
      <Component {...pageProps} />
    </HabitsProvider>
  );
} 