-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_level_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_source_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_rank_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Functions
-- ============================================

CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS TABLE(organization_id uuid) AS $$
  SELECT DISTINCT m.organization_id
  FROM memberships m
  WHERE m.profile_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(org_id uuid)
RETURNS text AS $$
  SELECT m.role
  FROM memberships m
  WHERE m.profile_id = auth.uid()
  AND m.organization_id = org_id
  LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_employee_id(org_id uuid)
RETURNS uuid AS $$
  SELECT e.id
  FROM employees e
  WHERE e.profile_id = auth.uid()
  AND e.organization_id = org_id
  LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- Profiles - Users see their own data
-- ============================================

CREATE POLICY "Users see their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- Memberships
-- ============================================

CREATE POLICY "Users see their memberships"
  ON memberships FOR SELECT
  USING (profile_id = auth.uid());

-- ============================================
-- Organizations - Based on Membership
-- ============================================

CREATE POLICY "Users see their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_organizations()));

-- ============================================
-- Organization Settings
-- ============================================

CREATE POLICY "Users see settings of their organizations"
  ON organization_settings FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations()));

-- ============================================
-- Employees
-- ============================================

CREATE POLICY "Admin company sees all employees in their org"
  ON employees FOR SELECT
  USING (
    organization_id IN (
      SELECT m.organization_id FROM memberships m
      WHERE m.profile_id = auth.uid()
      AND m.role = 'admin_company'
    )
  );

CREATE POLICY "Managers see employees in their department and subordinates"
  ON employees FOR SELECT
  USING (
    organization_id IN (
      SELECT m.organization_id FROM memberships m
      WHERE m.profile_id = auth.uid()
      AND m.role = 'manager'
    )
    AND (
      department_id IN (
        SELECT d.id FROM departments d
        WHERE d.manager_id = auth.uid()
      )
      OR manager_id = auth.uid()
    )
  );

CREATE POLICY "Employees see their own record"
  ON employees FOR SELECT
  USING (profile_id = auth.uid());

-- ============================================
-- Departments
-- ============================================

CREATE POLICY "Users see departments of their organizations"
  ON departments FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations()));

-- ============================================
-- Trainings
-- ============================================

CREATE POLICY "Admin company sees all trainings in their org"
  ON trainings FOR SELECT
  USING (
    organization_id IN (
      SELECT m.organization_id FROM memberships m
      WHERE m.profile_id = auth.uid()
      AND m.role = 'admin_company'
    )
  );

CREATE POLICY "Employees see published trainings assigned to them"
  ON trainings FOR SELECT
  USING (
    status = 'published'
    AND (
      id IN (
        SELECT ta.training_id FROM training_assignments ta
        WHERE ta.target_type = 'employee'
        AND ta.target_id = get_user_employee_id(trainings.organization_id)
      )
      OR id IN (
        SELECT ta.training_id FROM training_assignments ta
        WHERE ta.target_type = 'department'
        AND ta.target_id IN (
          SELECT e.department_id FROM employees e
          WHERE e.profile_id = auth.uid()
          AND e.organization_id = trainings.organization_id
        )
      )
    )
  );

-- ============================================
-- Training Attempts
-- ============================================

CREATE POLICY "Employees see their own attempts"
  ON training_attempts FOR SELECT
  USING (employee_id = get_user_employee_id(
    (SELECT organization_id FROM trainings WHERE id = training_id)
  ));

CREATE POLICY "Admin company sees all attempts in their org"
  ON training_attempts FOR SELECT
  USING (
    (SELECT organization_id FROM trainings WHERE id = training_id)
    IN (
      SELECT m.organization_id FROM memberships m
      WHERE m.profile_id = auth.uid()
      AND m.role = 'admin_company'
    )
  );

-- ============================================
-- Rankings
-- ============================================

CREATE POLICY "Users see rankings of their organizations (if public)"
  ON employee_rankings FOR SELECT
  USING (
    (SELECT organization_id FROM employees WHERE id = employee_id)
    IN (SELECT get_user_organizations())
  );

-- ============================================
-- Competitions
-- ============================================

CREATE POLICY "Users see competitions of their organizations"
  ON competitions FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations()));

-- ============================================
-- Audit Logs
-- ============================================

CREATE POLICY "Admin company sees audit logs of their org"
  ON audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT m.organization_id FROM memberships m
      WHERE m.profile_id = auth.uid()
      AND m.role = 'admin_company'
    )
  );

-- ============================================
-- Notifications
-- ============================================

CREATE POLICY "Employees see their own notifications"
  ON notifications FOR SELECT
  USING (employee_id = get_user_employee_id(
    (SELECT organization_id FROM employees WHERE id = employee_id)
  ));
