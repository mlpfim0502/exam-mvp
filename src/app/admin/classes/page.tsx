import { supabase } from '@/lib/supabase';
import { createClass } from '@/actions/classes';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminClassesPage() {
  const { data: classes } = await supabase.from('classes').select('*').order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Manage Classes</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold mb-4">Create New Class</h3>
        <form action={createClass} className="flex gap-4 items-start">
          <div className="flex-1">
            <input
              type="text"
              name="name"
              required
              placeholder="Class Name (e.g. M5, Section A)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition mb-3"
            />
            <input
              type="text"
              name="description"
              placeholder="Description (Optional)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition whitespace-nowrap">
            Create Class
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes?.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-gray-500">{c.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* We would typically navigate to a separate page to edit the class's assigned subjects */}
                  <Link href={`/admin/classes/${c.id}`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md">
                    Manage Subjects
                  </Link>
                </td>
              </tr>
            ))}
            {(!classes || classes.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No classes found. Create one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
