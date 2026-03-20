// src/hooks/useSubjects.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subject } from '@/lib/types';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [tick, setTick]         = useState(0);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('subjects')
      .select('*')
      .order('name')
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setSubjects(data ?? []);
        setLoading(false);
      });
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return { subjects, loading, error, refetch };
}
