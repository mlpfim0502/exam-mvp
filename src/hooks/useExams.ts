// src/hooks/useExams.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Exam } from '@/lib/types';

export function useExams(subjectId: string | null) {
  const [exams, setExams]     = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) {
      setExams([]);
      return;
    }
    setLoading(true);
    const fetch = async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at');

      if (error) {
        setError(error.message);
      } else {
        setExams(data ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, [subjectId]);

  return { exams, loading, error };
}
