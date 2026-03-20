'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createSubject } from '@/actions/admin';
import Link from 'next/link';

export default function NewSubjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setError(null);
    startTransition(async () => {
      try {
        await createSubject(formData);
        router.push('/admin');
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Create New Subject</h2>
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="e.g. Mathematics"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Algebra, geometry, and arithmetic"
          />
        </div>

        <div>
          <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
          <input
            type="url"
            id="icon_url"
            name="icon_url"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="https://example.com/icon.png"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 mt-4"
        >
          {isPending ? 'Creating...' : 'Create Subject'}
        </button>
      </form>
    </div>
  );
}
