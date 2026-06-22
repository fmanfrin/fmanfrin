-- ============================================
-- Elevare Treinamentos - Initial Schema
-- ============================================

-- Organizations (Multi-tenant)
CREATE TABLE organizations (
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
CREATE TABLE organization_settings (
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
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Memberships (User -> Organization + Role)
CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin_platform', 'admin_company', 'manager', 'employee')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(profile_id, organization_id)
);

-- Departments/Areas
CREATE TABLE departments (
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
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Employees
CREATE TABLE employees (
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
CREATE TABLE knowledge_levels (
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
CREATE TABLE badges (
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
CREATE TABLE employee_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(employee_id, badge_id)
);

-- Points Events
CREATE TABLE points_events (
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
CREATE TABLE employee_level_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES knowledge_levels(id) ON DELETE RESTRICT,
  total_points integer NOT NULL,
  achieved_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_memberships_profile ON memberships(profile_id);
CREATE INDEX idx_memberships_organization ON memberships(organization_id);
CREATE INDEX idx_departments_organization ON departments(organization_id);
CREATE INDEX idx_teams_organization ON teams(organization_id);
CREATE INDEX idx_employees_organization ON employees(organization_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employee_badges_employee ON employee_badges(employee_id);
CREATE INDEX idx_points_events_employee ON points_events(employee_id);
CREATE INDEX idx_points_events_organization ON points_events(organization_id);
CREATE INDEX idx_employee_level_history_employee ON employee_level_history(employee_id);
