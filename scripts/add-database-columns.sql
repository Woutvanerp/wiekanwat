-- SQL script to add profile_picture and project_start_date columns to employees table
-- Run this in your Supabase SQL Editor

-- Add profile_picture column (text/string for URL)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add project_start_date column (date type)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS project_start_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN employees.profile_picture IS 'URL to the employee profile picture';
COMMENT ON COLUMN employees.project_start_date IS 'Date when the current project/client assignment started';



