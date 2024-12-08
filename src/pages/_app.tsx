/** @jsxImportSource react */
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </AuthProvider>
  );
} 