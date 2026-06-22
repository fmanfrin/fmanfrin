-- ============================================
-- Elevare Treinamentos - Initial Schema
-- ============================================

-- Organizations (Multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text,
  logo_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'trial', 'cancelled')),
  plan text NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'professional', 'enterprise')),
  subscription_starts_at timestamp with time zone,
  subscription_ends_at timestamp with time zone,
  max_employees integer DEFAULT 100,
  max_trainings_per_month integer DEFAULT 50,
  max_ai_requests_per_month integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Organization Settings
CREATE TABLE IF NOT EXISTS organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  theme_primary_color text DEFAULT '#1e40af',
  theme_secondary_color text DEFAULT '#059669',
  theme_accent_color text DEFAULT '#a855f7',
  theme_accent_light text DEFAULT '#f3e8ff',
  enable_gamification boolean DEFAULT true,
  enable_public_rankings boolean DEFAULT true,
  enable_competitions boolean DEFAULT true,
  enable_certificates boolean DEFAULT true,
  custom_logo_url text,
  custom_domain text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(organization_id),
  CONSTRAINT org_settings_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- User Profiles (Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Memberships (User -> Organization + Role)
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin_platform', 'admin_company', 'manager', 'employee')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(profile_id, organization_id)
);

-- Departments/Areas
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

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  cpf_hash text,
  photo_url text,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  job_title text,
  admission_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  internal_id text,
  phone text,
  city text,
  state text,
  unit text,
  individual_goal text,
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(organization_id, email),
  UNIQUE(organization_id, cpf_hash)
);

-- Knowledge Levels (Gamification)
CREATE TABLE IF NOT EXISTS knowledge_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_points integer NOT NULL,
  max_points integer NOT NULL,
  icon text,
  color text,
  description text,
  rewards text,
  position integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  criteria jsonb,
  icon text,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Employee Badges
CREATE TABLE IF NOT EXISTS employee_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(employee_id, badge_id)
);

-- Points Events
CREATE TABLE IF NOT EXISTS points_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  points integer NOT NULL,
  training_id uuid,
  competition_id uuid,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Employee Level History
CREATE TABLE IF NOT EXISTS employee_level_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES knowledge_levels(id) ON DELETE RESTRICT,
  total_points integer NOT NULL,
  achieved_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_memberships_profile ON memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_organization ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_organization ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_badges_employee ON employee_badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_events_employee ON points_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_events_organization ON points_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_level_history_employee ON employee_level_history(employee_id);
-- ============================================
-- Trainings and Content Management
-- ============================================

-- Content Sources (Knowledge Base)
CREATE TABLE IF NOT EXISTS content_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  tags text[],
  type text NOT NULL CHECK (type IN ('text', 'pdf', 'docx', 'pptx', 'txt', 'markdown', 'url')),
  content_text text,
  file_url text,
  file_storage_path text,
  version integer DEFAULT 1,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Content Versions
CREATE TABLE IF NOT EXISTS content_source_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_source_id uuid NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
  version integer NOT NULL,
  content_text text,
  file_url text,
  file_storage_path text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  change_log text,
  created_at timestamp with time zone DEFAULT now()
);

-- Trainings
CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  difficulty text NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('basic', 'intermediate', 'advanced', 'expert')),
  learning_objectives text[],
  content_summary text,
  estimated_duration_minutes integer,
  version integer DEFAULT 1,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  is_mandatory boolean DEFAULT false,
  min_pass_score integer DEFAULT 70,
  max_attempts integer DEFAULT 3,
  time_limit_minutes integer,
  max_points integer DEFAULT 100,
  bonus_points_quick_completion integer DEFAULT 0,
  requires_manual_approval boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Training Versions
CREATE TABLE IF NOT EXISTS training_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  version integer NOT NULL,
  data jsonb,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Training Content Links
CREATE TABLE IF NOT EXISTS training_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  content_source_id uuid NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(training_id, content_source_id)
);

-- Training Questions
CREATE TABLE IF NOT EXISTS training_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'case_study', 'matching', 'ordering', 'sales_scenario')),
  statement text NOT NULL,
  options jsonb,
  correct_answer jsonb NOT NULL,
  explanation text,
  source_reference text,
  difficulty text NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('basic', 'intermediate', 'advanced', 'expert')),
  points integer DEFAULT 10,
  position integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Question Options
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES training_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  position integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Training Assignments
CREATE TABLE IF NOT EXISTS training_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('employee', 'department', 'team')),
  target_id uuid NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  due_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- Training Attempts (Quiz Completions)
CREATE TABLE IF NOT EXISTS training_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  score integer,
  max_score integer,
  percentage_score numeric,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected', 'pending_review')),
  answers jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Training Answers (Detailed answers for each question)
CREATE TABLE IF NOT EXISTS training_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_attempt_id uuid NOT NULL REFERENCES training_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES training_questions(id) ON DELETE CASCADE,
  answer_value jsonb,
  is_correct boolean,
  points_awarded integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Answer Reviews (For essay/case study questions)
