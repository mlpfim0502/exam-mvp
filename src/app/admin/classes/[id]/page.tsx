import { supabase } from '@/lib/supabase';
import { saveClassSubjects } from '@/actions/classes';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ManageClassSubjects({ params }: { params: { id: string } }) {
  const classId = params.id;
  
  // Fetch class details
  const { data: classData } = await supabase.from('classes').select('*').eq('id', classId).single();
  
  if (!classData) {
    return <div className="p-8 text-center text-red-500">Class not found</div>;
  }

  // Fetch all subjects
  const { data: allSubjects } = await supabase.from('subjects').select('*').order('name', { ascending: true });
  
  // Fetch currently assigned subjects
  const { data: assigned } = await supabase.from('class_subjects').select('subject_id').eq('class_id', classId);
  const assignedSubjectIds = new Set(assigned?.map(a => a.subject_id) || []);

  const formAction = saveClassSubjects.bind(null, classId);

  return (
    <div className="max-w-3xl mx-auto pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/classes" className="text-gray-400 hover:text-indigo-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">Assign Subjects to {classData.name}</h2>
        </div>
      </div>

      <p className="text-gray-500 mb-6">Select the subjects that students in this class should automatically have access to.</p>

      <form action={formAction} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto mb-6">
          {allSubjects?.map(subject => (
            <label key={subject.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
              <input 
                type="checkbox" 
                name="subject_ids" 
                value={subject.id}
                defaultChecked={assignedSubjectIds.has(subject.id)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <div>
                <p className="font-medium text-gray-800">{subject.name}</p>
                {subject.description && <p className="text-sm text-gray-500">{subject.description}</p>}
              </div>
            </label>
          ))}
          {(!allSubjects || allSubjects.length === 0) && (
            <p className="text-gray-500 italic">No subjects available to assign. Create subjects first.</p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition">
            Save Class Subjects
          </button>
        </div>
      </form>
    </div>
  );
}
