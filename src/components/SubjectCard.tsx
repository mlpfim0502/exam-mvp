// src/components/SubjectCard.tsx
'use client';

import { BookOpen, ChevronRight } from 'lucide-react';
import type { Subject } from '@/lib/types';

interface Props {
  subject: Subject;
  isSelected: boolean;
  onClick: () => void;
}

export default function SubjectCard({ subject, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
        ${isSelected
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
        ${isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500'}`}>
        {subject.icon_url ? (
          <img src={subject.icon_url} alt="" className="w-6 h-6 object-contain" />
        ) : (
          <BookOpen size={24} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
          {subject.name}
        </p>
        {subject.description && (
          <p className="text-sm text-gray-500 truncate mt-0.5">{subject.description}</p>
        )}
      </div>

      <ChevronRight
        size={18}
        className={`flex-shrink-0 transition-transform
          ${isSelected ? 'text-indigo-500 rotate-90' : 'text-gray-400'}`}
      />
    </button>
  );
}
