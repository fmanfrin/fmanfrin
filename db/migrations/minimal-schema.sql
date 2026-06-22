-- Minimal Schema - Just Tables, No Foreign Keys
-- Run this first, then add constraints separately

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  role text DEFAULT 'employee',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  profile_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  department_id uuid NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  type text DEFAULT 'multiple_choice',
  statement text NOT NULL,
  options jsonb,
  correct_answer jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  score integer,
  status text DEFAULT 'in_progress',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_attempt_id uuid NOT NULL,
  question_id uuid NOT NULL,
  answer_value jsonb,
  is_correct boolean,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  training_attempt_id uuid NOT NULL,
  issued_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  title text NOT NULL,
  type text DEFAULT 'text',
  content_text text,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  icon text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(employee_id, badge_id)
);

CREATE TABLE IF NOT EXISTS knowledge_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  min_points integer,
  max_points integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS points_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  event_type text NOT NULL,
  points integer NOT NULL,
  training_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(competition_id, employee_id)
);

CREATE TABLE IF NOT EXISTS competition_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  position integer,
  score numeric,
  UNIQUE(competition_id, employee_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add Foreign Keys
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL;
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE;

  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE;
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

  FOREIGN KEY (training_attempt_id) REFERENCES training_attempts(id) ON DELETE CASCADE;
  FOREIGN KEY (question_id) REFERENCES training_questions(id) ON DELETE CASCADE;

  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE;
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
  FOREIGN KEY (training_attempt_id) REFERENCES training_attempts(id) ON DELETE CASCADE;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE SET NULL;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

  FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

  FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

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
CREATE INDEX IF NOT EXISTS idx_points_events_emp ON points_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_competitions_org ON competitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_comp_participants_comp ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_comp_rankings_comp ON competition_rankings(competition_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
