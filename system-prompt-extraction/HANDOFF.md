# Exam MVP — Agent Handoff

## What This Project Is

A LINE Mini App + standard WebApp for MCQ/TF exam practice. Built with:
- **Next.js 16.2** (App Router, TypeScript, TailwindCSS 4)
- **`@line/liff`** — LINE Front-end Framework SDK for auth
- **Supabase** (PostgreSQL + RLS) — database and backend
- **`lucide-react`** — icons
- Targeted for **Vercel** deployment

---

## Repository

- **GitHub:** https://github.com/mlpfim0502/exam-mvp
- **Main branch:** `main`
- **Local path:** `/Users/chenyulee/exam-mvp`
- **PR #1** (`claude/elastic-hamilton`) — all app code — merged
- **PR #2** (`claude/festive-hugle`) — tests + `.env.local.example` — merged

---

## Current State: What Is Done

All app code and tests are merged to `main`.

### App code

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                # Root layout: wraps everything in LiffProvider
│   ├── page.tsx                  # Dashboard: subjects list → exam cards
│   └── exam/
│       └── [id]/
│           ├── page.tsx          # Exam interface: questions, timer, submit
│           └── results/
│               └── page.tsx      # Results: score + per-question review
├── components/
│   ├── LiffProvider.tsx          # LIFF init + LINE login + Supabase user upsert
│   ├── LoadingScreen.tsx
│   ├── SubjectCard.tsx
│   ├── ExamCard.tsx
│   └── QuestionCard.tsx
├── hooks/
│   ├── useSubjects.ts
│   ├── useExams.ts
│   └── useExam.ts
└── lib/
    ├── types.ts
    └── supabase.ts               # Lazy Supabase singleton (Proxy pattern)
```

### Test suite

```
src/test/
├── setup.tsx                     # Global mocks: next/navigation, next/image, next/link
├── components/
│   ├── LoadingScreen.test.tsx
│   ├── SubjectCard.test.tsx
│   ├── ExamCard.test.tsx
│   ├── QuestionCard.test.tsx
│   └── LiffProvider.test.tsx
├── hooks/
│   ├── useSubjects.test.ts
│   ├── useExams.test.ts
│   └── useExam.test.ts
└── pages/
    ├── DashboardPage.test.tsx
    ├── ExamPage.test.tsx
    └── ResultsPage.test.tsx
```

**Test commands:**
```bash
npm test                  # 76 tests, all pass
npm run test:coverage     # coverage report
```

**Coverage:**
| Metric | Result | Threshold |
|--------|--------|-----------|
| Statements | 94.27% | 80% ✓ |
| Branches | 83.6% | 80% ✓ |
| Functions | 93.44% | 80% ✓ |
| Lines | 94.78% | 80% ✓ |

### Other files
- `.env.local.example` — template for env vars (force-added; `.gitignore` blocks `.env*`)
- `vitest.config.ts` — Vitest config with jsdom, coverage-v8, path alias

---

## What Still Needs to Be Done

### Step 1 (REQUIRED before the app works): Run Supabase SQL

Go to **Supabase project → SQL Editor** and run these three scripts in order.

#### Script A — Schema

```sql
CREATE TABLE IF NOT EXISTS users (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id      TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'student',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  icon_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id          UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  time_limit_minutes  INT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id             UUID REFERENCES exams(id) ON DELETE CASCADE,
  q_num               INT NOT NULL,
  type                VARCHAR(10) NOT NULL CHECK (type IN ('MCQ', 'TF')),
  stem                TEXT NOT NULL,
  stem_img_url        TEXT,
  opt_a               TEXT,
  opt_b               TEXT,
  opt_c               TEXT,
  opt_d               TEXT,
  opt_e               TEXT,
  answer              TEXT NOT NULL,
  explanation         TEXT,
  explanation_img_url TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES users(id),
  exam_id      UUID REFERENCES exams(id),
  score        NUMERIC,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id    UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id   UUID REFERENCES questions(id),
  user_response TEXT,
  is_correct    BOOLEAN
);
```

#### Script B — RLS Policies

```sql
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams           ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_public_read"    ON subjects  FOR SELECT USING (true);
CREATE POLICY "exams_public_read"       ON exams     FOR SELECT USING (true);
CREATE POLICY "questions_public_read"   ON questions FOR SELECT USING (true);
CREATE POLICY "users_public_select"     ON users FOR SELECT USING (true);
CREATE POLICY "users_public_insert"     ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_public_update"     ON users FOR UPDATE USING (true);
CREATE POLICY "attempts_public_insert"  ON exam_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "attempts_public_select"  ON exam_attempts FOR SELECT USING (true);
CREATE POLICY "attempts_public_update"  ON exam_attempts FOR UPDATE USING (true);
CREATE POLICY "answers_public_insert"   ON attempt_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "answers_public_select"   ON attempt_answers FOR SELECT USING (true);
```

#### Script C — Seed Data

```sql
INSERT INTO subjects (name, description) VALUES
  ('Mathematics', 'Algebra, geometry, and arithmetic'),
  ('Science',     'Physics, chemistry, and biology'),
  ('English',     'Grammar, vocabulary, and comprehension')
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  math_id    UUID;
  science_id UUID;
  alg_id     UUID;
  phy_id     UUID;
