import type { Metadata } from 'next';
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
