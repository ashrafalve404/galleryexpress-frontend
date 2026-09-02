import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Bus Schedules & Book Online Tickets',
  description: 'Search intercity bus schedules across Bangladesh on Ticket Dorkar Limited. Find AC & Non-AC buses connecting Dhaka, Chittagong, and Cox\'s Bazar.',
  alternates: {
    canonical: 'https://www.ticketdorkar.xyz/search',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
