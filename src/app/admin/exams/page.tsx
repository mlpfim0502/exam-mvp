'use client';

import Link from 'next/link';
import { Plus, Clock, BookOpen } from 'lucide-react';
import { useAllExams } from '@/hooks/useAllExams';

export default function AdminExamsPage() {
  const { exams, loading } = useAllExams();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Group by subject_name
  const grouped: Record<string, typeof exams> = {};
  for (const exam of exams) {
    const key = exam.subject_name ?? 'Unassigned';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(exam);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        <Link
          href="/admin/exams/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Exam
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-dashed border-gray-200">
          No exams yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([subjectName, subjectExams]) => (
            <div key={subjectName}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {subjectName}
              </h2>
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
                {subjectExams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/admin/exams/${exam.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{exam.title}</p>
                      {exam.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{exam.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
                      <span className="flex items-center gap-1">
                        <BookOpen size={13} />
                        {exam.question_count} Q
                      </span>
                      {exam.time_limit_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {exam.time_limit_minutes} min
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
