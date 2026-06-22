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
CREATE INDEX idx_competitions_organization_id ON competitions(organization_id);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX idx_competition_participants_competition_id ON competition_participants(competition_id);
CREATE INDEX idx_competition_participants_employee_id ON competition_participants(employee_id);
CREATE INDEX idx_competition_rankings_competition_id ON competition_rankings(competition_id);
CREATE INDEX idx_competition_rankings_position ON competition_rankings(competition_id, position);

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
