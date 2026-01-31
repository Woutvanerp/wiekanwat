# Practical Examples: Using Employee-Client Relations

Real-world examples showing how to use the many-to-many relationship functions in your Next.js app.

## ✅ Already Implemented

Your **client detail page** (`/app/clients/[id]/page.js`) now uses the real many-to-many relationship:

```javascript
// Import the function
import { getEmployeesByClient } from '../../../utils/employeeClientRelations'

// Fetch employees assigned to this client
const { data: assignedEmployees, error } = await getEmployeesByClient(clientData.id)

if (!error) {
  setEmployees(assignedEmployees || [])
}
```

## 📋 More Practical Examples

### Example 1: Assign Employee to Client (with Form)

```javascript
'use client'

import { useState } from 'react'
import { assignEmployeeToClient, updateClientEmployeeCount } from '../utils/employeeClientRelations'

export default function AssignEmployeeForm({ clientId, onSuccess }) {
  const [employeeId, setEmployeeId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // Assign employee to client
      const { data, error } = await assignEmployeeToClient(
        employeeId,
        clientId,
        projectName,
        startDate
      )

      if (error) {
        alert(`Error: ${error.message}`)
        return
      }

      alert('Employee successfully assigned!')
      onSuccess?.()
      
      // Reset form
      setEmployeeId('')
      setProjectName('')
      setStartDate(new Date().toISOString().split('T')[0])
      
    } catch (err) {
      alert(`Failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        placeholder="Employee ID"
        required
      />
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project Name (optional)"
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Assigning...' : 'Assign Employee'}
      </button>
    </form>
  )
}
```

### Example 2: Show Employee Work History on Profile Page

```javascript
'use client'

import { useState, useEffect } from 'react'
import { getEmployeeHistory } from '../utils/employeeClientRelations'
import { Calendar, Building2, Briefcase } from 'lucide-react'

export default function EmployeeWorkHistory({ employeeId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      const { data, error } = await getEmployeeHistory(employeeId)
      
      if (error) {
        console.error('Error loading history:', error)
      } else {
        setHistory(data || [])
      }
      setLoading(false)
    }
    
    loadHistory()
  }, [employeeId])

  if (loading) return <p>Loading work history...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Work History</h2>
      
      {history.length === 0 ? (
        <p>No work history yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((assignment) => (
            <div 
              key={assignment.assignmentId}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderLeft: assignment.isActive 
                  ? '4px solid #00AA00' 
                  : '4px solid #888'
              }}
            >
              {/* Client Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Building2 size={24} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                    {assignment.clientInfo.name}
                  </h3>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    color: assignment.isActive ? '#00AA00' : '#888'
                  }}>
                    {assignment.isActive ? '✓ Currently Active' : '○ Completed'}
                  </span>
                </div>
              </div>

              {/* Project Name */}
              {assignment.projectName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Briefcase size={16} style={{ color: '#666' }} />
                  <span>{assignment.projectName}</span>
                </div>
              )}

              {/* Duration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Calendar size={16} style={{ color: '#666' }} />
                <span>
                  {assignment.startDate} → {assignment.endDate || 'Present'}
                  <strong style={{ marginLeft: '1rem' }}>({assignment.duration})</strong>
                </span>
              </div>

              {/* Industry */}
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'rgba(0, 0, 255, 0.08)',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}>
                  {assignment.clientInfo.industry}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Example 3: Remove Employee from Client

```javascript
import { removeEmployeeFromClient } from '../utils/employeeClientRelations'

async function handleRemoveEmployee(employeeId, clientId, employeeName, clientName) {
  // Confirm with user
  if (!confirm(`Remove ${employeeName} from ${clientName}?`)) {
    return
  }

  try {
    const { data, error } = await removeEmployeeFromClient(employeeId, clientId)

    if (error) {
      alert(`Error: ${error.message}`)
      return
    }

    alert(`Assignment ended on ${data.end_date}`)
    // Refresh your data here
    
  } catch (err) {
    alert(`Failed: ${err.message}`)
  }
}

// Usage in a component:
<button onClick={() => handleRemoveEmployee(emp.id, client.id, emp.name, client.name)}>
  Remove from Project
</button>
```

### Example 4: Get All Clients for an Employee

```javascript
'use client'

import { useState, useEffect } from 'react'
import { getClientsByEmployee } from '../utils/employeeClientRelations'

export default function EmployeeActiveClients({ employeeId }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClients() {
      const { data, error } = await getClientsByEmployee(employeeId)
      
      if (!error) {
        setClients(data || [])
      }
      setLoading(false)
    }
    
    loadClients()
  }, [employeeId])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h3>Currently Working For ({clients.length})</h3>
      
      {clients.map(client => (
        <div key={client.id} style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid #ddd' }}>
          <h4>{client.name}</h4>
          <p>Industry: {client.industry}</p>
          <p>Project: {client.projectName || 'N/A'}</p>
          <p>Started: {client.startDate}</p>
        </div>
      ))}
    </div>
  )
}
```

