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
    default: 'Ticket Dorkar — Bus Tickets Online',
    template: '%s | Ticket Dorkar',
  },
  description:
    'Book bus tickets online with Ticket Dorkar. Safe, comfortable, and on-time intercity bus service across Bangladesh. Easy booking, instant tickets.',
  keywords: ['bus ticket', 'online booking', 'Bangladesh bus', 'Ticket Dorkar', 'intercity bus', 'ticketdorkar.xyz'],
  authors: [{ name: 'Ticket Dorkar' }],
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
    url: 'https://www.ticketdorkar.xyz',
    siteName: 'Ticket Dorkar',
    title: 'Ticket Dorkar — Bus Tickets Online',
    description:
      'Book bus tickets online with Ticket Dorkar. Safe, comfortable, and on-time intercity bus service across Bangladesh.',
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
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
