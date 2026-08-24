import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Gallery Express — Bus Tickets Online',
    template: '%s | Gallery Express',
  },
  description:
    'Book bus tickets online with Gallery Express. Safe, comfortable, and on-time intercity bus service across Bangladesh. Easy booking, instant tickets.',
  keywords: ['bus ticket', 'online booking', 'Bangladesh bus', 'Gallery Express', 'intercity bus'],
  authors: [{ name: 'Gallery Express' }],
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    siteName: 'Gallery Express',
    title: 'Gallery Express — Bus Tickets Online',
    description:
      'Book bus tickets online with Gallery Express. Safe, comfortable, and on-time intercity bus service across Bangladesh.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
