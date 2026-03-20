// src/hooks/useClasses.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Class } from '@/lib/types';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('classes')
      .select('*')
      .order('name')
      .limit(200)
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setClasses(data ?? []);
        setLoading(false);
      });
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return { classes, loading, error, refetch };
}
