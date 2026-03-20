'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function createClass(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) throw new Error("Class name is required");

  const { data, error } = await supabase
    .from('classes')
    .insert([{ name, description: description || null }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/admin/classes');
  return data;
}

export async function updateClassSubjects(classId: string, subjectIds: string[]) {
  // Clear old links
  await supabase.from('class_subjects').delete().eq('class_id', classId);
  
  // Insert new links
  if (subjectIds.length > 0) {
    const inserts = subjectIds.map(subId => ({ class_id: classId, subject_id: subId }));
    const { error } = await supabase.from('class_subjects').insert(inserts);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/classes');
  revalidatePath('/admin/classes/' + classId);
  revalidatePath('/');
}

export async function updateUserClasses(userId: string, classIds: string[]) {
  // Clear old class assignments
  await supabase.from('user_classes').delete().eq('user_id', userId);
  
  // Insert new class assignments
  if (classIds.length > 0) {
    const inserts = classIds.map(cId => ({ user_id: userId, class_id: cId }));
    const { error } = await supabase.from('user_classes').insert(inserts);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/users');
  revalidatePath('/');
}

export async function updateUserRole(userId: string, role: string) {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/users');
}
