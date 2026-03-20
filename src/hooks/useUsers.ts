// src/hooks/useUsers.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('users')
      .select('*')
      .order('created_at')
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setUsers(data ?? []);
        setLoading(false);
      });
  }, []);

  return { users, loading, error };
}
