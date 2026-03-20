'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { updateSubject } from '@/app/admin/actions';
import { supabase } from '@/lib/supabase';

export default function AdminEditSubjectPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Subject not found');
          router.push('/admin/classes');
          return;
        }
        setName(data.name);
        setDescription(data.description ?? '');
        setLoading(false);
      });
  }, [subjectId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('id', subjectId);
    formData.set('name', name);
    formData.set('description', description);

    startTransition(async () => {
      const result = await updateSubject(subjectId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Subject updated!');
        router.push('/admin/classes');
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-md">
        <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse mb-6" />
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Subject</h1>
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
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/classes')}
            className="flex-1 py-2.5 rounded-xl font-semibold text-gray-700 text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-white text-sm transition-colors
              ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
