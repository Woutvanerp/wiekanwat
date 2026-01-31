# Quick Setup Guide: Many-to-Many Employee-Client Relations

This guide helps you set up and use the many-to-many relationship system for managing employee-client assignments.

## 📁 Files Created

### 1. Core Utility Functions
**`utils/employeeClientRelations.js`**
- All database functions for managing employee-client relationships
- 9 functions with full error handling
- Proper Supabase joins and queries

### 2. Database Schema
**`scripts/create-employee-clients-table.sql`**
- SQL script to create the `employee_clients` junction table
- Includes indexes for performance
- Foreign key constraints
- Automatic timestamp updates

### 3. Test Script
**`scripts/test-employee-client-relations.js`**
- Complete test suite for all functions
- Example usage patterns
- Run to verify everything works

### 4. React Component Example
**`components/ClientTeamManager.js`**
- Ready-to-use component for managing client teams
- Add/remove employees from clients
- Shows team members with details
- Modal for adding new assignments

### 5. Documentation
**`EMPLOYEE_CLIENT_RELATIONS.md`**
- Complete API reference
- Usage examples
- Common use cases
- Troubleshooting guide

## 🚀 Quick Start (5 Steps)

### Step 1: Create the Database Table

1. Go to your Supabase Dashboard
2. Open SQL Editor
3. Copy contents of `scripts/create-employee-clients-table.sql`
4. Run the SQL script

### Step 2: Set Up Row Level Security (Optional but Recommended)

In Supabase SQL Editor, run:

```sql
ALTER TABLE employee_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON employee_clients
  FOR ALL
  USING (true);
```

### Step 3: Test the Functions

Update the example IDs in `scripts/test-employee-client-relations.js` and run:

```bash
node scripts/test-employee-client-relations.js
```

### Step 4: Use in Your Code

Import the functions you need:

```javascript
import {
  getEmployeesByClient,
  assignEmployeeToClient,
  removeEmployeeFromClient
} from './utils/employeeClientRelations'
```

### Step 5: Integrate into Your UI

Use the `ClientTeamManager` component or create your own:

```javascript
import ClientTeamManager from '../components/ClientTeamManager'

// In your client detail page:
<ClientTeamManager clientId={client.id} clientName={client.name} />
```

## 📊 Database Structure

```
employees (existing)
├── id (UUID)
├── name
├── location
├── hierarchy
└── ... other fields

clients (existing)
├── id (BIGINT)
├── name
├── industry
├── employees_assigned  ← Auto-updated!
└── ... other fields

employee_clients (NEW junction table)
├── id (BIGSERIAL)
├── employee_id (UUID) → employees.id
├── client_id (BIGINT) → clients.id
├── start_date
├── end_date
├── project_name
├── is_active
├── created_at
└── updated_at
```

## 🎯 Common Tasks

### Assign Employee to Client

```javascript
const { data, error } = await assignEmployeeToClient(
  'employee-uuid',
  1,                              // client ID
  'Mobile App Development',       // project name (optional)
  '2024-02-01'                   // start date (optional)
)
```

### Get All Employees for a Client

```javascript
const { data: employees, error } = await getEmployeesByClient(clientId)

// data includes full employee details plus:
// - startDate
// - projectName
// - assignmentId
```

### View Employee Work History

```javascript
const { data: history, error } = await getEmployeeHistory(employeeId)

// Returns timeline with:
// - All past and current assignments
// - Duration calculations
// - Client information
```

### Remove Employee from Client

```javascript
const { data, error } = await removeEmployeeFromClient(
  employeeId,
  clientId
)

// Sets is_active = false
// Sets end_date = today
// Updates client's employees_assigned count
```

## 🔧 Available Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getEmployeesByClient(clientId)` | Get active employees for client | Array of employees |
| `getClientsByEmployee(employeeId)` | Get active clients for employee | Array of clients |
| `assignEmployeeToClient(...)` | Create new assignment | Assignment object |
| `removeEmployeeFromClient(...)` | End assignment (soft delete) | Updated assignment |
| `getEmployeeHistory(employeeId)` | Get complete timeline | Array of all assignments |
| `updateClientEmployeeCount(clientId)` | Sync employee count | Updated client |
| `getAssignment(employeeId, clientId)` | Get specific assignment | Assignment details |
| `updateAllClientEmployeeCounts()` | Bulk update all counts | Statistics |
| `getAssignmentStats()` | System-wide statistics | Stats object |

## 💡 Integration Examples

### Example 1: Client Detail Page

```javascript
// app/clients/[id]/page.js
import ClientTeamManager from '../../../components/ClientTeamManager'

export default function ClientDetailPage({ params }) {
  return (
    <div>
      {/* ... other client info ... */}
      
      <ClientTeamManager 
        clientId={params.id} 
        clientName={client.name} 
      />
    </div>
  )
}
```

### Example 2: Employee Profile Page

```javascript
// Show work history on employee profile
const { data: history } = await getEmployeeHistory(employeeId)

return (
  <section>
    <h3>Work History</h3>
    {history.map(assignment => (
      <div key={assignment.assignmentId}>
        <h4>{assignment.clientInfo.name}</h4>
        <p>{assignment.projectName}</p>
        <span>{assignment.duration}</span>
      </div>
    ))}
  </section>
)
```

### Example 3: Dashboard Statistics

```javascript
const { data: stats } = await getAssignmentStats()

return (
  <div>
    <StatCard value={stats.activeAssignments} label="Active Projects" />
    <StatCard value={stats.employeesWithActiveAssignments} label="Working Employees" />
    <StatCard value={stats.clientsWithActiveAssignments} label="Active Clients" />
  </div>
)
```

## ⚠️ Important Notes

1. **Auto-updating counts**: The `employees_assigned` field in the clients table is automatically updated when you assign or remove employees. Don't update it manually.

2. **Soft deletes**: We use `is_active` flags instead of deleting records, preserving history.

3. **Unique constraint**: An employee cannot be assigned to the same client twice with `is_active=true`. Remove the existing assignment first.

4. **Error handling**: All functions return `{data, error}` objects. Always check for errors:
   ```javascript
   const { data, error } = await assignEmployeeToClient(...)
   if (error) {
     console.error('Failed:', error.message)
     return
   }
   // Use data
   ```

5. **Date formats**: Use ISO date strings (YYYY-MM-DD) for dates.

## 🔍 Troubleshooting

### Problem: Table doesn't exist
**Solution**: Run `scripts/create-employee-clients-table.sql` in Supabase

### Problem: Permission denied
**Solution**: Set up RLS policies (see Step 2 above)

### Problem: Employee count not updating
**Solution**: Call `updateClientEmployeeCount(clientId)` manually

### Problem: Can't assign employee
**Solution**: Check if active assignment already exists with `getAssignment()`

## 📚 Further Reading

For complete documentation with all parameters and detailed examples, see:
- `EMPLOYEE_CLIENT_RELATIONS.md` - Full API reference
- `scripts/test-employee-client-relations.js` - Working examples

## ✅ Next Steps

1. ✅ Run the SQL script to create the table
2. ✅ Test with the test script
3. ✅ Integrate into your client detail page
4. ✅ Add work history to employee profiles
5. ✅ Optional: Migrate existing `current_client` data

---

**Questions?** Check the full documentation in `EMPLOYEE_CLIENT_RELATIONS.md` or the test script for examples.


