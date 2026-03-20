import Link from 'next/link';
import { Settings, BookOpen, Layers, Users, Library } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-indigo-600 px-5 pt-10 pb-6 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Settings size={28} className="animate-spin-slow" />
          <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <Link href="/" className="text-sm text-indigo-200 hover:text-white transition">
          Exit Admin
        </Link>
      </div>

      <div className="flex bg-white shadow-sm mb-6 border-b border-gray-100 overflow-x-auto">
        <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 flex-shrink-0">
          <Settings size={16} /> Overview
        </Link>
        <Link href="/admin/users" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 flex-shrink-0">
          <Users size={16} /> Users
        </Link>
        <Link href="/admin/classes" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 flex-shrink-0">
          <Library size={16} /> Classes
        </Link>
        <Link href="/admin/exams" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 flex-shrink-0">
          <Layers size={16} /> Exams
        </Link>
        <Link href="/admin/subjects/new" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 flex-shrink-0">
          <BookOpen size={16} /> New Subject
        </Link>
        <Link href="/admin/exams/new" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 flex-shrink-0">
          <Layers size={16} /> New Exam
        </Link>
      </div>

      <main className="px-4">
        {children}
      </main>
    </div>
  );
}
