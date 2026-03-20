'use client';

import { useState, useTransition, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { updateExam } from '@/app/admin/actions';
import { useExam } from '@/hooks/useExam';
import { useSubjects } from '@/hooks/useSubjects';

export default function AdminEditExamPage() {
  const { id } = useParams<{ id: string }>();
  const { exam, loading } = useExam(id);
  const { subjects } = useSubjects();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [timeLimit, setTimeLimit] = useState('');

  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setDescription(exam.description ?? '');
      setSubjectId(exam.subject_id ?? '');
      setTimeLimit(exam.time_limit_minutes?.toString() ?? '');
    }
  }, [exam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('title', title);
    if (description) formData.set('description', description);
    if (subjectId) formData.set('subject_id', subjectId);
    if (timeLimit) formData.set('time_limit_minutes', timeLimit);

    startTransition(async () => {
      const result = await updateExam(id, formData);
      if (result?.error) toast.error(result.error);
    });
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
  }

  if (!exam) return <p className="text-gray-400">Exam not found.</p>;

  return (
    <div className="max-w-md">
      <Link
        href={`/admin/exams/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
      >
        <ChevronLeft size={14} /> Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Exam</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            id="subject_id"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="time_limit" className="block text-sm font-medium text-gray-700 mb-1">
            Time limit (minutes, optional)
          </label>
          <input
            id="time_limit"
            type="number"
            min="1"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-colors
            ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
