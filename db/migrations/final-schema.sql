-- Final Clean Schema

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text DEFAULT 'employee',
  UNIQUE(profile_id, organization_id)
);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  status text DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS training_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  statement text NOT NULL,
  correct_answer jsonb
);

CREATE TABLE IF NOT EXISTS training_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  score integer,
  status text DEFAULT 'in_progress'
);

CREATE TABLE IF NOT EXISTS training_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_attempt_id uuid NOT NULL REFERENCES training_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES training_questions(id) ON DELETE CASCADE,
  answer_value jsonb
);

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  training_attempt_id uuid NOT NULL REFERENCES training_attempts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_text text
);

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS employee_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE(employee_id, badge_id)
);

CREATE TABLE IF NOT EXISTS knowledge_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_points integer,
  max_points integer
);

CREATE TABLE IF NOT EXISTS points_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  points integer NOT NULL,
  training_id uuid REFERENCES trainings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(competition_id, employee_id)
);

CREATE TABLE IF NOT EXISTS competition_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  position integer,
  UNIQUE(competition_id, employee_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action text,
  resource_type text
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_profile ON memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_org ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_trainings_org ON trainings(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_questions_training ON training_questions(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attempts_training ON training_attempts(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attempts_employee ON training_attempts(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_answers_attempt ON training_answers(training_attempt_id);
CREATE INDEX IF NOT EXISTS idx_certificates_training ON certificates(training_id);
CREATE INDEX IF NOT EXISTS idx_badges_org ON badges(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_badges_emp ON employee_badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_events_emp ON points_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_competitions_org ON competitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_comp_participants_comp ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_comp_rankings_comp ON competition_rankings(competition_id);
