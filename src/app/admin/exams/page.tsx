import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminExamsPage() {
  const { data: exams } = await supabase
    .from('exams')
    .select('*, subjects(name)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">All Exams</h2>
        <Link
          href="/admin/exams/new"
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <Layers size={16} /> New Exam
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exams?.map(exam => (
              <tr key={exam.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{exam.title}</td>
                <td className="px-6 py-4 text-gray-500">{(exam as any).subjects?.name || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{exam.time_limit_minutes ? `${exam.time_limit_minutes} min` : '—'}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/exams/${exam.id}`}
                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    Manage Questions
                  </Link>
                </td>
              </tr>
            ))}
            {(!exams || exams.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No exams yet. Create one first!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
