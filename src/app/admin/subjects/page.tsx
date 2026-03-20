'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';

export default function AdminSubjectsPage() {
  const { subjects, loading } = useSubjects();

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
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <Link
          href="/admin/subjects/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Subject
        </Link>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-dashed border-gray-200">
          No subjects yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center px-5 py-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                {subject.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{subject.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
