import { supabase } from '@/lib/supabase';
import { saveUserClassesForm } from '@/actions/classes';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ManageUserClasses({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  
  // Fetch user details
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
  
  if (!user) {
    return <div className="p-8 text-center text-red-500">User not found</div>;
  }

  // Fetch all classes
  const { data: allClasses } = await supabase.from('classes').select('*').order('name', { ascending: true });
  
  // Fetch currently assigned classes
  const { data: assigned } = await supabase.from('user_classes').select('class_id').eq('user_id', userId);
  const assignedClassIds = new Set(assigned?.map(a => a.class_id) || []);

  return (
    <div className="max-w-3xl mx-auto pt-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/users" className="text-gray-400 hover:text-indigo-600 transition">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Assign Classes to {user.display_name || 'User'}</h2>
      </div>

      <p className="text-gray-500 mb-6">Select the classes (groups) this user belongs to.</p>

      <form action={saveUserClassesForm} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <input type="hidden" name="userId" value={userId} />
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto mb-6">
          {allClasses?.map(c => (
            <label key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
              <input 
                type="checkbox" 
                name="class_ids" 
                value={c.id}
                defaultChecked={assignedClassIds.has(c.id)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <div>
                <p className="font-medium text-gray-800">{c.name}</p>
                {c.description && <p className="text-sm text-gray-500">{c.description}</p>}
              </div>
            </label>
          ))}
          {(!allClasses || allClasses.length === 0) && (
            <p className="text-gray-500 italic">No classes available. Create some classes first.</p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition">
            Save User Classes
          </button>
        </div>
      </form>
    </div>
  );
}
