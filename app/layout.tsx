import type { Metadata } from 'next';
import './globals.css';

import StoreProvider from '../components/StoreProvider';

export const metadata: Metadata = {
  title: 'ChatApp — Real-Time Messaging',
  description:
    'Production-grade real-time chat application with media sharing, message forwarding, and presence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
