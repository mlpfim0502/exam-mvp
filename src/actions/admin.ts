'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function createSubject(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const icon_url = formData.get('icon_url') as string;

  if (!name) throw new Error("Subject name is required");

  const { data, error } = await supabase
    .from('subjects')
    .insert([{ 
      name, 
      description: description || null, 
      icon_url: icon_url || null 
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}

export async function createExam(formData: FormData) {
  const subject_id = formData.get('subject_id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const time_limit_str = formData.get('time_limit_minutes') as string;
  
  if (!subject_id || !title) throw new Error("Subject and Title are required");

  const time_limit_minutes = time_limit_str ? parseInt(time_limit_str, 10) : null;

  const { data, error } = await supabase
    .from('exams')
    .insert([{ 
      subject_id, 
      title, 
      description: description || null, 
      time_limit_minutes 
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}
