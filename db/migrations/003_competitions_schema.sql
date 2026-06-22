-- ============================================
-- Competitions and Gamification
-- ============================================

-- Competitions
CREATE TABLE competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  banner_url text,
  area_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  criteria text NOT NULL CHECK (criteria IN ('largest_score', 'best_avg', 'most_completed', 'fastest', 'best_improvement', 'specific_training')),
  valid_trainings uuid[] DEFAULT '{}',
  max_winners integer DEFAULT 3,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'ended', 'cancelled')),
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Competition Rules
CREATE TABLE competition_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  rules text NOT NULL,
  terms_conditions text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(competition_id)
);

-- Competition Prizes
CREATE TABLE competition_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  position integer NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  estimated_value numeric,
  quantity integer DEFAULT 1,
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(competition_id, position)
);

-- Competition Participants
CREATE TABLE competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(competition_id, employee_id)
);

-- Competition Rank Snapshots (Frozen rankings when competition ends)
CREATE TABLE competition_rank_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  position integer NOT NULL,
  points integer NOT NULL,
  prize_id uuid REFERENCES competition_prizes(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_competitions_organization ON competitions(organization_id);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX idx_competition_participants_employee ON competition_participants(employee_id);
CREATE INDEX idx_competition_rank_snapshots_competition ON competition_rank_snapshots(competition_id);
CREATE INDEX idx_competition_rank_snapshots_position ON competition_rank_snapshots(competition_id, position);
