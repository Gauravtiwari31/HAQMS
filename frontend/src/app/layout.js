import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'HAQMS — Hospital Appointment & Queue Management',
  description: 'Professional hospital appointment scheduling, patient management, and real-time queue tracking system.',
  keywords: ['hospital', 'appointment', 'queue', 'patient management', 'healthcare'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080E1A" />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen gradient-bg antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
