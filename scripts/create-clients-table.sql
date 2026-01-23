-- SQL script to create clients table with hierarchy-based position requests
-- Run this in your Supabase SQL Editor

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  requested_positions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE clients IS 'Clients who request employees with specific hierarchies/roles';
COMMENT ON COLUMN clients.name IS 'Client company name';
COMMENT ON COLUMN clients.description IS 'Optional description of the client or project';
COMMENT ON COLUMN clients.requested_positions IS 'Array of position requests with hierarchy level and count needed, e.g. [{"hierarchy": "Senior Consultant", "count": 2, "filled": 1}]';

-- Create an index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Example data to get started
-- INSERT INTO clients (name, description, requested_positions) VALUES
-- ('ASML', 'Semiconductor manufacturing technology', '[{"hierarchy": "Senior Consultant", "count": 2}, {"hierarchy": "Consultant", "count": 3}]'),
-- ('Philips', 'Healthcare and consumer electronics', '[{"hierarchy": "Principal Consultant", "count": 1}, {"hierarchy": "Senior Consultant", "count": 1}]'),
-- ('VDL', 'High-tech systems and equipment', '[{"hierarchy": "Managing Consultant", "count": 1}, {"hierarchy": "Consultant", "count": 2}]');

-- Optional: Migrate existing clients from employees table
-- This creates client records for any unique current_client values
INSERT INTO clients (name, description, requested_positions)
SELECT DISTINCT 
  current_client as name,
  '' as description,
  '[]'::jsonb as requested_positions
FROM employees 
WHERE current_client IS NOT NULL 
  AND current_client != ''
ON CONFLICT (name) DO NOTHING;

