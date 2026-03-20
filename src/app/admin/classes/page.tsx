'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus, ChevronDown, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { deleteSubject } from '@/app/admin/actions';
import type { Subject } from '@/lib/types';

/* ── Subject card shown inside an expanded class ─────────────────────────── */

function SubjectInfoCard({ subject, onDelete }: { subject: Subject; onDelete: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(`Delete "${subject.name}"? This will also remove all its exams and questions.`)) return;
    startTransition(async () => {
      const result = await deleteSubject(subject.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Subject deleted');
        onDelete(subject.id);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
        {subject.icon_url ? (
          <img src={subject.icon_url} alt="" className="w-6 h-6 object-contain" />
        ) : (
          <BookOpen size={22} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{subject.name}</p>
        {subject.description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{subject.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={`/admin/subjects/${subject.id}/edit`}
          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Edit"
        >
          <Pencil size={16} />
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export default function AdminClassesPage() {
  const { classes, loading: classesLoading } = useClasses();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [removedSubjectIds, setRemovedSubjectIds] = useState<Set<string>>(new Set());

  const loading = classesLoading || subjectsLoading;

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSubjectDeleted = (id: string) => {
    setRemovedSubjectIds((prev) => new Set(prev).add(id));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <Link
          href="/admin/classes/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Class
        </Link>
      </div>

      {/* Class list */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-dashed border-gray-200">
          No classes yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => {
            const isExpanded = expandedId === cls.id;
            const classSubjects = subjects.filter(
              (s) => s.class_id === cls.id && !removedSubjectIds.has(s.id)
            );

            return (
              <div key={cls.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Class row */}
                <button
                  onClick={() => toggle(cls.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                      ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                      {cls.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cls.name}</p>
                      <p className="text-xs text-gray-400">{classSubjects.length} subject{classSubjects.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded subjects panel */}
                {isExpanded && (
                  <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-4">
                    {/* Add Subject button */}
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-gray-500">
                        Subjects in {cls.name}
                      </p>
                      <Link
                        href={`/admin/subjects/new?class_id=${cls.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                      >
                        <Plus size={14} /> Add Subject
                      </Link>
                    </div>

                    {classSubjects.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
                        No subjects in this class yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {classSubjects.map((subject) => (
                          <SubjectInfoCard
                            key={subject.id}
                            subject={subject}
                            onDelete={handleSubjectDeleted}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
