# AssignEmployeeModal Component - Usage Guide

A reusable modal component for assigning employees to clients with full validation and error handling.

## Features

✅ **Smart Employee Filtering**
- Automatically fetches all employees from Supabase
- Filters out employees already assigned to the client
- Shows only available employees

✅ **Searchable Dropdown**
- Real-time search/filter employees by name or role
- Shows employee name, hierarchy, and location

✅ **Complete Form Validation**
- All fields required
- Start date cannot be in the future
- Real-time error messages
- Field-level validation feedback

✅ **Professional UI/UX**
- Dark overlay with backdrop blur
- Smooth animations (fade in, slide in)
- Responsive design (mobile-friendly)
- Close on overlay click or X button
- Loading states during submission
- Success messages

✅ **Automatic Updates**
- Calls `assignEmployeeToClient()` on submit
- Auto-updates `employees_assigned` count
- Refreshes employee list after assignment
- Closes modal automatically on success

## Installation

The component is already created at:
```
components/AssignEmployeeModal.js
```

## Basic Usage

```javascript
import { useState } from 'react'
import AssignEmployeeModal from '../components/AssignEmployeeModal'

export default function ClientDetailPage() {
  const [showModal, setShowModal] = useState(false)
  const clientId = 1
  const clientName = "Acme Corporation"

  // Function to refresh employee list after assignment
  function handleAssignmentSuccess() {
    // Reload your employee data here
    loadEmployees()
  }

  return (
    <div>
      {/* Trigger Button */}
      <button onClick={() => setShowModal(true)}>
        Assign Employee
      </button>

      {/* Modal */}
      <AssignEmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        clientId={clientId}
        clientName={clientName}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | ✅ Yes | Controls modal visibility |
| `onClose` | function | ✅ Yes | Called when modal should close |
| `clientId` | number | ✅ Yes | The client ID to assign employees to |
| `clientName` | string | ✅ Yes | Client name for display |
| `onSuccess` | function | ⚪ No | Called after successful assignment |

## Complete Example (Your Client Detail Page)

```javascript
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { fetchClientById } from '../../utils/api'
import { getEmployeesByClient } from '../../utils/employeeClientRelations'
import AssignEmployeeModal from '../../components/AssignEmployeeModal'
import { Plus } from 'lucide-react'

