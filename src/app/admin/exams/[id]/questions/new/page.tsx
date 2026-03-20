import { supabase } from '@/lib/supabase';
import NewQuestionForm from './NewQuestionForm';

export const dynamic = 'force-dynamic';

export default async function NewQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = await params;

  const { data: exam } = await supabase.from('exams').select('title').eq('id', examId).single();
  if (!exam) return <div className="p-8 text-center text-red-500">Exam not found</div>;

  // Get next question number
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('exam_id', examId);
  const nextQNum = (count ?? 0) + 1;

  return <NewQuestionForm examId={examId} examTitle={exam.title} nextQNum={nextQNum} />;
}
