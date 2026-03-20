# Admin Exam Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete admin UI for creating and managing exams and their questions, so admins can populate the platform without touching the database directly.

**Architecture:** Add an "Exams" section to the admin panel with list/create/detail pages following the exact same patterns as the existing Classes and Subjects admin pages. Server actions handle mutations via `createAdminClient`. A new `useAllExams` hook fetches all exams (with subject name) for the admin list view.

**Tech Stack:** Next.js 16.2 App Router, Supabase JS SDK, TailwindCSS 4, lucide-react, sonner (toasts), existing server action pattern in `src/app/admin/actions.ts`

---

## Task 1: Add "Exams" to Admin Sidebar + Overview

**Files:**
- Modify: `src/components/AdminSidebar.tsx`
- Modify: `src/app/admin/page.tsx`

**Step 1: Add Exams nav item to sidebar**

Open `src/components/AdminSidebar.tsx`. Add `{ label: 'Exams', href: '/admin/exams', icon: FileText }` to `NAV_ITEMS` (import `FileText` from lucide-react):

```tsx
import { LayoutDashboard, BookOpen, Users, GraduationCap, FileText } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview',  href: '/admin',          icon: LayoutDashboard },
  { label: 'Classes',   href: '/admin/classes',   icon: GraduationCap },
  { label: 'Subjects',  href: '/admin/subjects',  icon: BookOpen },
  { label: 'Exams',     href: '/admin/exams',     icon: FileText },
  { label: 'Users',     href: '/admin/users',     icon: Users },
];
```

**Step 2: Add exams metric + "New Exam" button to overview**

Open `src/app/admin/page.tsx`. Add `useAllExams` hook (will create in Task 2) and a 4th metric card, plus a "New Exam" quick-action button:

```tsx
'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Users, Plus, FileText } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { useUsers } from '@/hooks/useUsers';
import { useAllExams } from '@/hooks/useAllExams';

// ... MetricCard unchanged ...

export default function AdminOverviewPage() {
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { classes, loading: classesLoading }   = useClasses();
  const { users, loading: usersLoading }       = useUsers();
  const { exams, loading: examsLoading }       = useAllExams();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Classes"  value={classes.length}  icon={GraduationCap} loading={classesLoading} />
        <MetricCard label="Subjects" value={subjects.length} icon={BookOpen}      loading={subjectsLoading} />
        <MetricCard label="Exams"    value={exams.length}    icon={FileText}      loading={examsLoading} />
        <MetricCard label="Users"    value={users.length}    icon={Users}         loading={usersLoading} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/classes/new"  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> New Class
        </Link>
        <Link href="/admin/subjects/new" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          <Plus size={16} /> New Subject
        </Link>
        <Link href="/admin/exams/new"    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          <Plus size={16} /> New Exam
        </Link>
      </div>
    </div>
  );
}
```

**Step 3: Commit**
```bash
git add src/components/AdminSidebar.tsx src/app/admin/page.tsx
git commit -m "feat: add Exams to admin sidebar and overview metrics"
```

---

## Task 2: Create `useAllExams` Hook

**Files:**
- Create: `src/hooks/useAllExams.ts`

This hook fetches ALL exams (not filtered by subject) with the subject name joined for display in the admin list.

**Step 1: Create the hook**

```ts
// src/hooks/useAllExams.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Exam } from '@/lib/types';

export interface ExamWithSubject extends Exam {
  subject_name: string | null;
  question_count: number;
}

export function useAllExams() {
  const [exams, setExams]     = useState<ExamWithSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          subjects ( name ),
          questions ( id )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setExams(
          (data ?? []).map((e: any) => ({
            ...e,
            subject_name:   e.subjects?.name ?? null,
            question_count: Array.isArray(e.questions) ? e.questions.length : 0,
          }))
        );
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { exams, loading, error };
}
```

**Step 2: Commit**
```bash
git add src/hooks/useAllExams.ts
git commit -m "feat: add useAllExams hook with subject name and question count"
```

---

## Task 3: Add Server Actions for Exam & Question Creation

**Files:**
- Modify: `src/app/admin/actions.ts`

**Step 1: Append `createExam` and `createQuestion` to actions.ts**

Add at the bottom of `src/app/admin/actions.ts`:

