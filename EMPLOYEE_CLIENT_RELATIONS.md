# Employee-Client Relations Management

This document explains how to manage the many-to-many relationship between employees and clients using the `employee_clients` junction table.

## Database Structure

### Tables

#### `employees` table
- `id` (UUID) - Primary key
- `name` (TEXT)
- `location` (TEXT)
- `hierarchy` (TEXT)
- `skills` (TEXT[])
- `current_client` (TEXT)
- `cv` (TEXT)
- `profile_picture` (TEXT)
- `project_start_date` (DATE)

#### `clients` table
- `id` (BIGINT) - Primary key
- `name` (TEXT)
- `industry` (TEXT)
- `status` (TEXT)
- `logo` (TEXT)
- `description` (TEXT)
- `employees_assigned` (INTEGER)
- `active_teams` (INTEGER)
- `contract_start` (DATE)
- `primary_contact` (TEXT)
- `contact_email` (TEXT)
- `contact_phone` (TEXT)

#### `employee_clients` junction table
- `id` (BIGSERIAL) - Primary key
- `employee_id` (UUID) - Foreign key to employees
- `client_id` (BIGINT) - Foreign key to clients
- `start_date` (DATE) - When employee started on this client
- `end_date` (DATE) - When employee finished (NULL if still active)
- `project_name` (TEXT) - Name of the project/assignment
- `is_active` (BOOLEAN) - Whether this assignment is currently active
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Setup Instructions

### 1. Create the Junction Table

Run the SQL script in Supabase SQL Editor:

```bash
# Copy the contents of scripts/create-employee-clients-table.sql
# and run it in your Supabase SQL Editor
```

Or use the Supabase CLI:

```bash
supabase db push --file scripts/create-employee-clients-table.sql
```

### 2. Set Up Row Level Security (RLS)

Add these policies in Supabase:

```sql
-- Enable RLS
ALTER TABLE employee_clients ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all users" ON employee_clients
  FOR SELECT
  USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow insert access to authenticated users" ON employee_clients
  FOR INSERT
  WITH CHECK (true);

-- Allow update access to authenticated users
CREATE POLICY "Allow update access to authenticated users" ON employee_clients
  FOR UPDATE
  USING (true);

-- Allow delete access to authenticated users
CREATE POLICY "Allow delete access to authenticated users" ON employee_clients
  FOR DELETE
  USING (true);
```

## Utility Functions

All functions are available in `utils/employeeClientRelations.js`

### Import

```javascript
import {
  getEmployeesByClient,
  getClientsByEmployee,
  assignEmployeeToClient,
  removeEmployeeFromClient,
  getEmployeeHistory,
  updateClientEmployeeCount,
  getAssignment,
  updateAllClientEmployeeCounts,
  getAssignmentStats
} from './utils/employeeClientRelations'
```

### Function Reference

#### `getEmployeesByClient(clientId)`

Get all active employees assigned to a specific client.

**Parameters:**
- `clientId` (number) - The client ID

**Returns:**
- `{data: Array|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await getEmployeesByClient(1)
if (!error) {
  console.log(`Found ${data.length} employees`)
  data.forEach(emp => {
    console.log(`${emp.name} - ${emp.hierarchy}`)
    console.log(`Project: ${emp.projectName}`)
    console.log(`Started: ${emp.startDate}`)
  })
}
```

---

#### `getClientsByEmployee(employeeId)`

Get all active clients for a specific employee.

**Parameters:**
- `employeeId` (string) - The employee UUID

**Returns:**
- `{data: Array|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await getClientsByEmployee('employee-uuid')
if (!error) {
  console.log(`Employee is working for ${data.length} clients`)
  data.forEach(client => {
    console.log(`${client.name} - ${client.industry}`)
    console.log(`Project: ${client.projectName}`)
  })
}
```

---

#### `assignEmployeeToClient(employeeId, clientId, projectName, startDate)`

Assign an employee to a client (create a new active assignment).

**Parameters:**
- `employeeId` (string) - The employee UUID
- `clientId` (number) - The client ID
- `projectName` (string) - Name of the project (optional)
- `startDate` (string) - Start date in YYYY-MM-DD format (defaults to today)

