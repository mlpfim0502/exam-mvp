'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/useUsers';
import { useClasses } from '@/hooks/useClasses';
import { updateUser } from '@/app/admin/actions';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const { users, loading } = useUsers();
  const { classes } = useClasses();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleClassChange = async (userId: string, classId: string) => {
    setPendingId(userId);
    const result = await updateUser(userId, { class_id: classId || null });
    setPendingId(null);

    if (result.error) toast.error(result.error);
    else toast.success('Class updated successfully');
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const action = isBlocked ? 'unblock' : 'block';
    const confirmed = window.confirm(`Are you sure you want to ${action} this user?`);
    if (!confirmed) return;

    setPendingId(userId);
    const result = await updateUser(userId, { is_blocked: !isBlocked });
    setPendingId(null);

    if (result.error) toast.error(result.error);
    else toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users Management</h1>
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 border border-gray-100 overflow-hidden">
        {users.map((user) => {
          const isBlocked = user.is_blocked;
          return (
            <div 
              key={user.id} 
              className={`flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 transition-colors ${
                isBlocked ? 'bg-red-50/30' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.display_name ?? ''}
                    width={48}
                    height={48}
                    className={`rounded-full shadow-sm ${isBlocked ? 'opacity-50 grayscale' : ''}`}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm
                    ${isBlocked ? 'bg-red-100 text-red-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    {(user.display_name ?? 'U')[0]}
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${isBlocked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {user.display_name}
                    </p>
                    {isBlocked && (
                      <span className="flex items-center text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        Blocked
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-medium
                        ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-400 font-mono" title="User ID">
                      {user.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-16 sm:pl-0">
                <div className="flex flex-col gap-1 w-full sm:w-auto min-w-[140px]">
                  <label className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Class</label>
                  <select
                    value={user.class_id || ''}
                    onChange={(e) => handleClassChange(user.id, e.target.value)}
                    disabled={pendingId === user.id}
                    className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-medium text-gray-700"
                  >
                    <option value="">No Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-4 sm:flex-row mt-4 sm:mt-0">
                  <button
                    onClick={() => handleToggleBlock(user.id, user.is_blocked)}
                    disabled={pendingId === user.id}
                    title={isBlocked ? 'Unblock User' : 'Block User'}
                    className={`p-2.5 rounded-xl transition-colors disabled:opacity-50
                      ${isBlocked 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                  >
                    {isBlocked ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
