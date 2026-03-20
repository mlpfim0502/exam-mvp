// src/hooks/useSubjects.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subject } from '@/lib/types';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) {
        setError(error.message);
      } else {
        setSubjects(data ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { subjects, loading, error };
}
