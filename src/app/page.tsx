// src/app/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { useLiff } from '@/components/LiffProvider';
import { useClassSubjects } from '@/hooks/useClassSubjects';
import { useExams } from '@/hooks/useExams';
import SubjectCard from '@/components/SubjectCard';
import ExamCard from '@/components/ExamCard';

export default function DashboardPage() {
  const { profile, supabaseUserId } = useLiff();
  const { subjects, loading: subjectsLoading, classNames } = useClassSubjects(supabaseUserId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const { exams, loading: examsLoading } = useExams(selectedSubjectId);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleSubjectClick = (id: string) => {
    setSelectedSubjectId((prev) => (prev === id ? null : id)); // toggle
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 px-5 pt-10 pb-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap size={28} />
          <h1 className="text-xl font-bold tracking-tight">Exam Practice</h1>
        </div>
        {profile && (
          <div className="flex items-center gap-3">
            {profile.pictureUrl && (
              <Image
                src={profile.pictureUrl}
                alt={profile.displayName}
                width={40}
                height={40}
                className="rounded-full border-2 border-white/40"
              />
            )}
            <div>
              <p className="text-sm text-indigo-200">Welcome back,</p>
              <p className="font-semibold">{profile.displayName}</p>
              {classNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {classNames.map(name => (
                    <span key={name} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{name}</span>
                  ))}
                </div>
              )}
            </div>
            <Link href="/admin" className="ml-auto text-xs bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition font-medium">
              Admin
            </Link>
          </div>
        )}
      </div>

      <div className="px-4 -mt-4">
        {/* Subjects section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {classNames.length > 0 ? 'Your Subjects' : 'All Subjects'}
          </h2>
          {subjectsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">
              {classNames.length > 0
                ? 'No subjects assigned to your class yet.'
                : 'No subjects available.'}
            </p>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  isSelected={selectedSubjectId === subject.id}
                  onClick={() => handleSubjectClick(subject.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Exams section (shown when a subject is selected) */}
        {selectedSubjectId && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {selectedSubject?.name} — Exams
            </h2>
            {examsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : exams.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No exams available yet.</p>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
