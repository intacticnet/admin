import type { Metadata } from 'next';

// Force dynamic rendering for ALL routes — prevents static prerendering
// which fails because Supabase server client needs runtime cookies()
export const dynamic = 'force-dynamic';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import AdminShell from '@/components/admin/AdminShell';
import { Toaster } from '@/components/ui/toaster';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: 'Intactic Admin',
  description: 'Content Management System for Intactic',
  icons: {
    icon: 'https://res.cloudinary.com/ti1ep7pl/image/upload/w_64,h_64,c_fit,f_auto,q_auto/intactic',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-zinc-50 text-foreground">
        <AdminShell>
          {children}
        </AdminShell>
        <Toaster />
      </body>
    </html>
  );
}
