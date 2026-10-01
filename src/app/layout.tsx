import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { SplashScreen } from '@/components/common/SplashScreen';
import { ContentProtection } from '@/components/security/ContentProtection';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BookNest | Online Book Store & Rental Platform',
  description:
    'Rent or buy books online with 100% refundable security deposits, express doorstep delivery in India, and transparent rental periods.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-900">
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              {/* Animated Logo Splash Screen */}
              <SplashScreen />
              {/* Anti-Screenshot, Content Protection & Single-Device Security Guard */}
              <ContentProtection />
              
              <Navbar />
              <CartDrawer />
              <main className="flex-1">{children}</main>
              <Footer />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
