import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MPL ID Coach Simulator 2026 - Mobile Legends',
  description: 'Game simulasi Head Coach Mobile Legends Bang Bang MPL Indonesia dengan aturan 10-Ban, 2D Match Engine, Playoffs & Malam Penghargaan Awards Gala.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#680008',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-mpl-darkBg text-gray-100 min-h-screen selection:bg-mpl-red selection:text-white">
        {children}
      </body>
    </html>
  );
}
