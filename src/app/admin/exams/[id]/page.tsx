'use client';

import { useTransition } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Clock, BookOpen, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useExam } from '@/hooks/useExam';
import { deleteExam, deleteQuestion } from '@/app/admin/actions';

export default function AdminExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { exam, questions, loading, refetch } = useExam(id);
  const [isPending, startTransition] = useTransition();

  const handleDeleteExam = () => {
    if (!confirm(`Delete exam "${exam?.title}"? This will remove all questions.`)) return;
    startTransition(async () => {
      const result = await deleteExam(id);
      if (result.error) toast.error(result.error);
    });
  };

  const handleDeleteQuestion = (qid: string) => {
    if (!confirm('Delete this question?')) return;
    startTransition(async () => {
      const result = await deleteQuestion(qid, id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Question deleted');
        refetch();
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!exam) {
    return <p className="text-gray-400">Exam not found.</p>;
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/exams"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
      >
        <ChevronLeft size={14} /> Exams
      </Link>

      {/* Exam info card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            {exam.description && (
              <p className="text-sm text-gray-400 mt-1">{exam.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen size={13} />
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </span>
              {exam.time_limit_minutes && (
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {exam.time_limit_minutes} min
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/exams/${id}/edit`}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              aria-label="edit exam"
            >
              <Pencil size={16} />
            </Link>
            <button
              onClick={handleDeleteExam}
              disabled={isPending}
              className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              aria-label="delete exam"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Questions section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Questions</h2>
        <Link
          href={`/admin/exams/${id}/questions/new`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={13} /> Add Question
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No questions yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {questions.map((q) => (
            <div key={q.id} className="flex items-start gap-3 px-5 py-4">
              <span className="text-xs font-semibold text-gray-400 w-6 shrink-0 pt-0.5">
                {q.q_num}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-snug">{q.stem}</p>
                {q.type === 'MCQ' && (
                  <div className="mt-1.5 space-y-0.5">
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                      const opt = q[`opt_${letter.toLowerCase()}` as 'opt_a' | 'opt_b' | 'opt_c' | 'opt_d'];
                      if (!opt) return null;
                      return (
                        <p
                          key={letter}
                          className={`text-xs ${q.answer === letter ? 'text-green-600 font-medium' : 'text-gray-400'}`}
                        >
                          {letter}. {opt}
                        </p>
                      );
                    })}
                  </div>
                )}
                {q.type === 'TF' && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Answer: {q.answer === 'T' ? 'True' : 'False'}
                  </p>
                )}
              </div>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${
                q.type === 'MCQ' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              }`}>
                {q.type}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/admin/exams/${id}/questions/${q.id}/edit`}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  aria-label="edit question"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="delete question"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