BEGIN
  SELECT id INTO math_id    FROM subjects WHERE name = 'Mathematics';
  SELECT id INTO science_id FROM subjects WHERE name = 'Science';

  INSERT INTO exams (subject_id, title, description, time_limit_minutes) VALUES
    (math_id,    'Algebra Basics',           'Equations, expressions, and linear functions', 15),
    (math_id,    'Geometry Fundamentals',    'Shapes, angles, area, and perimeter',          20),
    (science_id, 'Physics: Motion & Forces', 'Newton''s laws and basic kinematics',          20)
  ON CONFLICT DO NOTHING;

  SELECT id INTO alg_id FROM exams WHERE title = 'Algebra Basics';
  SELECT id INTO phy_id FROM exams WHERE title = 'Physics: Motion & Forces';

  INSERT INTO questions (exam_id, q_num, type, stem, opt_a, opt_b, opt_c, opt_d, answer, explanation) VALUES
    (alg_id, 1, 'MCQ', 'What is the value of x in the equation 2x + 6 = 14?',
     '2', '4', '6', '8', 'B', 'Subtract 6 from both sides: 2x = 8. Divide by 2: x = 4.'),
    (alg_id, 2, 'MCQ', 'Which of the following is equivalent to 3(x + 4)?',
     '3x + 4', '3x + 7', '3x + 12', 'x + 12', 'C', 'Distribute: 3 × x + 3 × 4 = 3x + 12.'),
    (alg_id, 3, 'MCQ', 'What is the slope of the line described by y = 3x − 5?',
     '-5', '3', '-3', '5', 'B', 'In y = mx + b form, m is the slope. Here m = 3.'),
    (alg_id, 4, 'TF',  'The equation 2x + 3 = 7 has the solution x = 2.',
     null, null, null, null, 'T', 'Substituting x = 2: 2(2) + 3 = 4 + 3 = 7. Correct!'),
    (alg_id, 5, 'TF',  'The expression x² is always positive for any real number x.',
     null, null, null, null, 'F', 'When x = 0, x² = 0, which is not positive. The statement is false.');

  INSERT INTO questions (exam_id, q_num, type, stem, opt_a, opt_b, opt_c, opt_d, answer, explanation) VALUES
    (phy_id, 1, 'MCQ', 'According to Newton''s Second Law, Force equals:',
     'mass × velocity', 'mass × acceleration', 'mass × distance', 'velocity × time',
     'B', 'F = ma. Newton''s Second Law: Force = mass × acceleration.'),
    (phy_id, 2, 'MCQ', 'What is the SI unit of force?',
     'Joule', 'Watt', 'Newton', 'Pascal', 'C', 'Force is measured in Newtons (N) in the SI system.'),
    (phy_id, 3, 'MCQ', 'A car travels 100 km in 2 hours. What is its average speed?',
     '25 km/h', '50 km/h', '75 km/h', '200 km/h', 'B', 'Average speed = distance ÷ time = 100 ÷ 2 = 50 km/h.'),
    (phy_id, 4, 'TF',  'Speed and velocity are the same physical quantity.',
     null, null, null, null, 'F', 'Speed is scalar (magnitude only); velocity is a vector (magnitude + direction).'),
    (phy_id, 5, 'TF',  'An object in uniform circular motion has a constant velocity.',
     null, null, null, null, 'F', 'Although speed is constant, direction changes — so velocity is not constant.');
