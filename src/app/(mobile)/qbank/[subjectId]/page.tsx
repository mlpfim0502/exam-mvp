'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useExams } from '@/hooks/useExams';
import ExamModeSheet from '@/components/ExamModeSheet';
import type { Exam } from '@/lib/types';
import type { StartOptions } from '@/components/ExamModeSheet';

type FilterTab = 'exams' | 'wrong' | 'note' | 'collection' | 'stats';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'wrong', label: 'Wrong' },
  { value: 'note', label: 'Note' },
  { value: 'collection', label: 'Collection' },
  { value: 'stats', label: 'Stats' },
];

export default function QbankPage({ params: _params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { subjects } = useSubjects();
  const { exams, loading } = useExams(subjectId);
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('exams');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const subject = subjects.find((s) => s.id === subjectId);

  const handleStart = (options: StartOptions) => {
    if (options.mode !== 'test') {
      alert('Memory and Practice modes coming soon!');
      return;
    }
    if (!selectedExam) return;
    setSelectedExam(null);
    router.push(`/exam/${selectedExam.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 pt-10 pb-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/" className="p-1 -ml-1 rounded-full active:bg-white/10">
            <ChevronLeft size={22} />
          </Link>
          <h1 className="text-lg font-bold truncate">
            {subject?.name ?? 'Qbank'}
          </h1>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        {FILTER_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeFilter === value
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {activeFilter !== 'exams' ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <AlertCircle size={32} className="text-gray-300" />
            <p className="text-sm">Coming soon</p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">No exams available.</p>
        ) : (
          <div className="space-y-2">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => setSelectedExam(exam)}
                className="w-full text-left bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm active:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{exam.title}</p>
                  {exam.time_limit_minutes && (
                    <p className="text-xs text-gray-400 mt-0.5">{exam.time_limit_minutes} min</p>
                  )}
                </div>
                <ChevronLeft size={18} className="rotate-180 text-gray-300" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mode Sheet */}
      {selectedExam && (
        <ExamModeSheet
          exam={selectedExam}
          onClose={() => setSelectedExam(null)}
          onStart={handleStart}
        />
      )}
    </div>
  );
}
