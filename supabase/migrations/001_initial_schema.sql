-- Create custom enum types
CREATE TYPE route_mode AS ENUM ('straight_line', 'road_osrm', 'road_google');
CREATE TYPE pole_type AS ENUM ('start', 'intermediate', 'end');
CREATE TYPE pole_status AS ENUM ('planned', 'installed');

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  dest_lat DOUBLE PRECISION NOT NULL,
  dest_lng DOUBLE PRECISION NOT NULL,
  spacing_meters DOUBLE PRECISION NOT NULL CHECK (spacing_meters > 0),
  mode route_mode NOT NULL,
  polyline_encoded TEXT,
  total_distance_meters DOUBLE PRECISION NOT NULL,
  total_poles INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Poles table
CREATE TABLE poles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  type pole_type NOT NULL,
  status pole_status NOT NULL DEFAULT 'planned',
  UNIQUE(route_id, sequence_number)
);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_routes_project_id ON routes(project_id);
CREATE INDEX idx_poles_route_id ON poles(route_id);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poles ENABLE ROW LEVEL SECURITY;

-- Projects: users can only access their own
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Routes: users can access routes of their own projects
CREATE POLICY "Users can view routes of own projects"
  ON routes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = routes.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert routes in own projects"
  ON routes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = routes.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete routes of own projects"
  ON routes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = routes.project_id AND projects.user_id = auth.uid()
  ));

-- Poles: users can access poles of their own routes
CREATE POLICY "Users can view poles of own routes"
  ON poles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM routes
    JOIN projects ON projects.id = routes.project_id
    WHERE routes.id = poles.route_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert poles in own routes"
  ON poles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM routes
    JOIN projects ON projects.id = routes.project_id
    WHERE routes.id = poles.route_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update poles of own routes"
  ON poles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM routes
    JOIN projects ON projects.id = routes.project_id
    WHERE routes.id = poles.route_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete poles of own routes"
  ON poles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM routes
    JOIN projects ON projects.id = routes.project_id
    WHERE routes.id = poles.route_id AND projects.user_id = auth.uid()
  ));
