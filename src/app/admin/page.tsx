'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Users, Plus } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { useUsers } from '@/hooks/useUsers';

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}

function MetricCard({ label, value, icon: Icon, loading }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
      <div className="bg-indigo-50 p-3 rounded-xl">
        <Icon size={20} className="text-indigo-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {loading ? (
            <span className="w-8 h-6 bg-gray-100 rounded animate-pulse inline-block" />
          ) : (
            value
          )}
        </p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { classes, loading: classesLoading } = useClasses();
  const { users, loading: usersLoading } = useUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Classes" value={classes.length} icon={GraduationCap} loading={classesLoading} />
        <MetricCard label="Subjects" value={subjects.length} icon={BookOpen} loading={subjectsLoading} />
        <MetricCard label="Users" value={users.length} icon={Users} loading={usersLoading} />
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/classes/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Class
        </Link>
        <Link
          href="/admin/subjects/new"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Plus size={16} />
          New Subject
        </Link>
      </div>
    </div>
  );
}