END $$;
```

### Step 2 (REQUIRED): Fill in `.env.local`

Copy `.env.local.example` → `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_LIFF_ID=<your-liff-id>
```

Supabase values: Project Settings → API
LIFF ID: LINE Developers Console → your channel → LIFF tab

### Step 3 (OPTIONAL): Deploy to Vercel

```bash
npx vercel --prod
# Add the same 3 env vars in Vercel dashboard → Project → Settings → Environment Variables
```

Then update your LIFF channel's endpoint URL to the Vercel deployment URL.

---

## What Worked

### Test infrastructure
- **Vitest v4 + `@vitejs/plugin-react`** works cleanly with Next.js 16 / React 19.
- **jsdom** as the test environment works for all client components.
- **Global mocks in `setup.tsx`** (not `.ts`) — must be `.tsx` because the `next/image` and `next/link` mocks return JSX. Naming it `.ts` causes a parse failure.
- **`vi.mock()` hoisting** — Vitest hoists `vi.mock()` calls to the top, so module-level mocks declared before imports work correctly.
- **Import mocks after `vi.mock()`** — For hooks that need to be re-mocked per test, import the hook after the `vi.mock()` declaration and use `vi.mocked(hook).mockReturnValueOnce(...)` inside each test.

### Pattern for mocking Supabase in hooks
Each hook test uses its own `vi.mock('@/lib/supabase', ...)` with a chain ending in a resolved promise at the final method:
```ts
vi.mock('@/lib/supabase', () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [...], error: null }),
  };
  return { supabase: { from: vi.fn(() => chain) } };
});
```

### Pattern for `useExam` (two parallel `from()` calls)
`useExam` calls `Promise.all([supabase.from('exams')..., supabase.from('questions')...])`. Mock by switching on table name:
```ts
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'exams') return { select, eq, single: resolvesWith(examData) };
      return { select, eq, order: resolvesWith(questionsData) };
    }),
  },
}));
```

### `.env.local.example` needs force-add
The project `.gitignore` has `.env*` which matches `.env.local.example`. Use:
```bash
git add -f .env.local.example
```

---

## What Didn't Work

### 1. `await` inside `vi.mocked()` call
```ts
// BROKEN — oxc parser rejects await inside a non-async expression
const { useExam } = vi.mocked(await import('@/hooks/useExam'));
```
**Fix:** Import at the top of the file, reference directly:
```ts
import { useExam } from '@/hooks/useExam';
// inside test:
vi.mocked(useExam).mockReturnValueOnce(...);
```

### 2. `screen.getByRole('img')` on icon with `alt=""`
`SubjectCard` renders `<img alt="">` which has ARIA role `presentation`, not `img`.
**Fix:** Use `container.querySelector('img')` instead.

### 3. Vitest exits code 1 when no test files found
Expected behavior in Vitest v4 — not a setup error.

### 4. Coverage includes infra files by default
`lib/types.ts` (pure types) and `lib/supabase.ts` (mocked in all tests, never executes) tank coverage unfairly. Both are excluded in `vitest.config.ts`:
```ts
exclude: [
  'src/test/**',
  'src/app/layout.tsx',
  'src/**/*.d.ts',
  'src/lib/types.ts',
  'src/lib/supabase.ts',
],
```

---

## Remaining Coverage Gaps (not blocking — thresholds pass)

| File | Lines | Why uncovered |
|------|-------|---------------|
| `app/exam/[id]/page.tsx` | 49-54 | `createAttempt` error path (Supabase insert failure) not tested |
| `app/exam/[id]/page.tsx` | 63, 109-110 | Timer init early return + auto-submit on `timeLeft === 0` (needs fake timers) |
| `app/exam/[id]/results/page.tsx` | 128 | `explanation_img_url` image branch in `ReviewCard` |
| `components/LiffProvider.tsx` | 82 | Supabase upsert error path |
| `hooks/use*.ts` | 23, 29, 36 | `data ?? []` null-coalescing branch when Supabase returns `data: null` |

To close these gaps a next agent would need to:
1. Use `vi.useFakeTimers()` + `vi.advanceTimersByTime()` for timer/auto-submit branches
2. Mock Supabase upsert to return an error in a LiffProvider test
3. Mock hooks to return `data: null` to trigger the `??` branch

---

## How to Verify End-to-End

1. Run the SQL scripts (A, B, C above)
2. Fill `.env.local`
3. `npm run dev` then open `http://localhost:3000`
4. Dashboard should show Mathematics, Science, English subject cards
5. Click Mathematics → Algebra Basics and Geometry Fundamentals appear
6. Click Start on Algebra Basics → 5 questions, 15-min timer
7. Answer all → Submit → Results page with score and explanations
8. Check Supabase Table Editor: `exam_attempts` has 1 row, `attempt_answers` has 5 rows
