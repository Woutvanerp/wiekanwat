-- Create employee_clients junction table for many-to-many relationship
-- This table manages the assignments between employees and clients

CREATE TABLE IF NOT EXISTS employee_clients (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID NOT NULL,
  client_id BIGINT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  project_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  CONSTRAINT fk_employee
    FOREIGN KEY (employee_id) 
    REFERENCES employees(id)
    ON DELETE CASCADE,
  
  CONSTRAINT fk_client
    FOREIGN KEY (client_id) 
    REFERENCES clients(id)
    ON DELETE CASCADE,
  
  -- Ensure end_date is after start_date
  CONSTRAINT check_dates
    CHECK (end_date IS NULL OR end_date >= start_date),
  
  -- Prevent duplicate active assignments
  CONSTRAINT unique_active_assignment
    UNIQUE (employee_id, client_id, is_active)
    WHERE (is_active = true)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employee_clients_employee_id ON employee_clients(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_clients_client_id ON employee_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_employee_clients_is_active ON employee_clients(is_active);
CREATE INDEX IF NOT EXISTS idx_employee_clients_start_date ON employee_clients(start_date DESC);

-- Create a compound index for common queries
CREATE INDEX IF NOT EXISTS idx_employee_clients_active_lookup 
  ON employee_clients(employee_id, client_id, is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_employee_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_employee_clients_updated_at
  BEFORE UPDATE ON employee_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_clients_updated_at();

-- Add comments for documentation
COMMENT ON TABLE employee_clients IS 'Junction table managing many-to-many relationships between employees and clients';
COMMENT ON COLUMN employee_clients.id IS 'Primary key';
COMMENT ON COLUMN employee_clients.employee_id IS 'Foreign key to employees table';
COMMENT ON COLUMN employee_clients.client_id IS 'Foreign key to clients table';
COMMENT ON COLUMN employee_clients.start_date IS 'Date when employee started working on this client project';
COMMENT ON COLUMN employee_clients.end_date IS 'Date when employee finished working on this client project (NULL if still active)';
COMMENT ON COLUMN employee_clients.project_name IS 'Name of the specific project or assignment';
COMMENT ON COLUMN employee_clients.is_active IS 'Whether this assignment is currently active';
COMMENT ON COLUMN employee_clients.created_at IS 'Timestamp when the assignment was created';
COMMENT ON COLUMN employee_clients.updated_at IS 'Timestamp when the assignment was last updated';


