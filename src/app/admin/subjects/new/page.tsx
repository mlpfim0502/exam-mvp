'use client';

import { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createSubject } from '@/app/admin/actions';
import { useClasses } from '@/hooks/useClasses';

function NewSubjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { classes } = useClasses();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState(searchParams.get('class_id') ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('name', name);
    formData.set('description', description);
    formData.set('class_id', classId);

    startTransition(async () => {
      const result = await createSubject(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Subject created!');
        router.push('/admin/classes');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Subject Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Surgery"
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
        <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
          Class
        </label>
        <select
          id="class_id"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">No class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className={`w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-colors
          ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {isPending ? 'Creating...' : 'Create Subject'}
      </button>
    </form>
  );
}

export default function AdminNewSubjectPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Subject</h1>
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-2xl" />}>
        <NewSubjectForm />
      </Suspense>
    </div>
  );
}
