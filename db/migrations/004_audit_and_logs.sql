-- ============================================
-- Audit Logs and AI Usage Tracking
-- ============================================

-- Audit Logs
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  resource_name text,
  changes jsonb,
  ip_address text,
  user_agent text,
  status text DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- AI Usage Logs
CREATE TABLE ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  model_used text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  estimated_cost numeric,
  training_id uuid REFERENCES trainings(id) ON DELETE SET NULL,
  content_source_id uuid REFERENCES content_sources(id) ON DELETE SET NULL,
  status text DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Employee Rankings (Cached for performance)
CREATE TABLE employee_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  ranking_type text NOT NULL,
  ranking_id uuid,
  position integer NOT NULL,
  points integer,
  period_start date,
  period_end date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  related_resource_type text,
  related_resource_id uuid,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_ai_usage_organization ON ai_usage_logs(organization_id);
CREATE INDEX idx_ai_usage_user ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_created ON ai_usage_logs(created_at);
CREATE INDEX idx_employee_rankings_employee ON employee_rankings(employee_id);
CREATE INDEX idx_employee_rankings_type ON employee_rankings(ranking_type);
CREATE INDEX idx_notifications_employee ON notifications(employee_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
