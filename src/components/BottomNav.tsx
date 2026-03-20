'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Library } from 'lucide-react';

const TABS = [
  { label: 'Class', href: '/', icon: Library },
  { label: 'Qbank', href: '/qbank', icon: BookOpen },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  // Hide nav during exam-taking
  if (pathname.startsWith('/exam/')) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 flex z-50">
      {TABS.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              active ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
