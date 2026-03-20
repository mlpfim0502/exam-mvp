// src/components/ExamCard.tsx
'use client';

import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Exam } from '@/lib/types';

interface Props {
  exam: Exam;
}

export default function ExamCard({ exam }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <p className="font-semibold text-gray-800 mb-1">{exam.title}</p>
      {exam.description && (
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">{exam.description}</p>
      )}
      <div className="flex items-center justify-between">
        {exam.time_limit_minutes ? (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={13} />
            {exam.time_limit_minutes} min
          </span>
        ) : (
          <span />
        )}
        <Link
          href={`/exam/${exam.id}`}
          className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Start
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