CREATE TABLE IF NOT EXISTS answer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_answer_id uuid NOT NULL REFERENCES training_answers(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  score integer,
  feedback text,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Certificates
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_sources_organization ON content_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_status ON content_sources(status);
CREATE INDEX IF NOT EXISTS idx_trainings_organization ON trainings(organization_id);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status);
CREATE INDEX IF NOT EXISTS idx_training_questions_training ON training_questions(training_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_training ON training_assignments(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attempts_training ON training_attempts(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attempts_employee ON training_attempts(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_answers_attempt ON training_answers(training_attempt_id);
CREATE INDEX IF NOT EXISTS idx_certificates_training ON certificates(training_id);
CREATE INDEX IF NOT EXISTS idx_certificates_employee ON certificates(employee_id);
-- Content Sources Table for Knowledge Base
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT NOT NULL, -- 'text', 'pdf', 'docx', 'pptx', 'txt', 'markdown', 'url'
  content_text TEXT, -- Extracted text content
  file_path TEXT, -- Path in Supabase Storage
  url TEXT, -- For external URLs
  status TEXT DEFAULT 'published', -- 'draft', 'review', 'published', 'archived'
  version INTEGER DEFAULT 1,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_type CHECK (type IN ('text', 'pdf', 'docx', 'pptx', 'txt', 'markdown', 'url')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'published', 'archived'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_sources_organization_id ON content_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_status ON content_sources(status);
CREATE INDEX IF NOT EXISTS idx_content_sources_category ON content_sources(category);
CREATE INDEX IF NOT EXISTS idx_content_sources_created_at ON content_sources(created_at DESC);

-- RLS Policies
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;

-- Users can only see content from their organization
CREATE POLICY "Users see organization content"
  ON content_sources FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid()
    )
  );

-- Only admin can insert/update/delete content
CREATE POLICY "Only admin can manage content"
  ON content_sources FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

CREATE POLICY "Only admin can update content"
  ON content_sources FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

CREATE POLICY "Only admin can delete content"
  ON content_sources FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );
-- Gamification Tables

-- Badges Definition
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏅',
  criteria JSONB, -- JSON criteria for automatic awarding
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Levels
CREATE TABLE IF NOT EXISTS knowledge_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER NOT NULL,
  icon TEXT DEFAULT '📊',
  color TEXT DEFAULT 'blue',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, name)
);

-- Points Events (History)
CREATE TABLE IF NOT EXISTS points_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'training_completion', 'perfect_score', 'competition_1st', 'badge_earned', 'manual_adjustment'
  points INTEGER NOT NULL,
  training_id UUID REFERENCES trainings(id) ON DELETE SET NULL,
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_event_type CHECK (event_type IN ('training_completion', 'perfect_score', 'quick_completion', 'competition_1st', 'badge_earned', 'manual_adjustment'))
);

-- Employee Badges (Earned)
CREATE TABLE IF NOT EXISTS employee_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_badges_organization_id ON badges(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_levels_organization_id ON knowledge_levels(organization_id);
CREATE INDEX IF NOT EXISTS idx_points_events_organization_id ON points_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_points_events_employee_id ON points_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_events_created_at ON points_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_badges_employee_id ON employee_badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_badges_earned_at ON employee_badges(earned_at DESC);

-- RLS Policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_badges ENABLE ROW LEVEL SECURITY;

-- Badges policies
CREATE POLICY "Users see organization badges"
  ON badges FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Only admin can manage badges"
  ON badges FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

-- Points events policies
CREATE POLICY "Users see their own points"
  ON points_events FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees
      WHERE profile_id = auth.uid()
    ) OR
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

-- Employee badges policies
CREATE POLICY "Users see their own badges"
  ON employee_badges FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees
      WHERE profile_id = auth.uid()
    ) OR
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

-- Insert default badges
INSERT INTO badges (organization_id, name, description, icon, color)
SELECT id, 'Primeiro Treinamento', 'Completar seu primeiro treinamento', '🎓', 'blue'
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO badges (organization_id, name, description, icon, color)
SELECT id, 'Nota Máxima', 'Alcançar 100% em um treinamento', '⭐', 'yellow'
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO badges (organization_id, name, description, icon, color)
SELECT id, 'Sequência de Fogo', 'Completar 5 treinamentos em sequência', '🔥', 'orange'
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO badges (organization_id, name, description, icon, color)
SELECT id, 'Especialista', 'Alcançar nível Especialista', '👨‍💼', 'purple'
FROM organizations
ON CONFLICT DO NOTHING;

-- Insert default levels
INSERT INTO knowledge_levels (organization_id, name, min_points, max_points, icon, color, description)
SELECT id, 'Iniciante', 0, 199, '📚', 'blue', 'Comece sua jornada de aprendizado'
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_levels (organization_id, name, min_points, max_points, icon, color, description)
SELECT id, 'Aprendiz', 200, 499, '📖', 'cyan', 'Está progredindo bem'
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_levels (organization_id, name, min_points, max_points, icon, color, description)
SELECT id, 'Desenvolvedor', 500, 999, '💻', 'green', 'Conhecimento sólido'
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_levels (organization_id, name, min_points, max_points, icon, color, description)
SELECT id, 'Especialista', 1000, 1999, '🔬', 'yellow', 'Você é um especialista'
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_levels (organization_id, name, min_points, max_points, icon, color, description)
SELECT id, 'Mestre', 2000, 3999, '👑', 'orange', 'Conhecimento excepcional'
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_levels (organization_id, name, min_points, max_points, icon, color, description)
SELECT id, 'Elite', 4000, 99999, '🏆', 'red', 'Status de Elite'
FROM organizations
ON CONFLICT DO NOTHING;
-- Competitions Tables

CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  criteria TEXT NOT NULL, -- 'largest_score', 'best_avg', 'most_completed', 'fastest', 'best_improvement', 'specific_training'
  valid_trainings UUID[], -- Array of training IDs if criteria requires specific training
  prize_pool TEXT, -- Description of prizes
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'ended', 'cancelled'
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_criteria CHECK (criteria IN ('largest_score', 'best_avg', 'most_completed', 'fastest', 'best_improvement', 'specific_training')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'active', 'ended', 'cancelled')),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(competition_id, employee_id)
);

CREATE TABLE IF NOT EXISTS competition_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- 1st, 2nd, 3rd place
  name TEXT NOT NULL,
  description TEXT,
  value_estimated DECIMAL(10, 2),
  quantity INTEGER DEFAULT 1,
  delivery_status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competition_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  score DECIMAL(10, 2),
  avg_score DECIMAL(10, 2),
  completed_count INTEGER,
  completion_time INTEGER, -- in seconds
  improvement_percentage DECIMAL(5, 2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(competition_id, employee_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_competitions_organization_id ON competitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition_id ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_employee_id ON competition_participants(employee_id);
CREATE INDEX IF NOT EXISTS idx_competition_rankings_competition_id ON competition_rankings(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_rankings_position ON competition_rankings(competition_id, position);

-- RLS Policies
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_rankings ENABLE ROW LEVEL SECURITY;

-- Competitions policies
CREATE POLICY "Users see organization competitions"
  ON competitions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Only admin can manage competitions"
  ON competitions FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

-- Competition participants policies
CREATE POLICY "Users see their participation"
  ON competition_participants FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    ) OR
    competition_id IN (
      SELECT id FROM competitions
      WHERE organization_id IN (
        SELECT organization_id FROM memberships
        WHERE profile_id = auth.uid() AND role = 'admin_company'
      )
    )
  );

CREATE POLICY "Users can join competitions"
  ON competition_participants FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
  );

-- Competition rankings policies
CREATE POLICY "Users see competition rankings"
  ON competition_rankings FOR SELECT
  USING (
    competition_id IN (
      SELECT id FROM competitions
      WHERE organization_id IN (
        SELECT organization_id FROM memberships
        WHERE profile_id = auth.uid()
      )
    )
  );
-- Audit Logging Tables

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'export'
  resource_type TEXT NOT NULL, -- 'employee', 'training', 'competition', 'content', etc
  resource_id UUID,
  resource_name TEXT,
  changes JSONB, -- Before/After values for updates
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success', -- 'success', 'failure'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_action CHECK (action IN ('create', 'read', 'update', 'delete', 'export', 'login', 'logout', 'join', 'leave'))
);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  daily_limit INTEGER DEFAULT 1000,
  monthly_limit INTEGER DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, endpoint)
);

CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT, -- 'GET', 'POST', 'PUT', 'DELETE'
  status_code INTEGER,
  response_time_ms INTEGER,
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_date DATE GENERATED ALWAYS AS (created_at::date) STORED
);

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'failed_login', 'brute_force', 'suspicious_activity', 'data_export'
  description TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  ip_address INET,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

CREATE INDEX IF NOT EXISTS idx_api_usage_organization_id ON api_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_date ON api_usage(created_date);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);

CREATE INDEX IF NOT EXISTS idx_security_events_organization_id ON security_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins view audit logs"
  ON audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

-- System can insert audit logs (no auth check)
CREATE POLICY "System inserts audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Only admins can view security events
CREATE POLICY "Only admins view security events"
  ON security_events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

-- Helper function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_org_id UUID,
  p_actor_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_resource_name TEXT,
  p_changes JSONB
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (organization_id, actor_id, action, resource_type, resource_id, resource_name, changes)
  VALUES (p_org_id, p_actor_id, p_action, p_resource_type, p_resource_id, p_resource_name, p_changes);
END;
$$ LANGUAGE plpgsql;

-- Trigger for employee creation audit
CREATE OR REPLACE FUNCTION audit_employee_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (organization_id, action, resource_type, resource_id, resource_name)
    VALUES (NEW.organization_id, 'create', 'employee', NEW.id, NEW.full_name);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (organization_id, action, resource_type, resource_id, resource_name, changes)
    VALUES (NEW.organization_id, 'update', 'employee', NEW.id, NEW.full_name,
      jsonb_build_object('before', row_to_json(OLD), 'after', row_to_json(NEW)));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (organization_id, action, resource_type, resource_id, resource_name)
    VALUES (OLD.organization_id, 'delete', 'employee', OLD.id, OLD.full_name);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employee_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW
EXECUTE FUNCTION audit_employee_changes();
