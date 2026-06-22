-- ============================================
-- Trainings and Content Management
-- ============================================

-- Content Sources (Knowledge Base)
CREATE TABLE content_sources (
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
CREATE TABLE content_source_versions (
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
CREATE TABLE trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  area_id uuid REFERENCES departments(id) ON DELETE SET NULL,
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
CREATE TABLE training_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  version integer NOT NULL,
  data jsonb,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Training Content Links
CREATE TABLE training_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  content_source_id uuid NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(training_id, content_source_id)
);

-- Training Questions
CREATE TABLE training_questions (
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
CREATE TABLE question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES training_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  position integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Training Assignments
CREATE TABLE training_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('employee', 'department', 'team')),
  target_id uuid NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  due_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- Training Attempts (Quiz Completions)
CREATE TABLE training_attempts (
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
CREATE TABLE training_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_attempt_id uuid NOT NULL REFERENCES training_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES training_questions(id) ON DELETE CASCADE,
  answer_value jsonb,
  is_correct boolean,
  points_awarded integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Answer Reviews (For essay/case study questions)
CREATE TABLE answer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_answer_id uuid NOT NULL REFERENCES training_answers(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  score integer,
  feedback text,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Certificates
CREATE TABLE certificates (
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
CREATE INDEX idx_content_sources_organization ON content_sources(organization_id);
CREATE INDEX idx_content_sources_status ON content_sources(status);
CREATE INDEX idx_trainings_organization ON trainings(organization_id);
CREATE INDEX idx_trainings_status ON trainings(status);
CREATE INDEX idx_trainings_area ON trainings(area_id);
CREATE INDEX idx_training_questions_training ON training_questions(training_id);
CREATE INDEX idx_training_assignments_training ON training_assignments(training_id);
CREATE INDEX idx_training_attempts_training ON training_attempts(training_id);
CREATE INDEX idx_training_attempts_employee ON training_attempts(employee_id);
CREATE INDEX idx_training_answers_attempt ON training_answers(training_attempt_id);
CREATE INDEX idx_certificates_training ON certificates(training_id);
CREATE INDEX idx_certificates_employee ON certificates(employee_id);
