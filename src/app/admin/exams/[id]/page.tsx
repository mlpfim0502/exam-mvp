import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = await params;

  const { data: exam } = await supabase
    .from('exams')
    .select('*, subjects(name)')
    .eq('id', examId)
    .single();

  if (!exam) return <div className="p-8 text-center text-red-500">Exam not found</div>;

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId)
    .order('q_num', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/exams" className="text-gray-400 hover:text-indigo-600 transition">
          <ArrowLeft size={22} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">{exam.title}</h2>
      </div>
      <p className="text-gray-500 mb-1 ml-9">Subject: {(exam as any).subjects?.name}</p>
      <p className="text-gray-500 mb-6 ml-9">Time limit: {exam.time_limit_minutes ?? '—'} min</p>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Questions ({questions?.length || 0})</h3>
        <Link
          href={`/admin/exams/${examId}/questions/new`}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus size={16} /> Add Question
        </Link>
      </div>

      <div className="space-y-3">
        {questions?.map(q => (
          <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded">{q.type}</span>
                  <span className="text-xs text-gray-400">Q{q.q_num}</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">{q.stem}</p>
                {q.type === 'MCQ' && (
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
                    {q.opt_a && <span><b>A.</b> {q.opt_a}</span>}
                    {q.opt_b && <span><b>B.</b> {q.opt_b}</span>}
                    {q.opt_c && <span><b>C.</b> {q.opt_c}</span>}
                    {q.opt_d && <span><b>D.</b> {q.opt_d}</span>}
                    {q.opt_e && <span><b>E.</b> {q.opt_e}</span>}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                  Ans: {q.answer}
                </span>
              </div>
            </div>
            {q.explanation && (
              <p className="mt-2 text-xs text-gray-400 border-t border-gray-50 pt-2">{q.explanation}</p>
            )}
          </div>
        ))}
        {(!questions || questions.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            No questions yet. Click "Add Question" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
