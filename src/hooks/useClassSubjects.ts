// src/hooks/useClassSubjects.ts
// Returns the subjects accessible to a user based on their class memberships.
// If the user has no class assigned, falls back to all available subjects.
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subject } from '@/lib/types';

export function useClassSubjects(supabaseUserId: string | null) {
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [classNames, setClassNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);

      // If no user, fall back to all subjects
      if (!supabaseUserId) {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name');
        if (error) setError(error.message);
        else setSubjects(data ?? []);
        setLoading(false);
        return;
      }

      // Step 1: get the class IDs the user is assigned to
      const { data: userClasses, error: ucError } = await supabase
        .from('user_classes')
        .select('class_id, classes(name)')
        .eq('user_id', supabaseUserId);

      if (ucError) {
        setError(ucError.message);
        setLoading(false);
        return;
      }

      // If user has no classes, show all subjects
      if (!userClasses || userClasses.length === 0) {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name');
        if (error) setError(error.message);
        else setSubjects(data ?? []);
        setLoading(false);
        return;
      }

      // Collect class names for display
      setClassNames(userClasses.map((uc: any) => uc.classes?.name).filter(Boolean));

      // Step 2: get the subject IDs linked to those classes
      const classIds = userClasses.map((uc: any) => uc.class_id);
      const { data: classSubjects, error: csError } = await supabase
        .from('class_subjects')
        .select('subject_id')
        .in('class_id', classIds);

      if (csError) {
        setError(csError.message);
        setLoading(false);
        return;
      }

      if (!classSubjects || classSubjects.length === 0) {
        // Classes exist but have no subjects assigned yet — show empty
        setSubjects([]);
        setLoading(false);
        return;
      }

      // Step 3: fetch the actual subject rows (deduplicated)
      const subjectIds = [...new Set(classSubjects.map(cs => cs.subject_id))];
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .in('id', subjectIds)
        .order('name');

      if (error) setError(error.message);
      else setSubjects(data ?? []);
      setLoading(false);
    };

    fetchSubjects();
  }, [supabaseUserId]);

  return { subjects, loading, error, classNames };
}
