# 🍞 Toast Notification Standardization Guide

## Overview

This project now uses a **standardized Toast notification system** instead of browser `alert()` and `confirm()` dialogs. This provides:
- ✅ **Consistent user experience** across the entire app
- ✅ **Modern, non-blocking UI** that doesn't interrupt user workflow
- ✅ **Better accessibility** with proper ARIA labels
- ✅ **Customizable styling** to match your brand
- ✅ **Auto-dismiss** functionality with configurable duration

---

## 📋 Components Overview

### 1. **Toast Component** (`/components/Toast.js`)
The base Toast component that displays notifications.

**Props:**
- `message` (string) - The message to display
- `type` (string) - Toast type: `'success'`, `'error'`, `'info'`, `'warning'`
- `duration` (number) - Auto-dismiss duration in ms (default: 3000)
- `onClose` (function) - Callback when toast is dismissed
- `isVisible` (boolean) - Whether toast is visible

### 2. **useToast Hook** (`/utils/useToast.js`)
A custom React hook that simplifies toast management.

**Returns:**
- `showToast(message, type, duration)` - Show any toast
- `showSuccess(message)` - Shorthand for success
- `showError(message)` - Shorthand for error
- `showInfo(message)` - Shorthand for info
- `showWarning(message)` - Shorthand for warning
- `hideToast()` - Manually hide toast
- `ToastComponent` - Component to render in JSX

---

## 🚀 Quick Start: Using the useToast Hook

### Basic Example

```jsx
import { useToast } from '../utils/useToast'

function MyComponent() {
  const { showSuccess, showError, ToastComponent } = useToast()
  
  async function handleSubmit() {
    try {
      await someApiCall()
      showSuccess('Data saved successfully!')
    } catch (error) {
      showError(`Failed to save: ${error.message}`)
    }
  }
  
  return (
    <div>
      <button onClick={handleSubmit}>Save</button>
      <ToastComponent />
    </div>
  )
}
```

### All Toast Types

```jsx
function ToastExamples() {
  const { showSuccess, showError, showInfo, showWarning, ToastComponent } = useToast()
  
  return (
    <div>
      <button onClick={() => showSuccess('Operation completed!')}>Success</button>
      <button onClick={() => showError('Something went wrong!')}>Error</button>
      <button onClick={() => showInfo('Here is some information')}>Info</button>
      <button onClick={() => showWarning('Please be careful!')}>Warning</button>
      
      <ToastComponent />
    </div>
  )
}
```

### Custom Duration

```jsx
function CustomDurationExample() {
  const { showToast, ToastComponent } = useToast()
  
  function handleClick() {
    // Show for 10 seconds instead of default 4
    showToast('This will stay for 10 seconds', 'info', 10000)
  }
  
  return (
    <div>
      <button onClick={handleClick}>Show Long Toast</button>
      <ToastComponent />
    </div>
  )
}
```

---

## 🔄 Migration Examples

### Before vs After

#### ❌ OLD WAY (Browser alert)
```jsx
function handleAssign() {
  try {
    await assignEmployee(id)
    alert('Employee assigned successfully!')
  } catch (error) {
    alert(`Failed: ${error.message}`)
  }
}
```

#### ✅ NEW WAY (Toast)
```jsx
function MyComponent() {
  const { showSuccess, showError, ToastComponent } = useToast()
  
  async function handleAssign() {
    try {
      await assignEmployee(id)
      showSuccess('✓ Employee assigned successfully!')
    } catch (error) {
      showError(`Failed: ${error.message}`)
    }
  }
  
  return (
    <>
      <button onClick={handleAssign}>Assign</button>
      <ToastComponent />
    </>
  )
}
```

---

## 🎨 Manual Toast State (Alternative Method)

If you need more control, you can manage toast state manually:

```jsx
import { useState } from 'react'
import Toast from '../components/Toast'

function MyComponent() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  function handleSuccess() {
    setToast({
      show: true,
      message: 'Operation successful!',
      type: 'success'
    })
  }
  
  function handleError() {
    setToast({
      show: true,
      message: 'Something went wrong',
      type: 'error'
    })
  }
  
  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={4000}
          onClose={() => setToast({ ...toast, show: false })}
          isVisible={toast.show}
        />
      )}
    </div>
  )
}
```

---

## 🛠️ Advanced Usage

### Conditional Messages

```jsx
function DeleteUser({ userName }) {
  const { showSuccess, showWarning, ToastComponent } = useToast()
  
  async function handleDelete() {
    if (userName === 'admin') {
      showWarning('Cannot delete admin user!')
      return
    }
    
    await deleteUser(userName)
    showSuccess(`✓ ${userName} has been deleted`)
  }
  
  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <ToastComponent />
    </>
  )
}
```

### Chaining Multiple Operations