export default function ClientDetailPage() {
  const params = useParams()
  const [client, setClient] = useState(null)
  const [employees, setEmployees] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load client and employees
  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      setLoading(true)
      
      // Fetch client
      const clientData = await fetchClientById(params.id)
      setClient(clientData)
      
      // Fetch assigned employees
      const { data: assignedEmployees } = await getEmployeesByClient(params.id)
      setEmployees(assignedEmployees || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>{client?.name}</h1>

      {/* Employee Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Team Members ({employees.length})</h2>
          
          {/* Assign Button */}
          <button
            onClick={() => setShowAssignModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            Assign Employee
          </button>
        </div>

        {/* Employee List */}
        <div>
          {employees.map(emp => (
            <div key={emp.id}>{emp.name}</div>
          ))}
        </div>
      </div>

      {/* Assign Employee Modal */}
      <AssignEmployeeModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        clientId={client?.id}
        clientName={client?.name}
        onSuccess={loadData}  // Reload data after successful assignment
      />
    </div>
  )
}
```

## Form Fields

### 1. Employee Selection
- **Type**: Searchable dropdown
- **Required**: Yes
- **Validation**: Must select an employee
- **Features**:
  - Real-time search by name or role
  - Shows: Name - Role (Location)
  - Only shows available employees (not already assigned)
  - Example: "Emma van der Berg - Senior Consultant (Eindhoven)"

### 2. Project Name
- **Type**: Text input
- **Required**: Yes
- **Validation**: Cannot be empty
- **Placeholder**: "e.g., Cloud Migration Project"
- **Max length**: None
- **Example**: "Digital Transformation Initiative"

### 3. Start Date
- **Type**: Date picker
- **Required**: Yes
- **Validation**: Cannot be in the future
- **Default**: Today's date
- **Format**: YYYY-MM-DD
- **Max**: Today

## Validation Rules

```javascript
// Employee
✓ Must select an employee
✗ Empty selection

// Project Name
✓ "Cloud Migration"
✓ "Mobile App Development"
✗ "" (empty)
✗ "   " (only spaces)

// Start Date
✓ 2024-01-15 (past date)
✓ 2024-01-23 (today)
✗ 2024-02-01 (future date)
✗ Empty
```

## Error Handling

### Fetch Errors
```javascript
// Shown at top of modal
"Failed to load employees. Please try again."
```

### Validation Errors
```javascript
{
  employee: "Please select an employee",
  projectName: "Project name is required",
  startDate: "Start date cannot be in the future"
}
```

### Submission Errors
```javascript
// Shown before buttons
"Employee is already actively assigned to this client"
"Failed to assign employee. Please try again."
```

## Success Flow

1. User fills out form
2. Clicks "Assign to Client"
3. Button shows "Assigning..." (disabled)
4. API calls:
   - `assignEmployeeToClient(employeeId, clientId, projectName, startDate)`
   - `updateClientEmployeeCount(clientId)` (automatic)
5. Success alert: "✓ Emma van der Berg has been successfully assigned to Acme Corporation!"
6. Modal closes
7. `onSuccess()` callback fires
8. Parent page refreshes employee list

## Customization

### Change Success Message

```javascript
// In AssignEmployeeModal.js, modify showSuccessMessage():
function showSuccessMessage(employeeName) {
  // Option 1: Use a toast library
  toast.success(`${employeeName} assigned successfully!`)
  
  // Option 2: Custom notification
  showNotification({
    type: 'success',
    message: `${employeeName} is now working for ${clientName}`
  })
  
  // Option 3: Current alert (default)
  alert(`✓ ${employeeName} has been successfully assigned to ${clientName}!`)
}
```

### Styling

The modal uses inline styles for portability. To customize:

```javascript
// Modal overlay
backgroundColor: 'rgba(0, 0, 0, 0.6)'  // Change opacity

// Modal box
borderRadius: '16px'  // Change border radius
maxWidth: '550px'     // Change width
padding: '2rem'       // Change padding

// Buttons
backgroundColor: 'var(--primary)'  // Use CSS variables
```

### Animations

```javascript
// Current animations in <style jsx>:
- fadeIn: 0.2s ease (overlay)
- slideIn: 0.3s ease (modal box)

// Modify timing:
animation: 'slideIn 0.5s ease'  // Slower
animation: 'slideIn 0.1s ease'  // Faster
```

## States

| State | Description | Initial Value |
|-------|-------------|---------------|
| `selectedEmployeeId` | Selected employee UUID | `''` |
| `projectName` | Project name input | `''` |
| `startDate` | Assignment start date | Today's date |
| `availableEmployees` | Filtered employee list | `[]` |
| `loading` | Form submission state | `false` |
| `fetchingEmployees` | Loading employees | `true` |
| `errors` | Validation errors | `{}` |
| `searchTerm` | Search filter | `''` |

## Methods

### Public (via props)
- `onClose()` - Close the modal
- `onSuccess()` - Called after successful assignment

### Internal
- `loadAvailableEmployees()` - Fetch and filter employees
- `validateForm()` - Validate all inputs
- `handleSubmit()` - Process form submission
- `showSuccessMessage()` - Display success feedback
- `resetForm()` - Clear all inputs
- `handleClose()` - Close with cleanup

## Accessibility

✅ **Keyboard Navigation**
- Tab through inputs
- Enter to submit
- Escape to close (add if needed)

✅ **Screen Readers**
- All inputs have labels
- Error messages associated with fields
- Required fields marked with *

✅ **Visual Feedback**
- Focus states on inputs
- Hover states on buttons
- Loading states
- Error states (red borders)

## Common Issues

### Issue: Modal doesn't close after assignment
**Solution**: Make sure `onSuccess` callback reloads data properly

```javascript
<AssignEmployeeModal
  onSuccess={() => {
    loadData()  // Your data loading function
  }}
/>
```

### Issue: All employees already assigned
**Message**: "All employees are already assigned to this client"
**Solution**: This is normal - assign button should be disabled

### Issue: Date validation error
**Problem**: Start date in future
**Solution**: Use date picker or ensure date <= today

### Issue: Duplicate assignment error
**Message**: "Employee is already actively assigned to this client"
**Solution**: Employee must be removed first before reassigning

## Integration Checklist

- [ ] Import `AssignEmployeeModal` component
- [ ] Add state for modal visibility (`showModal`)
- [ ] Add trigger button with `onClick={() => setShowModal(true)}`
- [ ] Pass required props: `isOpen`, `onClose`, `clientId`, `clientName`
- [ ] Add `onSuccess` callback to refresh data
- [ ] Test modal opens/closes
- [ ] Test form validation
- [ ] Test successful assignment
- [ ] Test error scenarios

## Future Enhancements

Possible improvements:

1. **Toast Notifications**: Replace alerts with toast library
2. **Multiple Assignment**: Assign multiple employees at once
3. **Bulk Actions**: CSV import for batch assignments
4. **Date Restrictions**: Custom date range limits
5. **Employee Preview**: Show employee details on selection
6. **Assignment Templates**: Save common project names
7. **Escape Key**: Close modal with Escape key
8. **Form Persistence**: Remember last used values

---

## Support

For issues or questions:
- Check `PRACTICAL_EXAMPLES.md` for usage examples
- See `EMPLOYEE_CLIENT_RELATIONS.md` for API documentation
- Test with `scripts/test-employee-client-relations.js`


