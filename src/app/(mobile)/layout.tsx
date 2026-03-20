// src/app/(mobile)/layout.tsx
import { LiffProvider } from '@/components/LiffProvider';
import BottomNav from '@/components/BottomNav';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <LiffProvider>
      <div className="min-h-screen mx-auto max-w-[480px] bg-white shadow-sm">
        {/* pb-16 reserves space above the fixed bottom nav */}
        <div className="pb-16">{children}</div>
        <BottomNav />
      </div>
    </LiffProvider>
  );
}
