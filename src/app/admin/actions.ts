'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseAdmin';
import type { UserRole } from '@/lib/types';

// ── Admin session auth ──────────────────────────────────────────────────────

const ADMIN_COOKIE = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function adminLogin(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const password = (formData.get('password') as string)?.trim();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) return { success: false, error: 'ADMIN_PASSWORD env var not set' };
  if (password !== expected) return { success: false, error: 'Incorrect password' };

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  redirect('/admin');
  return { success: true };
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

// ── Classes ─────────────────────────────────────────────────────────────────

export async function createClass(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { success: false, error: 'Class name is required' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('classes').insert({ name }).select('id').single();
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/classes');
  const result = { success: true } as const;
  redirect('/admin/classes');
  return result;
}

export async function updateClass(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { success: false, error: 'Name required' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('classes').update({ name }).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/classes');
  return { success: true };
}

export async function deleteClass(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/classes');
  return { success: true };
}

// ── Subjects ─────────────────────────────────────────────────────────────────

export async function createSubject(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name        = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const class_id    = (formData.get('class_id') as string) || null;

  if (!name) return { success: false, error: 'Subject name is required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('subjects')
    .insert({ name, description, class_id })
    .select('id')
    .single();
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/subjects');
  const result = { success: true } as const;
  redirect('/admin/subjects');
  return result;
}

export async function updateSubject(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name        = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const class_id    = (formData.get('class_id') as string) || null;

  if (!name) return { success: false, error: 'Name required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('subjects')
    .update({ name, description, class_id })
    .eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/subjects');
  return { success: true };
}

export async function deleteSubject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/subjects');
  return { success: true };
}

// ── Exams ────────────────────────────────────────────────────────────────────

export async function createExam(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const title              = (formData.get('title') as string)?.trim();
  const description        = (formData.get('description') as string)?.trim() || null;
  const subject_id         = (formData.get('subject_id') as string) || null;
  const time_limit_minutes = formData.get('time_limit_minutes')
    ? Number(formData.get('time_limit_minutes'))
    : null;

  if (!title) return { success: false, error: 'Title required' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('exams')
    .insert({ title, description, subject_id, time_limit_minutes })
    .select('id')
    .single();
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/exams');
  redirect(`/admin/exams/${data.id}`);
  return { success: true };
}

export async function updateExam(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const title              = (formData.get('title') as string)?.trim();
  const description        = (formData.get('description') as string)?.trim() || null;
  const subject_id         = (formData.get('subject_id') as string) || null;
  const time_limit_minutes = formData.get('time_limit_minutes')
    ? Number(formData.get('time_limit_minutes'))
    : null;

  if (!title) return { success: false, error: 'Title required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('exams')
    .update({ title, description, subject_id, time_limit_minutes })
    .eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/exams/${id}`);
  revalidatePath('/admin/exams');
  redirect(`/admin/exams/${id}`);
  return { success: true };
}

export async function deleteExam(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('exams').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/exams');
  redirect('/admin/exams');
  return { success: true };
}

// ── Questions ────────────────────────────────────────────────────────────────

export async function createQuestion(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const exam_id     = (formData.get('exam_id') as string)?.trim();
  const q_num       = Number(formData.get('q_num'));
  const type        = formData.get('type') as 'MCQ' | 'TF';
  const stem        = (formData.get('stem') as string)?.trim();
  const answer      = (formData.get('answer') as string)?.trim().toUpperCase();
  const opt_a       = (formData.get('opt_a') as string)?.trim() || null;
  const opt_b       = (formData.get('opt_b') as string)?.trim() || null;
  const opt_c       = (formData.get('opt_c') as string)?.trim() || null;
  const opt_d       = (formData.get('opt_d') as string)?.trim() || null;
  const explanation = (formData.get('explanation') as string)?.trim() || null;

  if (!exam_id || !stem || !answer)
    return { success: false, error: 'exam_id, stem, and answer are required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('questions')
    .insert({ exam_id, q_num, type, stem, opt_a, opt_b, opt_c, opt_d, answer, explanation });
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/exams/${exam_id}`);
  redirect(`/admin/exams/${exam_id}`);
  return { success: true };
}

export async function updateQuestion(
  id: string,
  exam_id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const type        = formData.get('type') as 'MCQ' | 'TF';
  const stem        = (formData.get('stem') as string)?.trim();
  const answer      = (formData.get('answer') as string)?.trim().toUpperCase();
  const opt_a       = (formData.get('opt_a') as string)?.trim() || null;
  const opt_b       = (formData.get('opt_b') as string)?.trim() || null;
  const opt_c       = (formData.get('opt_c') as string)?.trim() || null;
  const opt_d       = (formData.get('opt_d') as string)?.trim() || null;
  const explanation = (formData.get('explanation') as string)?.trim() || null;

  if (!stem || !answer) return { success: false, error: 'stem and answer are required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('questions')
    .update({ type, stem, opt_a, opt_b, opt_c, opt_d, answer, explanation })
    .eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/exams/${exam_id}`);
  redirect(`/admin/exams/${exam_id}`);
  return { success: true };
}

export async function deleteQuestion(
  id: string,
  exam_id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/exams/${exam_id}`);
  return { success: true };
}

export async function updateUser(
  userId: string,
  data: { class_id?: string | null; is_blocked?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // If changing class_id, verify the class exists if we want, but DB constraint handles it.
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}


