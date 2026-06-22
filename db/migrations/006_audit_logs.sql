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
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);

CREATE INDEX idx_api_usage_organization_id ON api_usage(organization_id);
CREATE INDEX idx_api_usage_created_date ON api_usage(created_date);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);

CREATE INDEX idx_security_events_organization_id ON security_events(organization_id);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);

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
