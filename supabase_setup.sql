-- Script A: Schema
CREATE TABLE IF NOT EXISTS users (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id      TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  class_id     UUID REFERENCES classes(id) ON DELETE SET NULL,
  is_blocked   BOOLEAN NOT NULL DEFAULT FALSE,
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

-- Script B: RLS Policies
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

-- Script C: Seed Data
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
