'use client';

import Image from 'next/image';
import { useUsers } from '@/hooks/useUsers';

export default function AdminUsersPage() {
  const { users, loading } = useUsers();

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
            <div>
              <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
              <span className="text-xs text-gray-400">{user.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
