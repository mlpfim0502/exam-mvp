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

export async function createQuestion(examId: string, formData: FormData) {
  const q_num_str   = formData.get('q_num') as string;
  const type        = formData.get('type') as string;
  const stem        = formData.get('stem') as string;
  const answer      = formData.get('answer') as string;
  const opt_a       = (formData.get('opt_a') as string) || null;
  const opt_b       = (formData.get('opt_b') as string) || null;
  const opt_c       = (formData.get('opt_c') as string) || null;
  const opt_d       = (formData.get('opt_d') as string) || null;
  const opt_e       = (formData.get('opt_e') as string) || null;
  const explanation = (formData.get('explanation') as string) || null;

  if (!stem || !answer || !type) throw new Error('stem, type, and answer are required');

  const q_num = q_num_str ? parseInt(q_num_str, 10) : 1;

  const { data, error } = await supabase
    .from('questions')
    .insert([{ exam_id: examId, q_num, type, stem, opt_a, opt_b, opt_c, opt_d, opt_e, answer, explanation }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/exams/${examId}`);
  return data;
}

// Form-safe version using hidden examId field
export async function createQuestionForm(formData: FormData) {
  const examId = formData.get('examId') as string;
  return createQuestion(examId, formData);
}
