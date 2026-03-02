-- Migration 005: Route segments (line symbology persistence)
-- Adds route_segments table so voltage line segments persist across sessions

-- ============================================================
-- ENUM
-- ============================================================

CREATE TYPE line_symbology AS ENUM ('single', 'double', 'triple');

-- ============================================================
-- ROUTE SEGMENTS TABLE
-- ============================================================

CREATE TABLE route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  from_pole INTEGER NOT NULL,
  to_pole INTEGER NOT NULL,
  symbology line_symbology NOT NULL,
  CHECK (from_pole < to_pole)
);

CREATE INDEX idx_route_segments_route_id ON route_segments(route_id);

-- ============================================================
-- RLS POLICIES (same pattern as poles)
-- ============================================================

ALTER TABLE route_segments ENABLE ROW LEVEL SECURITY;

-- Owner can view segments of their own routes
CREATE POLICY "Users can view segments of own routes"
  ON route_segments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM routes
    JOIN projects ON projects.id = routes.project_id
    WHERE routes.id = route_segments.route_id AND projects.user_id = auth.uid()
  ));

-- Owner can insert segments in own routes
CREATE POLICY "Users can insert segments in own routes"
  ON route_segments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM routes
    JOIN projects ON projects.id = routes.project_id
    WHERE routes.id = route_segments.route_id AND projects.user_id = auth.uid()
  ));

-- Owner can delete segments of own routes
CREATE POLICY "Users can delete segments of own routes"
  ON route_segments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM routes
    JOIN projects ON projects.id = routes.project_id
    WHERE routes.id = route_segments.route_id AND projects.user_id = auth.uid()
  ));

-- Coordinators and admins can view all segments
CREATE POLICY "Coordinators can view all segments"
  ON route_segments FOR SELECT
  USING (
    get_user_role() IN ('coordinador', 'administrador')
    OR (get_user_role() = 'gestor' AND EXISTS (
      SELECT 1 FROM routes
      JOIN projects ON projects.id = routes.project_id
      WHERE routes.id = route_segments.route_id AND projects.zone_id = get_user_zone_id()
    ))
  );
