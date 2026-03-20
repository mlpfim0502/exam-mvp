# Exam MVP — Agent Handoff

**Last updated:** 2026-03-20  
**Active branch:** `feat/admin-and-class-management`  
**Latest Vercel preview:** https://exam-p332icqpa-chen-yu-lees-projects.vercel.app  
**GitHub PR:** https://github.com/mlpfim0502/exam-mvp/pull/4 (Draft — not yet merged to main)

---

## Project Overview

Next.js 16.2 exam app for medical students. Students log in via LINE (LIFF), see subjects relevant to their class, and take exams. Admins manage subjects, exams, questions, classes, and users.

**Tech stack:** Next.js 16.2, TypeScript, TailwindCSS, Supabase (PostgreSQL + RLS), `@line/liff`, `lucide-react`, Vercel

**Key env vars (in `.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_LIFF_ID`

---

## ⚠️ Critical Next.js 15/16 Gotchas — Read This First

These issues caused repeated crashes throughout this session. Every future change must follow these rules:

### 1. `params` must be awaited
Dynamic route pages no longer receive `params` as a plain object. It is a **Promise**:
```tsx
// ✅ Correct
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// ❌ Wrong — id will be undefined
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id; // undefined!
}
```

### 2. NEVER use inline `'use server'` functions in `.map()` loops
```tsx
// ❌ This crashes at runtime in Next.js 15/16
users.map(user => (
  <form action={async () => { 'use server'; await doSomething(user.id); }}>
```

### 3. NEVER use `.bind()` on server actions in a loop
```tsx
// ❌ Also crashes
<form action={myServerAction.bind(null, user.id)}>
```

### 4. ✅ The ONLY working pattern for passing dynamic data to server actions
Use **hidden form fields**:
```tsx
// server action
export async function myAction(formData: FormData) {
  const id = formData.get('userId') as string;
  // ...
}

// component
<form action={myAction}>
  <input type="hidden" name="userId" value={user.id} />
  <button type="submit">Do it</button>
</form>
```

### 5. For forms needing client-side reactivity
Extract into a client component. Server page fetches data, passes as props:
```
page.tsx (server) → fetches data → <MyForm data={data} /> (client, 'use client')
```
See `src/app/admin/exams/[id]/questions/new/NewQuestionForm.tsx` as a working example.

---

## Database Schema

Run `supabase_setup.sql` for full schema. Key tables:

| Table | Purpose |
|---|---|
| `users` | LINE-authenticated users (`line_id`, `display_name`, `avatar_url`, `role`) |
| `subjects` | Medical subjects (Internal Medicine, Surgery…) |
| `exams` | Exams under a subject |
| `questions` | MCQ/TF questions under an exam |
| `classes` | Student groups (e.g. M5, M6) |
| `class_subjects` | Many-to-many: which subjects belong to a class |
| `user_classes` | Many-to-many: which classes a user is enrolled in |
| `user_subjects` | Optional individual subject override (not yet used in UI) |

**If you only need the NEW tables** (classes etc.) and `supabase_setup.sql` was already run, use `supabase_migration_classes.sql` instead to avoid "policy already exists" errors.

**RLS:** All policies are currently permissive (`USING (true)`) for MVP speed. Production will need role-based enforcement.

---

## What Has Been Built

### Admin Pages (`/admin/*`)

| Route | Description |
|---|---|
| `/admin` | Dashboard: subject/exam counts, quick links |
| `/admin/subjects/new` | Create a new subject |
| `/admin/exams` | List all exams |
| `/admin/exams/new` | Create a new exam under a subject |
| `/admin/exams/[id]` | View questions for an exam, + "Add Question" button |
| `/admin/exams/[id]/questions/new` | Add MCQ or TF question (client component, toggles A–E options) |
| `/admin/classes` | Create and list classes |
| `/admin/classes/[id]` | Assign subjects to a class via checkboxes |
| `/admin/users` | View all users, toggle admin/student role |
| `/admin/users/[id]` | Assign classes to a user via checkboxes |

**How to reach admin:** There is an "Admin" button in the student dashboard header (top-right of the indigo banner, only visible when logged in via LINE).

### Student Dashboard (`/`)

- Subjects filtered by user's class memberships (via `useClassSubjects` hook: `src/hooks/useClassSubjects.ts`)
- Falls back to showing ALL subjects if the user has no class assigned
- Class name badges shown below user's display name

### Server Actions

- `src/actions/admin.ts`: `createSubject`, `createExam`, `createQuestion`, `createQuestionForm`
- `src/actions/classes.ts`: `createClass`, `updateClassSubjects`, `saveClassSubjectsForm`, `updateUserClasses`, `saveUserClassesForm`, `updateUserRole`, `toggleUserRole`

---

## Known Working Patterns for Forms

All mutations in admin use this exact structure — do not deviate:

```tsx
// Simple form (no dynamic data)
<form action={createSubject}>
  <input name="name" />
  <button type="submit">Save</button>
</form>

// Form needing to pass an ID
<form action={saveClassSubjectsForm}>
  <input type="hidden" name="classId" value={classId} />
  <input type="checkbox" name="subject_ids" value={subject.id} />
  <button type="submit">Save</button>
</form>

// Toggle in a loop
<form action={toggleUserRole}>
  <input type="hidden" name="userId" value={user.id} />
  <input type="hidden" name="currentRole" value={user.role} />
  <button type="submit">Toggle</button>
</form>
```

---

## Deployment

```bash
# Run local dev
npm run dev

# Expose via LINE-compatible tunnel
ssh -o ServerAliveInterval=60 -R 80:localhost:3000 nokey@localhost.run

# Deploy Vercel preview
vercel --yes

# Deploy to production
vercel --prod
```

- GitHub repo: `https://github.com/mlpfim0502/exam-mvp`
- Vercel project: `chen-yu-lees-projects/exam-mvp`
- Production: `exam-mvp.vercel.app`

---

## What To Build Next

### High Priority

1. **Role-based access control on admin pages**  
   Currently `/admin` is accessible to any logged-in user. Add a check in `src/app/admin/layout.tsx` that reads the user's Supabase `role` and redirects non-admins back to `/`.  
   The user's LINE ID is available via LIFF; cross-reference it with the `users` table to get their role. Consider using Next.js middleware or a server-side check in layout.

2. **Redirect after form submissions**  
   Most admin forms currently reload the same page after saving. They should redirect:
   - Create Subject → back to `/admin` or a subjects list
   - Create Exam → back to `/admin/exams`
   - Create Class → back to `/admin/classes`  
   Use `redirect()` from `next/navigation` in the server action after the insert.

3. **Edit and delete for subjects, exams, questions, classes**  
   Currently everything is create-only. Add:
   - Delete buttons on each list page (e.g. `/admin/exams`, `/admin/classes`)
   - Optional: edit forms

4. **Question editing and reordering**  
   On `/admin/exams/[id]`, questions are listed but not editable. Add:
   - Edit question inline or via a new `/admin/exams/[id]/questions/[qid]/edit` page
   - Delete question button

5. **Image upload for questions**  
   The `questions` table has `stem_img_url` and `explanation_img_url` columns (see `src/lib/types.ts`). The question form doesn't support these yet. Add Supabase Storage upload for question images.

6. **Student exam-taking flow**  
   The student dashboard shows subjects and can navigate to exams, but the actual **exam-taking UI** (show question one by one or all at once, record answers, show score) is not yet built.

### Lower Priority

7. **Individual subject selection by student**  
   The `user_subjects` table exists but has no UI. Students could optionally subscribe to extra subjects beyond their class defaults.

8. **Make `supabase_setup.sql` idempotent**  
   Replace all `CREATE POLICY` with `DROP POLICY IF EXISTS` + `CREATE POLICY` so it can be re-run safely.

9. **Production RLS hardening**  
   Current policies use `USING (true)` (public access). For production:
   - Updates/deletes should require `auth.uid()` to match or user role = 'admin'
   - Consider using Supabase Auth JWT claims to encode the role

---

## LINE LIFF / Testing Notes

- LIFF Endpoint URL is set to one specific production URL in the LINE Developer Console. The app will redirect to LINE login on preview URLs that aren't registered.
- **For local testing:** use the `localhost.run` SSH tunnel (already running). The tunnel URL changes every session.
- **For staging:** create a second LIFF app in LINE Developers Console with the Vercel preview URL set as its endpoint, then set `NEXT_PUBLIC_LIFF_ID` in Vercel's Preview environment variables to that LIFF app's ID.

---

## File Structure Reference

```
src/
  actions/
    admin.ts          # createSubject, createExam, createQuestion, createQuestionForm
    classes.ts        # createClass, updateClassSubjects, saveClassSubjectsForm,
                      # updateUserClasses, saveUserClassesForm, updateUserRole, toggleUserRole
  app/
    page.tsx                              # Student dashboard (uses useClassSubjects hook)
    admin/
      layout.tsx                          # Admin nav (Overview, Users, Classes, Exams, New Subject, New Exam)
      page.tsx                            # Admin dashboard
      subjects/new/page.tsx               # Create subject
      exams/
        page.tsx                          # List exams
        new/page.tsx                      # Create exam
        [id]/
          page.tsx                        # Exam detail (list questions)
          questions/new/
            page.tsx                      # Server wrapper (fetches exam + nextQNum)
            NewQuestionForm.tsx           # Client form with MCQ/TF toggle ← pattern example
      classes/
        page.tsx                          # Create + list classes
        [id]/page.tsx                     # Assign subjects to class
      users/
        page.tsx                          # List users, toggle role
        [id]/page.tsx                     # Assign classes to user
  hooks/
    useClassSubjects.ts   # Fetches subjects by user's class memberships
    useSubjects.ts        # Fetches all subjects (used as fallback)
    useExams.ts           # Fetches exams by subject
  lib/
    supabase.ts           # Lazy Supabase client singleton
    types.ts              # TypeScript interfaces (User, Subject, Exam, Question…)
  components/
    LiffProvider.tsx      # Handles LINE login, exposes profile + supabaseUserId
supabase_setup.sql              # Full schema + RLS + seed data (run once)
supabase_migration_classes.sql  # Delta: only new tables (run if setup.sql already ran)
```
