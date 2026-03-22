import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '../components/AuthProvider';
import FloatingAI from '../components/FloatingAI';

export const metadata: Metadata = {
  title: 'Quest Academy',
  description: 'Premium Academy for Modern Learning',
  icons: {
    icon: '/favicon.svg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <FloatingAI />
        </AuthProvider>
      </body>
    </html>
  );
}
