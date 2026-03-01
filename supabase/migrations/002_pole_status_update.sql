-- Add new status values to pole_status enum
ALTER TYPE pole_status ADD VALUE IF NOT EXISTS 'nuevo';
ALTER TYPE pole_status ADD VALUE IF NOT EXISTS 'existente';
ALTER TYPE pole_status ADD VALUE IF NOT EXISTS 'en_retiro';
ALTER TYPE pole_status ADD VALUE IF NOT EXISTS 'cambiar';

-- Migrate existing data from old values to new values
UPDATE poles SET status = 'nuevo' WHERE status = 'planned';
UPDATE poles SET status = 'existente' WHERE status = 'installed';
