-- Migration: Add classes, class_subjects, user_classes, user_subjects
-- Run this if you already ran supabase_setup.sql previously and just need the new tables.

-- New Tables
CREATE TABLE IF NOT EXISTS classes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_subjects (
  class_id   UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, subject_id)
);

CREATE TABLE IF NOT EXISTS user_classes (
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, class_id)
);

CREATE TABLE IF NOT EXISTS user_subjects (
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, subject_id)
);

-- Enable RLS on new tables
ALTER TABLE classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_classes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subjects   ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "classes_public_read"              ON classes        FOR SELECT USING (true);
CREATE POLICY "class_subjects_public_read"       ON class_subjects FOR SELECT USING (true);
CREATE POLICY "user_classes_public_read"         ON user_classes   FOR SELECT USING (true);
CREATE POLICY "user_subjects_public_read"        ON user_subjects  FOR SELECT USING (true);
CREATE POLICY "classes_public_insert"            ON classes        FOR INSERT WITH CHECK (true);
CREATE POLICY "class_subjects_public_insert"     ON class_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "class_subjects_public_delete"     ON class_subjects FOR DELETE USING (true);
CREATE POLICY "user_classes_public_insert"       ON user_classes   FOR INSERT WITH CHECK (true);
CREATE POLICY "user_classes_public_delete"       ON user_classes   FOR DELETE USING (true);
CREATE POLICY "user_subjects_public_insert"      ON user_subjects  FOR INSERT WITH CHECK (true);
CREATE POLICY "user_subjects_public_delete"      ON user_subjects  FOR DELETE USING (true);

-- New INSERT policies for existing tables (subjects and exams)
CREATE POLICY "subjects_public_insert" ON subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "exams_public_insert"    ON exams    FOR INSERT WITH CHECK (true);
