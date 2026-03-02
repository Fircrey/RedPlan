-- Migration 004: Roles, workflow, budget, comments, audit
-- Adds user roles, project workflow states, budget items, comments, and audit logging

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('supervisor', 'coordinador', 'gestor', 'administrador');

CREATE TYPE project_status AS ENUM (
  'borrador',
  'pendiente_coordinador',
  'rechazado',
  'pendiente_gestor',
  'contratado',
  'en_ejecucion',
  'pendiente_conciliacion',
  'en_correccion',
  'finalizado'
);

-- ============================================================
-- ZONES TABLE
-- ============================================================

CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROFILES TABLE
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'supervisor',
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_zone_id ON profiles(zone_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'supervisor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ALTER PROJECTS TABLE
-- ============================================================

ALTER TABLE projects ADD COLUMN status project_status NOT NULL DEFAULT 'borrador';
ALTER TABLE projects ADD COLUMN zone_id UUID REFERENCES zones(id) ON DELETE SET NULL;

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_zone_id ON projects(zone_id);

-- ============================================================
-- BUDGET ITEMS TABLE
-- ============================================================

CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  unit_cost NUMERIC(14, 2) NOT NULL CHECK (unit_cost >= 0),
  total NUMERIC(18, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_items_project_id ON budget_items(project_id);

-- ============================================================
-- PROJECT COMMENTS TABLE
-- ============================================================

CREATE TABLE project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_comments_project_id ON project_comments(project_id);

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_project_created ON audit_log(project_id, created_at DESC);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's zone
CREATE OR REPLACE FUNCTION get_user_zone_id()
RETURNS UUID AS $$
  SELECT zone_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ZONES RLS
-- ============================================================

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view zones"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- PROFILES RLS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role() = 'administrador');

-- ============================================================
-- PROJECTS RLS — DROP OLD POLICIES AND RECREATE
-- ============================================================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Supervisor: ve sus propios proyectos
CREATE POLICY "Supervisors view own projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = user_id
    OR get_user_role() IN ('coordinador', 'administrador')
    OR (get_user_role() = 'gestor' AND zone_id = get_user_zone_id())
  );

-- Supervisor: inserta sus propios proyectos
CREATE POLICY "Supervisors insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id AND get_user_role() = 'supervisor');

-- Supervisor: actualiza sus propios proyectos en borrador/rechazado
-- Coordinador/Gestor: actualiza status
CREATE POLICY "Update projects by role"
  ON projects FOR UPDATE
  USING (
    (auth.uid() = user_id AND get_user_role() = 'supervisor')
    OR get_user_role() IN ('coordinador')
    OR (get_user_role() = 'gestor' AND zone_id = get_user_zone_id())
  );

-- Supervisor: solo borrar proyectos en borrador
CREATE POLICY "Supervisors delete own draft projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id AND status = 'borrador');

-- ============================================================
-- ROUTES RLS — ADD READ POLICIES FOR OTHER ROLES
-- ============================================================

CREATE POLICY "Coordinators can view all routes"
  ON routes FOR SELECT
  USING (
    get_user_role() IN ('coordinador', 'administrador')
    OR (get_user_role() = 'gestor' AND EXISTS (
      SELECT 1 FROM projects WHERE projects.id = routes.project_id AND projects.zone_id = get_user_zone_id()
    ))
  );

-- ============================================================
-- POLES RLS — ADD READ POLICIES FOR OTHER ROLES
-- ============================================================

CREATE POLICY "Coordinators can view all poles"
  ON poles FOR SELECT
  USING (
    get_user_role() IN ('coordinador', 'administrador')
    OR (get_user_role() = 'gestor' AND EXISTS (
      SELECT 1 FROM routes
      JOIN projects ON projects.id = routes.project_id
      WHERE routes.id = poles.route_id AND projects.zone_id = get_user_zone_id()
    ))
  );

-- ============================================================
-- BUDGET ITEMS RLS
-- ============================================================

ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Supervisor: ve budget de sus proyectos
-- Others: ve budget de proyectos que pueden ver
CREATE POLICY "View budget items"
  ON budget_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = budget_items.project_id
    AND (
      projects.user_id = auth.uid()
      OR get_user_role() IN ('coordinador', 'administrador')
      OR (get_user_role() = 'gestor' AND projects.zone_id = get_user_zone_id())
    )
  ));

-- Supervisor: CRUD en borrador/rechazado
CREATE POLICY "Supervisors manage budget items"
  ON budget_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = budget_items.project_id
    AND projects.user_id = auth.uid()
    AND projects.status IN ('borrador', 'rechazado')
  ));

CREATE POLICY "Supervisors update budget items"
  ON budget_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = budget_items.project_id
    AND projects.user_id = auth.uid()
    AND projects.status IN ('borrador', 'rechazado')
  ));

CREATE POLICY "Supervisors delete budget items"
  ON budget_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = budget_items.project_id
    AND projects.user_id = auth.uid()
    AND projects.status IN ('borrador', 'rechazado')
  ));

-- ============================================================
-- PROJECT COMMENTS RLS
-- ============================================================

ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View comments on accessible projects"
  ON project_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_comments.project_id
    AND (
      projects.user_id = auth.uid()
      OR get_user_role() IN ('coordinador', 'administrador')
      OR (get_user_role() = 'gestor' AND projects.zone_id = get_user_zone_id())
    )
  ));

CREATE POLICY "Authenticated users can insert comments"
  ON project_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND get_user_role() != 'administrador'
  );

-- ============================================================
-- AUDIT LOG RLS
-- ============================================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Supervisor: ve audit de sus proyectos
-- Gestor: ve audit de su zona
-- Admin: ve todo
CREATE POLICY "View audit log"
  ON audit_log FOR SELECT
  USING (
    get_user_role() = 'administrador'
    OR auth.uid() = user_id
    OR (get_user_role() = 'gestor' AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = audit_log.project_id
      AND projects.zone_id = get_user_zone_id()
    ))
  );

-- Any non-admin authenticated user can insert audit entries
CREATE POLICY "Insert audit log entries"
  ON audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id AND get_user_role() != 'administrador');
