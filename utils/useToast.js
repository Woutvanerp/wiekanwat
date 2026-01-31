/**
 * Custom React Hook for Toast Notifications
 * 
 * Provides a simple, reusable way to show toast notifications across your app.
 * 
 * Usage Example:
 * ```jsx
 * import { useToast } from '../utils/useToast'
 * 
 * function MyComponent() {
 *   const { toast, showToast, ToastComponent } = useToast()
 *   
 *   function handleSuccess() {
 *     showToast('Operation successful!', 'success')
 *   }
 *   
 *   function handleError() {
 *     showToast('Something went wrong', 'error')
 *   }
 *   
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>Success</button>
 *       <button onClick={handleError}>Error</button>
 *       <ToastComponent />
 *     </div>
 *   )
 * }
 * ```
 */

'use client'

import { useState } from 'react'
import Toast from '../components/Toast'

/**
 * Custom hook for managing toast notifications
 * 
 * @returns {Object} Toast utilities
 * @returns {Object} return.toast - Current toast state
 * @returns {Function} return.showToast - Function to show a toast
 * @returns {Function} return.showSuccess - Shorthand for success toast
 * @returns {Function} return.showError - Shorthand for error toast
 * @returns {Function} return.showInfo - Shorthand for info toast
 * @returns {Function} return.showWarning - Shorthand for warning toast
 * @returns {Function} return.hideToast - Function to hide the toast
 * @returns {Component} return.ToastComponent - Toast component to render
 */
export function useToast() {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    duration: 4000
  })

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type: 'success' | 'error' | 'info' | 'warning'
   * @param {number} duration - Duration in ms (default: 4000)
   */
  function showToast(message, type = 'success', duration = 4000) {
    setToast({
      show: true,
      message,
      type,
      duration
    })
  }

  /**
   * Show a success toast
   * @param {string} message - Success message
   */
  function showSuccess(message) {
    showToast(message, 'success')
  }

  /**
   * Show an error toast
   * @param {string} message - Error message
   */
  function showError(message) {
    showToast(message, 'error')
  }

  /**
   * Show an info toast
   * @param {string} message - Info message
   */
  function showInfo(message) {
    showToast(message, 'info')
  }

  /**
   * Show a warning toast
   * @param {string} message - Warning message
   */
  function showWarning(message) {
    showToast(message, 'warning')
  }

  /**
   * Hide the current toast
   */
  function hideToast() {
    setToast(prev => ({ ...prev, show: false }))
  }

  /**
   * Toast component - render this in your JSX
   */
  function ToastComponent() {
    if (!toast.show) return null

    return (
      <Toast
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
        isVisible={toast.show}
      />
    )
  }

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideToast,
    ToastComponent
  }
}

// Export default for convenience
export default useToast