### Example 5: Dashboard Statistics

```javascript
'use client'

import { useState, useEffect } from 'react'
import { getAssignmentStats } from '../utils/employeeClientRelations'
import { Users, Briefcase, TrendingUp, Archive } from 'lucide-react'

export default function AssignmentsDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const { data, error } = await getAssignmentStats()
      
      if (!error) {
        setStats(data)
      }
      setLoading(false)
    }
    
    loadStats()
  }, [])

  if (loading) return <p>Loading statistics...</p>
  if (!stats) return <p>No data available</p>

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      padding: '2rem'
    }}>
      {/* Active Assignments */}
      <StatCard
        icon={<Briefcase size={32} />}
        value={stats.activeAssignments}
        label="Active Assignments"
        color="#00AA00"
      />

      {/* Working Employees */}
      <StatCard
        icon={<Users size={32} />}
        value={stats.employeesWithActiveAssignments}
        label="Employees on Projects"
        color="#0066ff"
      />

      {/* Active Clients */}
      <StatCard
        icon={<TrendingUp size={32} />}
        value={stats.clientsWithActiveAssignments}
        label="Clients with Teams"
        color="#9333ea"
      />

      {/* Completed Assignments */}
      <StatCard
        icon={<Archive size={32} />}
        value={stats.inactiveAssignments}
        label="Completed Projects"
        color="#888"
      />
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ color, marginBottom: '1rem' }}>
        {icon}
      </div>
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#333',
        marginBottom: '0.5rem'
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.95rem', color: '#666' }}>
        {label}
      </div>
    </div>
  )
}
```

### Example 6: Sync All Client Employee Counts (Admin Tool)

```javascript
import { updateAllClientEmployeeCounts } from '../utils/employeeClientRelations'

export default function AdminTools() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSync() {
    if (!confirm('Sync all client employee counts? This may take a moment.')) {
      return
    }

    setSyncing(true)
    setResult(null)

    try {
      const { data, error } = await updateAllClientEmployeeCounts()

      if (error) {
        alert(`Error: ${error.message}`)
      } else {
        setResult(data)
        alert(`✓ Updated ${data.successful} out of ${data.totalClients} clients`)
      }
    } catch (err) {
      alert(`Failed: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Tools</h2>
      
      <button
        onClick={handleSync}
        disabled={syncing}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#0066ff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: syncing ? 'not-allowed' : 'pointer',
          opacity: syncing ? 0.6 : 1
        }}
      >
        {syncing ? 'Syncing...' : 'Sync All Client Employee Counts'}
      </button>

      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <p>✓ Total Clients: {result.totalClients}</p>
          <p>✓ Successful: {result.successful}</p>
          <p>✗ Failed: {result.failed}</p>
        </div>
      )}
    </div>
  )
}
```

### Example 7: Check Current Assignment Before Assigning

```javascript
import { getAssignment, assignEmployeeToClient } from '../utils/employeeClientRelations'

async function smartAssignEmployee(employeeId, clientId, projectName, startDate) {
  // First check if employee is already assigned
  const { data: existing } = await getAssignment(employeeId, clientId)

  if (existing) {
    alert('Employee is already assigned to this client!')
    return false
  }

  // Proceed with assignment
  const { data, error } = await assignEmployeeToClient(
    employeeId,
    clientId,
    projectName,
    startDate
  )

  if (error) {
    alert(`Error: ${error.message}`)
    return false
  }

  alert('✓ Employee successfully assigned!')
  return true
}
```

## 🎯 Quick Reference

| Function | When to Use |
|----------|-------------|
| `getEmployeesByClient(clientId)` | Show team on client detail page |
| `getClientsByEmployee(employeeId)` | Show active clients on employee profile |
| `assignEmployeeToClient(...)` | Add employee to client project |
| `removeEmployeeFromClient(...)` | End an assignment |
| `getEmployeeHistory(employeeId)` | Show complete work timeline |
| `updateClientEmployeeCount(clientId)` | Manual sync (rarely needed - auto-called) |
| `getAssignment(...)` | Check if assignment exists |
| `updateAllClientEmployeeCounts()` | Admin tool / data migration |
| `getAssignmentStats()` | Dashboard statistics |

## 💡 Tips

1. **Always handle errors**: Check the `error` object in responses
2. **Loading states**: Show loading indicators for better UX
3. **Auto-refresh**: Reload data after assignments/removals
4. **Confirmation dialogs**: Ask before removing employees
5. **Toast notifications**: Consider using toast instead of alerts for better UX

## 🔗 Next Steps

- ✅ Your client detail page now uses real data
- 📋 Add the `ClientTeamManager` component for full team management UI
- 📊 Create an employee profile page with work history
- 🎯 Build a dashboard with assignment statistics
- 🔧 Add admin tools for bulk operations

All these functions work with your existing database table! 🎉


