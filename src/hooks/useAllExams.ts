'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Exam } from '@/lib/types';

export interface ExamWithMeta extends Exam {
  subject_name: string | null;
  question_count: number;
}

export function useAllExams() {
  const [exams, setExams] = useState<ExamWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('exams')
      .select('*, subjects(name), questions(id)')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setExams(
            (data ?? []).map((e: any) => ({
              ...e,
              subject_name: e.subjects?.name ?? null,
              question_count: Array.isArray(e.questions) ? e.questions.length : 0,
            }))
          );
        }
        setLoading(false);
      });
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return { exams, loading, error, refetch };
}