**Returns:**
- `{data: Object|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await assignEmployeeToClient(
  'employee-uuid',
  1,
  'Digital Transformation Initiative',
  '2024-02-01'
)

if (error) {
  console.error('Failed to assign employee:', error.message)
} else {
  console.log('Assignment created:', data.id)
}
```

**Notes:**
- Prevents duplicate active assignments
- Automatically updates the client's `employees_assigned` count

---

#### `removeEmployeeFromClient(employeeId, clientId)`

Remove an employee from a client (soft delete - sets `is_active` to false).

**Parameters:**
- `employeeId` (string) - The employee UUID
- `clientId` (number) - The client ID

**Returns:**
- `{data: Object|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await removeEmployeeFromClient(
  'employee-uuid',
  1
)

if (!error) {
  console.log('Assignment ended on:', data.end_date)
}
```

**Notes:**
- Sets `is_active` to false
- Sets `end_date` to today
- Automatically updates the client's `employees_assigned` count

---

#### `getEmployeeHistory(employeeId)`

Get complete assignment history for an employee (timeline).

**Parameters:**
- `employeeId` (string) - The employee UUID

**Returns:**
- `{data: Array|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await getEmployeeHistory('employee-uuid')
if (!error) {
  console.log('Work History:')
  data.forEach(assignment => {
    console.log(`\n${assignment.clientInfo.name}`)
    console.log(`Project: ${assignment.projectName || 'N/A'}`)
    console.log(`Duration: ${assignment.duration}`)
    console.log(`Status: ${assignment.isActive ? 'Active' : 'Completed'}`)
    console.log(`Period: ${assignment.startDate} to ${assignment.endDate || 'Present'}`)
  })
}
```

**Data includes:**
- Client information
- Project name
- Start and end dates
- Duration (calculated)
- Active status

---

#### `updateClientEmployeeCount(clientId)`

Update the `employees_assigned` count for a specific client based on active assignments.

**Parameters:**
- `clientId` (number) - The client ID

**Returns:**
- `{data: Object|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await updateClientEmployeeCount(1)
if (!error) {
  console.log(`Client now has ${data.employees_assigned} employees`)
}
```

**Notes:**
- Automatically called by `assignEmployeeToClient` and `removeEmployeeFromClient`
- Useful for data synchronization

---

#### `getAssignment(employeeId, clientId)`

Get details of a specific active employee-client assignment.

**Parameters:**
- `employeeId` (string) - The employee UUID
- `clientId` (number) - The client ID

**Returns:**
- `{data: Object|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await getAssignment('employee-uuid', 1)
if (!error) {
  console.log('Assignment ID:', data.id)
  console.log('Employee:', data.employees.name)
  console.log('Client:', data.clients.name)
  console.log('Project:', data.project_name)
}
```

---

#### `updateAllClientEmployeeCounts()`

Update employee counts for all clients (bulk operation).

**Returns:**
- `{data: Object|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await updateAllClientEmployeeCounts()
if (!error) {
  console.log(`Updated ${data.successful} out of ${data.totalClients} clients`)
  if (data.failed > 0) {
    console.warn(`${data.failed} updates failed`)
  }
}
```

**Use cases:**
- Data migration
- Regular maintenance
- After bulk imports

---

#### `getAssignmentStats()`

Get system-wide statistics about employee-client assignments.

**Returns:**
- `{data: Object|null, error: Error|null}`

**Example:**
```javascript
const { data, error } = await getAssignmentStats()
if (!error) {
  console.log('System Statistics:')
  console.log(`Active Assignments: ${data.activeAssignments}`)
  console.log(`Total Assignments: ${data.totalAssignments}`)
  console.log(`Inactive Assignments: ${data.inactiveAssignments}`)
  console.log(`Employees Working: ${data.employeesWithActiveAssignments}`)
  console.log(`Clients with Teams: ${data.clientsWithActiveAssignments}`)
}
```

## Common Use Cases

### Use Case 1: Assign Employee to New Client Project

