-- Add color column to route_segments for per-segment custom colors
ALTER TABLE route_segments ADD COLUMN color VARCHAR(7) DEFAULT NULL;