```ts
export async function createExam(formData: FormData): Promise<{ success: boolean; error?: string; id?: string }> {
  const title              = (formData.get('title') as string)?.trim();
  const description        = (formData.get('description') as string)?.trim() || null;
  const subject_id         = (formData.get('subject_id') as string) || null;
  const time_limit_minutes = formData.get('time_limit_minutes')
    ? Number(formData.get('time_limit_minutes'))
    : null;

  if (!title) return { success: false, error: 'Exam title is required' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('exams')
    .insert({ title, description, subject_id, time_limit_minutes })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/exams');
  revalidatePath('/admin');
  const result = { success: true, id: data.id } as const;
  redirect(`/admin/exams/${data.id}`);
  return result;
}

export async function createQuestion(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const exam_id     = (formData.get('exam_id') as string)?.trim();
  const q_num       = Number(formData.get('q_num'));
  const type        = (formData.get('type') as string) as 'MCQ' | 'TF';
  const stem        = (formData.get('stem') as string)?.trim();
  const opt_a       = (formData.get('opt_a') as string)?.trim() || null;
  const opt_b       = (formData.get('opt_b') as string)?.trim() || null;
  const opt_c       = (formData.get('opt_c') as string)?.trim() || null;
  const opt_d       = (formData.get('opt_d') as string)?.trim() || null;
  const opt_e       = (formData.get('opt_e') as string)?.trim() || null;
  const answer      = (formData.get('answer') as string)?.trim().toUpperCase();
  const explanation = (formData.get('explanation') as string)?.trim() || null;

  if (!exam_id) return { success: false, error: 'exam_id is required' };
  if (!stem)    return { success: false, error: 'Question stem is required' };
  if (!answer)  return { success: false, error: 'Answer is required' };

  const supabaseClient = createAdminClient();
  const { error } = await supabaseClient
    .from('questions')
    .insert({ exam_id, q_num, type, stem, opt_a, opt_b, opt_c, opt_d, opt_e, answer, explanation });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/exams/${exam_id}`);
  const result = { success: true } as const;
  redirect(`/admin/exams/${exam_id}`);
  return result;
}
```

**Step 2: Commit**
```bash
git add src/app/admin/actions.ts
git commit -m "feat: add createExam and createQuestion server actions"
```

---

## Task 4: Exam List Page `/admin/exams`

**Files:**
- Create: `src/app/admin/exams/page.tsx`

```tsx
// src/app/admin/exams/page.tsx
'use client';

import Link from 'next/link';
import { Plus, Clock, HelpCircle } from 'lucide-react';
import { useAllExams } from '@/hooks/useAllExams';