```javascript
// Create the assignment
const { data, error } = await assignEmployeeToClient(
  employeeId,
  clientId,
  'Cloud Migration Project',
  '2024-03-01'
)

if (error) {
  alert(`Failed to assign employee: ${error.message}`)
} else {
  alert('Employee successfully assigned!')
  // Client's employees_assigned count is automatically updated
}
```

### Use Case 2: Show Client Team Page

```javascript
// Get all employees for a client
const { data: employees, error } = await getEmployeesByClient(clientId)

if (!error) {
  return (
    <div>
      <h2>Team Members ({employees.length})</h2>
      {employees.map(emp => (
        <EmployeeCard 
          key={emp.id}
          name={emp.name}
          role={emp.hierarchy}
          startDate={emp.startDate}
          project={emp.projectName}
        />
      ))}
    </div>
  )
}
```

### Use Case 3: Display Employee Work History

```javascript
// Get complete history
const { data: history, error } = await getEmployeeHistory(employeeId)

if (!error) {
  return (
    <div>
      <h2>Work History</h2>
      <Timeline>
        {history.map(assignment => (
          <TimelineItem key={assignment.assignmentId}>
            <h3>{assignment.clientInfo.name}</h3>
            <p>{assignment.projectName}</p>
            <span>{assignment.duration}</span>
            <Badge>{assignment.isActive ? 'Current' : 'Past'}</Badge>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  )
}
```

### Use Case 4: End an Assignment

```javascript
// When an employee finishes working for a client
const { data, error } = await removeEmployeeFromClient(employeeId, clientId)

if (!error) {
  console.log(`Assignment ended on ${data.end_date}`)
  // Client's employees_assigned count is automatically updated
}
```

### Use Case 5: Dashboard Statistics

```javascript
// Show system-wide stats on admin dashboard
const { data: stats, error } = await getAssignmentStats()

if (!error) {
  return (
    <Dashboard>
      <StatCard title="Active Projects" value={stats.activeAssignments} />
      <StatCard title="Working Employees" value={stats.employeesWithActiveAssignments} />
      <StatCard title="Active Clients" value={stats.clientsWithActiveAssignments} />
      <StatCard title="Completed Projects" value={stats.inactiveAssignments} />
    </Dashboard>
  )
}
```

## Testing

Run the test script to verify everything is working:

```bash
node scripts/test-employee-client-relations.js
```

Make sure to update the example IDs in the script with real IDs from your database.

## Best Practices

1. **Always use the utility functions** - Don't directly manipulate the junction table
2. **Let the functions handle counts** - `employees_assigned` is automatically updated
3. **Soft deletes** - Use `removeEmployeeFromClient` instead of deleting records
4. **Check for errors** - Always handle the error object in responses
5. **Use transactions** - For bulk operations, consider wrapping in Supabase transactions

## Migration from Legacy System

If you're migrating from a single `current_client` field:

```javascript
// 1. For each employee with a current_client:
const employees = await fetchEmployees()

for (const employee of employees) {
  if (employee.currentClient) {
    // Find the client by name
    const client = await findClientByName(employee.currentClient)
    
    if (client) {
      // Create the assignment
      await assignEmployeeToClient(
        employee.id,
        client.id,
        null, // project name
        employee.projectStartDate || new Date().toISOString().split('T')[0]
      )
    }
  }
}

// 2. Update all client employee counts
await updateAllClientEmployeeCounts()
```

## Troubleshooting

### Issue: "Employee is already actively assigned to this client"
**Solution:** Use `getAssignment` to check the current assignment, or call `removeEmployeeFromClient` first.

### Issue: Employee count not updating
**Solution:** Manually call `updateClientEmployeeCount(clientId)` or `updateAllClientEmployeeCounts()`.

### Issue: Foreign key constraint errors
**Solution:** Ensure the employee and client exist before creating assignments.

### Issue: Query performance slow
**Solution:** The table has indexes on common columns. If still slow, check query execution plan.

## Support

For issues or questions, check:
- Supabase dashboard logs
- Browser console for errors
- Test script output: `node scripts/test-employee-client-relations.js`


