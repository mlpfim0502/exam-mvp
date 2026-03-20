'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createExam } from '@/actions/admin';
import { useSubjects } from '@/hooks/useSubjects';
import Link from 'next/link';

export default function NewExamPage() {
  const router = useRouter();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setError(null);
    startTransition(async () => {
      try {
        await createExam(formData);
        router.push('/admin');
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Create New Exam</h2>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-indigo-600 transition">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <select
            id="subject_id"
            name="subject_id"
            required
            disabled={subjectsLoading}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Select a subject...</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="e.g. Algebra Basics"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Equations, expressions, etc."
          />
        </div>

        <div>
          <label htmlFor="time_limit_minutes" className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
          <input
            type="number"
            id="time_limit_minutes"
            name="time_limit_minutes"
            min="1"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="20"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || subjectsLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 mt-4"
        >
          {isPending ? 'Creating...' : 'Create Exam'}
        </button>
      </form>
    </div>
  );
}
