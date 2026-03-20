// src/app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLiff } from '@/components/LiffProvider';
import AdminSidebar from '@/components/AdminSidebar';
import LoadingScreen from '@/components/LoadingScreen';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabaseUserId } = useLiff();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabaseUserId) return;
    supabase
      .from('users')
      .select('role')
      .eq('id', supabaseUserId)
      .single()
      .then(({ data }) => {
        if (data?.role === 'admin') {
          setIsAdmin(true);
        } else {
          router.replace('/');
        }
      });
  }, [supabaseUserId, router]);

  if (isAdmin === null) {
    return <LoadingScreen message="Checking access..." />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">{children}</main>
    </div>
  );
}
