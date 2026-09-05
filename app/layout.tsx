import type { Metadata } from 'next';
import { Inter, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

const SITE_URL = 'https://www.ticketdorkar.xyz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Ticket Dorkar — #1 Online Bus Ticket Booking in Bangladesh',
    template: '%s | Ticket Dorkar Bus Ticket',
  },
  description:
    'Book intercity bus tickets online in Bangladesh with Ticket Dorkar Limited (ticketdorkar.xyz). Travel between Dhaka, Chittagong & Cox\'s Bazar. Easy seat selection, instant QR digital tickets, and 100% secure payment via bKash, Nagad & Cards.',
  keywords: [
    'Ticket Dorkar',
    'Ticket Dorkar Limited',
    'Ticket Dorkar Ltd',
    'ticketdorkar',
    'ticketdorkarltd',
    'Ticket Dorkar Bus',
    'Ticket Dorkar Bus Ticket',
    'ticketdorkar.xyz',
    'online bus ticket booking bangladesh',
    'bus ticket bd',
    'buy bus ticket online',
    'dhaka to cox bazar bus ticket',
    'dhaka to chittagong bus ticket',
    'cox bazar to dhaka bus ticket',
    'chittagong to cox bazar bus',
    'ac bus ticket booking',
    'intercity bus ticket bangladesh',
    'বাস টিকিট বুকিং',
    'অনলাইন বাস টিকিট',
    'টিকেট দরকার বাস',
    'টিকেট দরকার অনলাইন টিকিট'
  ],
  authors: [{ name: 'Ticket Dorkar Limited', url: SITE_URL }],
  creator: 'Ticket Dorkar Limited',
  publisher: 'Ticket Dorkar Limited',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
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
    url: SITE_URL,
    siteName: 'Ticket Dorkar Limited',
    title: 'Ticket Dorkar — #1 Online Bus Ticket Booking in Bangladesh',
    description:
      'Book intercity AC & Non-AC bus tickets online across Bangladesh with Ticket Dorkar Limited. Instant E-Tickets, instant seat confirmation, 24/7 customer support.',
    images: [
      {
        url: `${SITE_URL}/ticketdrkrlogo.png`,
        width: 1200,
        height: 630,
        alt: 'Ticket Dorkar Limited - Online Bus Ticket Booking Bangladesh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ticket Dorkar Limited — Online Bus Ticket Booking Bangladesh',
    description:
      'Book bus tickets online between Dhaka, Chittagong & Cox\'s Bazar. Secure E-tickets on Ticket Dorkar Limited.',
    images: [`${SITE_URL}/ticketdrkrlogo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Ticket Dorkar',
  alternateName: ['Ticket Dorkar Limited', 'Ticket Dorkar Bus', 'TicketDorkar', 'ticketdorkar.xyz'],
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?from={search_term_from}&to={search_term_to}`,
    },
    'query-input': 'required name=search_term_from',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Ticket Dorkar Limited',
  legalName: 'Ticket Dorkar Limited',
  alternateName: ['Ticket Dorkar', 'Ticket Dorkar Ltd', 'ticketdorkar', 'ticketdorkarltd', 'Ticket Dorkar Limited'],
  url: SITE_URL,
  logo: `${SITE_URL}/ticketdrkrlogo.png`,
  image: `${SITE_URL}/ticketdrkrlogo.png`,
  description:
    'Ticket Dorkar Limited (ticketdorkar.xyz) is Bangladesh\'s premier intercity bus ticket booking platform offering online AC and Non-AC bus tickets.',
  telephone: '01826-110036',
  email: 'ticketdorkarltd@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Navana Shopping Centre, Gulshan Avenue 01',
    addressLocality: 'Gulshan',
    addressRegion: 'Dhaka',
    postalCode: '1212',
    addressCountry: 'BD',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Bangladesh',
  },
  priceRange: '৳৳',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${hindSiliguri.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

