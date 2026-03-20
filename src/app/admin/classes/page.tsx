'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useClasses } from '@/hooks/useClasses';
import { updateClass, deleteClass } from '@/app/admin/actions';

export default function AdminClassesPage() {
  const { classes, loading, refetch } = useClasses();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName]   = useState('');
  const [isPending, startTransition] = useTransition();

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUpdate = (id: string) => {
    const formData = new FormData();
    formData.set('name', editName);
    startTransition(async () => {
      const result = await updateClass(id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Class updated');
        setEditingId(null);
        refetch?.();
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete class "${name}"? This will unlink associated subjects.`)) return;
    startTransition(async () => {
      const result = await deleteClass(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Class deleted');
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
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <Link
          href="/admin/classes/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Class
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-dashed border-gray-200">
          No classes yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-center gap-3 px-5 py-3">
              {editingId === cls.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cls.id)}
                    autoFocus
                    className="flex-1 border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => handleUpdate(cls.id)}
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
                  <p className="text-sm font-medium text-gray-900 flex-1">{cls.name}</p>
                  <button
                    onClick={() => startEdit(cls.id, cls.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                    aria-label="edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id, cls.name)}
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
