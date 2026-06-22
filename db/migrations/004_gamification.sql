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
CREATE INDEX idx_badges_organization_id ON badges(organization_id);
CREATE INDEX idx_knowledge_levels_organization_id ON knowledge_levels(organization_id);
CREATE INDEX idx_points_events_organization_id ON points_events(organization_id);
CREATE INDEX idx_points_events_employee_id ON points_events(employee_id);
CREATE INDEX idx_points_events_created_at ON points_events(created_at DESC);
CREATE INDEX idx_employee_badges_employee_id ON employee_badges(employee_id);
CREATE INDEX idx_employee_badges_earned_at ON employee_badges(earned_at DESC);

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
