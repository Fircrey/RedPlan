-- Migration 002 used ALTER TYPE ... ADD VALUE which fails inside transactions
-- (Supabase runs migrations in transactions). This migration properly replaces
-- the enum by converting through TEXT.

-- 1. Remove the default that references the old enum
ALTER TABLE poles ALTER COLUMN status DROP DEFAULT;

-- 2. Convert column to TEXT
ALTER TABLE poles ALTER COLUMN status TYPE TEXT;

-- 3. Migrate old English values to Spanish (if any exist)
UPDATE poles SET status = 'nuevo' WHERE status = 'planned';
UPDATE poles SET status = 'existente' WHERE status = 'installed';

-- 4. Drop the old enum
DROP TYPE pole_status;

-- 5. Create enum with correct Spanish values
CREATE TYPE pole_status AS ENUM ('nuevo', 'existente', 'en_retiro', 'cambiar');

-- 6. Convert column back to the new enum
ALTER TABLE poles ALTER COLUMN status TYPE pole_status USING status::pole_status;

-- 7. Restore default
ALTER TABLE poles ALTER COLUMN status SET DEFAULT 'nuevo';
