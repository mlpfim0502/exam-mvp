'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { updateSubject, deleteSubject } from '@/app/admin/actions';

export default function AdminSubjectsPage() {
  const { subjects, loading, refetch } = useSubjects();
  const { classes } = useClasses();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName]   = useState('');
  const [editClassId, setEditClassId] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const startEdit = (id: string, name: string, classId: string | null) => {
    setEditingId(id);
    setEditName(name);
    setEditClassId(classId ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditClassId('');
  };

  const handleUpdate = (id: string) => {
    const formData = new FormData();
    formData.set('name', editName);
    if (editClassId) formData.set('class_id', editClassId);
    startTransition(async () => {
      const result = await updateSubject(id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Subject updated');
        setEditingId(null);
        refetch?.();
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete subject "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteSubject(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Subject deleted');
        refetch?.();
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <Link
          href="/admin/subjects/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Subject
        </Link>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-dashed border-gray-200">
          No subjects yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center gap-3 px-5 py-3">
              {editingId === subject.id ? (
                <>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(subject.id)}
                      autoFocus
                      placeholder="Subject name"
                      className="flex-1 border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <select
                      value={editClassId}
                      onChange={(e) => setEditClassId(e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="">No class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleUpdate(subject.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                    aria-label="save"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                    aria-label="cancel"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                    {subject.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{subject.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => startEdit(subject.id, subject.name, subject.class_id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                    aria-label="edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id, subject.name)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
