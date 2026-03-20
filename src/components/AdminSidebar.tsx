// src/components/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, GraduationCap, LogOut, FileText } from 'lucide-react';
import { adminLogout } from '@/app/admin/actions';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Classes', href: '/admin/classes', icon: GraduationCap },
  { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { label: 'Exams', href: '/admin/exams', icon: FileText },
  { label: 'Users', href: '/admin/users', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <nav className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
          Admin
        </p>
        <ul className="space-y-1 flex-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <form action={adminLogout} className="mt-auto pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 w-full transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </nav>

      {/* Mobile bottom nav — hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <ul className="flex items-center justify-around">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors
                    ${isActive
                      ? 'text-indigo-700'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
