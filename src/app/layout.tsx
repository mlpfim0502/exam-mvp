// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { LiffProvider } from '@/components/LiffProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Exam Practice',
  description: 'Practice and test your knowledge with MCQ and T/F questions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LiffProvider>
          {/* Centered container: full-width on mobile, capped on desktop */}
          <div className="min-h-screen mx-auto max-w-[480px] bg-white shadow-sm">
            {children}
          </div>
        </LiffProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
