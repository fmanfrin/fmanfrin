-- ============================================
-- Elevare Treinamentos - Clean Schema
-- ============================================

-- 1. Organizations (Multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text,
  logo_url text,
  status text NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'basic',
  subscription_starts_at timestamp with time zone,
  subscription_ends_at timestamp with time zone,
  max_employees integer DEFAULT 100,
  max_trainings_per_month integer DEFAULT 50,
  max_ai_requests_per_month integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Profiles (Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'employee',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(profile_id, organization_id)
);

-- 4. Departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  color text DEFAULT '#3b82f6',
  training_goal integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Employees
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  cpf_hash text,
  photo_url text,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  job_title text,
  admission_date date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- 6. Trainings
CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  difficulty text DEFAULT 'intermediate',
  status text DEFAULT 'draft',
  is_mandatory boolean DEFAULT false,
  min_pass_score integer DEFAULT 70,
  max_attempts integer DEFAULT 3,
  max_points integer DEFAULT 100,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 7. Training Questions
CREATE TABLE IF NOT EXISTS training_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'multiple_choice',
  statement text NOT NULL,
  options jsonb,
  correct_answer jsonb NOT NULL,
  explanation text,
  difficulty text DEFAULT 'intermediate',
  points integer DEFAULT 10,
  position integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 8. Training Assignments
CREATE TABLE IF NOT EXISTS training_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  due_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- 9. Training Attempts
CREATE TABLE IF NOT EXISTS training_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attempt_number integer DEFAULT 1,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  score integer,
  max_score integer,
  percentage_score numeric,
  status text DEFAULT 'in_progress',
  answers jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 10. Training Answers
CREATE TABLE IF NOT EXISTS training_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_attempt_id uuid NOT NULL REFERENCES training_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES training_questions(id) ON DELETE CASCADE,
  answer_value jsonb,
  is_correct boolean,
  points_awarded integer,
  created_at timestamp with time zone DEFAULT now()
);

-- 11. Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  training_attempt_id uuid NOT NULL REFERENCES training_attempts(id) ON DELETE CASCADE,
  certificate_url text,
  certificate_number text UNIQUE,
  issued_at timestamp with time zone DEFAULT now(),
  valid_until date,
  created_at timestamp with time zone DEFAULT now()
);

-- 12. Content Sources
CREATE TABLE IF NOT EXISTS content_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  type text NOT NULL DEFAULT 'text',
  content_text text,
  file_path text,
  status text DEFAULT 'draft',
  version integer DEFAULT 1,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 13. Knowledge Levels
CREATE TABLE IF NOT EXISTS knowledge_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_points integer NOT NULL,
  max_points integer NOT NULL,
  icon text DEFAULT '📊',
  color text DEFAULT 'blue',
  description text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- 14. Badges
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text DEFAULT '🏅',
  color text DEFAULT 'blue',
  criteria jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 15. Employee Badges
CREATE TABLE IF NOT EXISTS employee_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(employee_id, badge_id)
);

-- 16. Points Events
CREATE TABLE IF NOT EXISTS points_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  points integer NOT NULL,
  training_id uuid REFERENCES trainings(id) ON DELETE SET NULL,
  competition_id uuid,
  badge_id uuid REFERENCES badges(id) ON DELETE SET NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- 17. Employee Level History
CREATE TABLE IF NOT EXISTS employee_level_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES knowledge_levels(id) ON DELETE RESTRICT,
  total_points integer NOT NULL,
  achieved_at timestamp with time zone DEFAULT now()
);

-- 18. Competitions
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  banner_url text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  criteria text NOT NULL DEFAULT 'largest_score',
  status text DEFAULT 'draft',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 19. Competition Participants
CREATE TABLE IF NOT EXISTS competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(competition_id, employee_id)
);

-- 20. Competition Rankings
CREATE TABLE IF NOT EXISTS competition_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  position integer NOT NULL,
  score numeric,
  completed_count integer,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(competition_id, employee_id)
);

-- 21. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  resource_name text,
  changes jsonb,
  status text DEFAULT 'success',
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- 22. Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_memberships_profile ON memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_organization ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_trainings_organization ON trainings(organization_id);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status);
CREATE INDEX IF NOT EXISTS idx_training_questions_training ON training_questions(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attempts_training ON training_attempts(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attempts_employee ON training_attempts(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_answers_attempt ON training_answers(training_attempt_id);
CREATE INDEX IF NOT EXISTS idx_certificates_training ON certificates(training_id);
CREATE INDEX IF NOT EXISTS idx_certificates_employee ON certificates(employee_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_organization ON content_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_badges_organization ON badges(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_badges_employee ON employee_badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_events_employee ON points_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_events_organization ON points_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitions_organization ON competitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_rankings_competition ON competition_rankings(competition_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);

-- RLS Policies removed for now - will be added after all tables are created
