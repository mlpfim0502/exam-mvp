'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabaseAdmin';
import type { UserRole } from '@/lib/types';

export async function createClass(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { success: false, error: 'Class name is required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('classes')
    .insert({ name })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  // In production, redirect() throws (typed as never). In tests, it is mocked as a no-op.
  const result = { success: true } as const;
  redirect('/admin');
  return result;
}

export async function createSubject(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const class_id = (formData.get('class_id') as string) || null;

  if (!name) return { success: false, error: 'Subject name is required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('subjects')
    .insert({ name, description, class_id })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  // In production, redirect() throws (typed as never). In tests, it is mocked as a no-op.
  const result = { success: true } as const;
  redirect('/admin');
  return result;
}

export async function saveUserClassesForm(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { success: false, error: 'Class name is required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('classes')
    .insert({ name })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  // Revalidate the classes admin page (the redirect target for this form)
  revalidatePath('/admin/classes');
  const result = { success: true } as const;
  redirect('/admin/classes');
  return result;
}

export async function toggleUserRole(
  userId: string,
  currentRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Re-read current role from DB to prevent privilege escalation
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (fetchError || !userData) {
    return { success: false, error: fetchError?.message ?? 'User not found' };
  }

  const newRole: UserRole = userData.role === 'admin' ? 'student' : 'admin';
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}
