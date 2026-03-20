'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/useUsers';
import { toggleUserRole } from '@/app/admin/actions';
import type { UserRole } from '@/lib/types';

export default function AdminUsersPage() {
  const { users, loading } = useUsers();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleToggle = async (userId: string, currentRole: UserRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    const confirmed = window.confirm(
      `Change this user's role from "${currentRole}" to "${newRole}"?`
    );
    if (!confirmed) return;

    setPendingId(userId);
    const result = await toggleUserRole(userId, currentRole);
    setPendingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Role updated to ${newRole}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-4 px-5 py-4">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.display_name ?? ''}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                {(user.display_name ?? 'U')[0]}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}
              >
                {user.role}
              </span>
            </div>
            <button
              onClick={() => handleToggle(user.id, user.role)}
              disabled={pendingId === user.id}
              aria-label="toggle role"
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${pendingId === user.id
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              {pendingId === user.id ? '...' : 'Toggle Role'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
