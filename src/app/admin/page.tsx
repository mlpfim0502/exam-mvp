import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Tell Next.js to dynamically render this chunk (no static pre-fetching since data updates)
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { count: subjectsCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true });
  const { count: examsCount } = await supabase.from('exams').select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-indigo-600">{subjectsCount || 0}</p>
          <p className="text-sm text-gray-500 font-medium mt-1">Total Subjects</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-indigo-600">{examsCount || 0}</p>
          <p className="text-sm text-gray-500 font-medium mt-1">Total Exams</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <Link href="/admin/subjects/new" className="block text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-4 px-6 rounded-xl transition">
          + Create New Subject
        </Link>
        <Link href="/admin/exams/new" className="block text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-4 px-6 rounded-xl transition">
          + Create New Exam
        </Link>
      </div>
    </div>
  );
}
