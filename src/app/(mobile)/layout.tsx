// src/app/(mobile)/layout.tsx
import { LiffProvider } from '@/components/LiffProvider';

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiffProvider>
      {/* Centered container: full-width on mobile, capped on desktop */}
      <div className="min-h-screen mx-auto max-w-[480px] bg-white shadow-sm">
        {children}
      </div>
    </LiffProvider>
  );
}
