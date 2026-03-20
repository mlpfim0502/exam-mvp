'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';

export default function AdminClassesPage() {
  const { classes, loading } = useClasses();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <Link
          href="/admin/classes/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Class
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-dashed border-gray-200">
          No classes yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-center px-5 py-4">
              <p className="text-sm font-medium text-gray-900 flex-1">{cls.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
