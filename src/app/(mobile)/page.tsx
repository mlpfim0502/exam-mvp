// src/app/(mobile)/page.tsx
'use client';

import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/components/LiffProvider';
import { useSubjects } from '@/hooks/useSubjects';
import SubjectCard from '@/components/SubjectCard';

export default function ClassPage() {
  const { profile } = useLiff();
  const { subjects, loading } = useSubjects();
  const router = useRouter();

  return (
    <div>
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
            </div>
          </div>
        )}
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Subjects
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  isSelected={false}
                  onClick={() => router.push(`/qbank/${subject.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
