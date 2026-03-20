import { supabase } from '@/lib/supabase';
import { toggleUserRole } from '@/actions/classes';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto pt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
        <p className="text-gray-500 mt-1">View users and assign them roles or classes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.avatar_url ? (
                        <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.display_name || 'Unknown'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form action={toggleUserRole} className="inline-flex gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="currentRole" value={user.role} />
                    <button type="submit" className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md">
                      Toggle Role
                    </button>
                    <a href={`/admin/users/${user.id}`} className="text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                      Classes
                    </a>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