```jsx
function BulkOperation() {
  const { showInfo, showSuccess, showError, ToastComponent } = useToast()
  
  async function handleBulkDelete(ids) {
    showInfo(`Deleting ${ids.length} items...`)
    
    try {
      await bulkDelete(ids)
      showSuccess(`✓ Successfully deleted ${ids.length} items`)
    } catch (error) {
      showError(`Failed to delete items: ${error.message}`)
    }
  }
  
  return (
    <>
      <button onClick={() => handleBulkDelete([1, 2, 3])}>Bulk Delete</button>
      <ToastComponent />
    </>
  )
}
```

---

## 🎯 Best Practices

### 1. **Use Descriptive Messages**
```jsx
// ❌ BAD
showError('Error!')

// ✅ GOOD
showError('Failed to save employee: Name is required')
```

### 2. **Include Context**
```jsx
// ❌ BAD
showSuccess('Saved')

// ✅ GOOD
showSuccess(`✓ ${employeeName} has been assigned to ${clientName}`)
```

### 3. **Choose the Right Type**
- **Success** (green): Completed actions, successful saves
- **Error** (red): Failed operations, validation errors
- **Warning** (orange): Cautionary messages, potential issues
- **Info** (blue): Informational messages, status updates

### 4. **Don't Overuse**
Only show toasts for important user actions. Not every button click needs a toast.

```jsx
// ❌ BAD - too many toasts
function handleClick() {
  showInfo('Button clicked')
  showInfo('Processing...')
  showInfo('Almost done...')
  showSuccess('Done!')
}

// ✅ GOOD - only show the outcome
function handleClick() {
  await process()
  showSuccess('Processing complete!')
}
```

---

## 📦 Files Modified in Standardization

### ✅ Updated Components:
1. **`/components/AssignEmployeeModal.js`**
   - Replaced `alert()` with `useToast` hook
   - Shows success toast on assignment
   - Shows error toast on failure

2. **`/components/ClientTeamManager.js`**
   - Replaced `alert()` and `confirm()` with Toast + ConfirmationModal
   - Shows success/error toasts for assign/remove operations

3. **`/app/clients/[id]/page.js`**
   - Replaced validation `alert()` with inline error message
   - Already uses Toast for success/error (kept consistent)

4. **`/app/clients/page.js`**
   - Replaced "Add Client" `alert()` with info toast

### ✅ New Files:
- **`/utils/useToast.js`** - Reusable toast hook
- **`TOAST_STANDARDIZATION_GUIDE.md`** - This documentation

---

## 🔍 Confirmation Modals

For actions that need user confirmation (like deleting), use `ConfirmationModal` instead of browser `confirm()`:

```jsx
import ConfirmationModal from '../components/ConfirmationModal'

function DeleteButton({ employeeName }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const { showSuccess, showError, ToastComponent } = useToast()
  
  async function handleDelete() {
    try {
      await deleteEmployee(employeeId)
      showSuccess(`✓ ${employeeName} has been deleted`)
      setShowConfirm(false)
    } catch (error) {
      showError(`Failed to delete: ${error.message}`)
    }
  }
  
  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete</button>
      
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Employee?"
        message={`Are you sure you want to delete ${employeeName}?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      
      <ToastComponent />
    </>
  )
}
```

---

## 🎨 Customizing Toast Appearance

To customize toast styling, edit `/components/Toast.js`:

```javascript
const types = {
  success: {
    icon: <CheckCircle size={20} />,
    bg: '#10b981', // Change colors here
    iconBg: 'rgba(255, 255, 255, 0.2)'
  },
  error: {
    icon: <AlertCircle size={20} />,
    bg: '#ef4444',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  },
  // ... etc
}
```

---

## 🐛 Troubleshooting

### Toast Not Showing?
- Make sure you're rendering `<ToastComponent />` in your JSX
- Check that `toast.show` is `true`
- Verify the toast isn't appearing off-screen (check CSS positioning)

### Toast Disappears Too Fast?
```jsx
// Increase duration (in milliseconds)
showToast('Message', 'success', 10000) // 10 seconds
```

### Multiple Toasts?
Currently, only one toast shows at a time. If you need multiple toasts, consider creating a toast queue system.

---

## 📚 Related Documentation

- [Toast Component Implementation](/components/Toast.js)
- [useToast Hook](/utils/useToast.js)
- [ConfirmationModal Guide](/REMOVE_EMPLOYEE_GUIDE.md)

---

## ✨ Summary

**Key Changes:**
- ❌ No more `alert()` - Use toast notifications
- ❌ No more `confirm()` - Use `ConfirmationModal`
- ✅ Consistent UX across the app
- ✅ Non-blocking, modern notifications
- ✅ Easy to use with `useToast` hook

**Remember:**
- Import: `import { useToast } from '../utils/useToast'`
- Destructure: `const { showSuccess, showError, ToastComponent } = useToast()`
- Render: `<ToastComponent />`
- Show: `showSuccess('Your message here')`

Happy coding! 🎉

