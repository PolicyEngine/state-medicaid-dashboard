import type { Metadata, Viewport } from 'next';
import './globals.css';

const TITLE = 'Medicaid Reform Dashboard | PolicyEngine';
const DESCRIPTION =
  'Interactive state-by-state Medicaid reform dashboard exploring funding, eligibility, and benefit changes.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
};

export const viewport: Viewport = {
  themeColor: '#2C6496',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