export default function AdminExamsPage() {
  const { exams, loading } = useAllExams();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        <Link
          href="/admin/exams/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Exam
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
          No exams yet. Create your first exam.
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/admin/exams/${exam.id}`}
              className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{exam.title}</p>
                  {exam.subject_name && (
                    <p className="text-sm text-indigo-600 mt-0.5">{exam.subject_name}</p>
                  )}
                  {exam.description && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{exam.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={12} /> {exam.question_count} Q
                  </span>
                  {exam.time_limit_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {exam.time_limit_minutes} min
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/app/admin/exams/page.tsx
git commit -m "feat: add admin exam list page"
```

---

## Task 5: Create Exam Page `/admin/exams/new`

**Files:**
- Create: `src/app/admin/exams/new/page.tsx`

```tsx
// src/app/admin/exams/new/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createExam } from '@/app/admin/actions';
import { useSubjects } from '@/hooks/useSubjects';

export default function AdminNewExamPage() {
  const [isPending, startTransition] = useTransition();
  const { subjects } = useSubjects();
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId]   = useState('');
  const [timeLimit, setTimeLimit]   = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('title',              title);
    formData.set('description',        description);
    formData.set('subject_id',         subjectId);
    formData.set('time_limit_minutes', timeLimit);

    startTransition(async () => {
      const result = await createExam(formData);
      if (result?.error) toast.error(result.error);
    });
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Exam</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Algebra Midterm" required className={inputClass} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            className={inputClass} />
        </div>

        <div>
          <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select id="subject_id" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
            className={inputClass}>
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="time_limit" className="block text-sm font-medium text-gray-700 mb-1">
            Time Limit (minutes)
          </label>
          <input id="time_limit" type="number" min="1" max="300" value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)} placeholder="e.g. 60"
            className={inputClass} />
        </div>

        <button type="submit" disabled={isPending}
          className={`w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-colors
            ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {isPending ? 'Creating...' : 'Create Exam'}
        </button>
      </form>
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/app/admin/exams/new/page.tsx
git commit -m "feat: add admin create exam page"
```

---

## Task 6: Exam Detail Page `/admin/exams/[id]`

This page shows exam info + lists its questions + links to add a new question.

**Files:**
- Create: `src/app/admin/exams/[id]/page.tsx`

```tsx
// src/app/admin/exams/[id]/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Clock, ArrowLeft } from 'lucide-react';
import { useExam } from '@/hooks/useExam';

export default function AdminExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { exam, questions, loading, error } = useExam(id);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 rounded w-1/2" />
      <div className="h-24 bg-gray-100 rounded-2xl" />
    </div>;
  }

  if (error || !exam) {
    return <p className="text-red-500">{error ?? 'Exam not found'}</p>;
  }

  return (
    <div>
      <Link href="/admin/exams" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4">
        <ArrowLeft size={14} /> All Exams
      </Link>

      {/* Exam info card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            {exam.description && <p className="text-sm text-gray-500 mt-1">{exam.description}</p>}
          </div>
          {exam.time_limit_minutes && (
            <span className="flex items-center gap-1 text-sm text-gray-400 shrink-0">
              <Clock size={14} /> {exam.time_limit_minutes} min
            </span>
          )}
        </div>
      </div>

      {/* Questions section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Questions <span className="text-gray-400 font-normal text-base">({questions.length})</span>
        </h2>
        <Link
          href={`/admin/exams/${id}/questions/new`}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} /> Add Question
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No questions yet. Add your first question.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-gray-400 mt-0.5 w-6 shrink-0">Q{q.q_num}</span>
                <div className="min-w-0 flex-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2
                    ${q.type === 'MCQ' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                    {q.type}
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{q.stem}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">Answer: {q.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/app/admin/exams/[id]/page.tsx
git commit -m "feat: add admin exam detail page with questions list"
```

---

## Task 7: Add Question Page `/admin/exams/[id]/questions/new`

**Files:**
- Create: `src/app/admin/exams/[id]/questions/new/page.tsx`

```tsx
// src/app/admin/exams/[id]/questions/new/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { createQuestion } from '@/app/admin/actions';
import { useExam } from '@/hooks/useExam';

export default function AdminNewQuestionPage() {
  const { id: examId } = useParams<{ id: string }>();
  const { exam, questions } = useExam(examId);
  const [isPending, startTransition] = useTransition();

  const [type, setType]           = useState<'MCQ' | 'TF'>('MCQ');
  const [stem, setStem]           = useState('');
  const [optA, setOptA]           = useState('');
  const [optB, setOptB]           = useState('');
  const [optC, setOptC]           = useState('');
  const [optD, setOptD]           = useState('');
  const [answer, setAnswer]       = useState('');
  const [explanation, setExplanation] = useState('');

  const nextQNum = questions.length + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set('exam_id',     examId);
    formData.set('q_num',       String(nextQNum));
    formData.set('type',        type);
    formData.set('stem',        stem);
    formData.set('opt_a',       optA);
    formData.set('opt_b',       optB);
    formData.set('opt_c',       optC);
    formData.set('opt_d',       optD);
    formData.set('answer',      answer);
    formData.set('explanation', explanation);

    startTransition(async () => {
      const result = await createQuestion(formData);
      if (result?.error) toast.error(result.error);
    });
  };

  const inputClass  = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';
  const isMCQ       = type === 'MCQ';

  return (
    <div className="max-w-lg">
      <p className="text-sm text-indigo-600 mb-1">{exam?.title}</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Add Question {nextQNum}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex gap-3">
            {(['MCQ', 'TF'] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setType(t); setAnswer(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors
                  ${type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                {t === 'MCQ' ? 'Multiple Choice' : 'True / False'}
              </button>
            ))}
          </div>
        </div>

        {/* Stem */}
        <div>
          <label htmlFor="stem" className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
          <textarea id="stem" value={stem} onChange={(e) => setStem(e.target.value)}
            required rows={3} placeholder="Enter the question text..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
        </div>

        {/* MCQ options */}
        {isMCQ && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {[
              { key: 'A', val: optA, set: setOptA },
              { key: 'B', val: optB, set: setOptB },
              { key: 'C', val: optC, set: setOptC },
              { key: 'D', val: optD, set: setOptD },
            ].map(({ key, val, set }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-6 text-xs font-bold text-gray-400 text-center">{key}</span>
                <input type="text" value={val} onChange={(e) => set(e.target.value)}
                  placeholder={`Option ${key}`} className={inputClass} />
              </div>
            ))}
          </div>
        )}

        {/* Answer */}
        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer *
          </label>
          {isMCQ ? (
            <select id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)}
              required className={inputClass}>
              <option value="">Select answer</option>
              {['A', 'B', 'C', 'D'].map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          ) : (
            <div className="flex gap-3">
              {[{ label: 'True', value: 'T' }, { label: 'False', value: 'F' }].map(({ label, value }) => (
                <button key={value} type="button" onClick={() => setAnswer(value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors
                    ${answer === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Explanation */}
        <div>
          <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
            Explanation (optional)
          </label>
          <textarea id="explanation" value={explanation} onChange={(e) => setExplanation(e.target.value)}
            rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
        </div>

        <button type="submit" disabled={isPending}
          className={`w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-colors
            ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {isPending ? 'Saving...' : `Save Question ${nextQNum}`}
        </button>
      </form>
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/app/admin/exams/[id]/questions/new/page.tsx
git commit -m "feat: add admin new question page with MCQ/TF toggle"
```

---

## Verification

1. Start dev server: `npx next dev --port 3001`
2. Use Chrome (with Claude in Chrome) to navigate to `/admin`
3. Check: 4 metric cards show (Classes, Subjects, Exams, Users)
4. Check: Sidebar has "Exams" between "Subjects" and "Users"
5. Navigate to `/admin/exams` — shows empty state
6. Navigate to `/admin/exams/new` — fill out form, submit → redirects to exam detail
7. On exam detail page — click "Add Question" → fill out MCQ → save → question appears in list
8. Add a TF question — verify True/False toggle works, answer picker shows T/F buttons
9. Return to `/admin/exams` — exam shows with correct question count
