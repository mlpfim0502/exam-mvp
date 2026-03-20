// src/hooks/useExam.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Exam, Question } from '@/lib/types';

interface UseExamResult {
  exam: Exam | null;
  questions: Question[];
  loading: boolean;
  error: string | null;
}

export function useExam(examId: string): UseExamResult {
  const [exam, setExam]           = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const [examRes, questionsRes] = await Promise.all([
        supabase.from('exams').select('*').eq('id', examId).single(),
        supabase
          .from('questions')
          .select('*')
          .eq('exam_id', examId)
          .order('q_num'),
      ]);

      if (examRes.error) {
        setError(examRes.error.message);
      } else {
        setExam(examRes.data);
        setQuestions(questionsRes.data ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, [examId]);

  return { exam, questions, loading, error };
}
