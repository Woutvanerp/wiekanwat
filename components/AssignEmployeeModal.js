'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { fetchEmployees } from '../utils/api'
import {
  assignEmployeeToClient,
  updateClientEmployeeCount,
  getEmployeesByClient
} from '../utils/employeeClientRelations'

/**
 * Modal component for assigning an employee to a client
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {number} props.clientId - The client ID to assign employees to
 * @param {string} props.clientName - The client name for display
 * @param {Function} props.onSuccess - Callback after successful assignment
 */
export default function AssignEmployeeModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  onSuccess
}) {
  // Form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  
  // UI state
  const [availableEmployees, setAvailableEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingEmployees, setFetchingEmployees] = useState(true)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch available employees when modal opens
  useEffect(() => {
    if (isOpen && clientId) {
      loadAvailableEmployees()
    }
  }, [isOpen, clientId])

  /**
   * Load all employees and filter out those already assigned
   */
  async function loadAvailableEmployees() {
    try {
      setFetchingEmployees(true)
      
      // Fetch all employees
      const allEmployees = await fetchEmployees()
      
      // Fetch employees already assigned to this client
      const { data: assignedEmployees } = await getEmployeesByClient(clientId)
      
      // Create a set of assigned employee IDs for fast lookup
      const assignedIds = new Set(
        (assignedEmployees || []).map(emp => emp.id)
      )
      
      // Filter out already assigned employees
      const available = allEmployees.filter(emp => !assignedIds.has(emp.id))
      
      setAvailableEmployees(available)
    } catch (error) {
      console.error('Error loading employees:', error)
      setErrors({ fetch: 'Failed to load employees. Please try again.' })
    } finally {
      setFetchingEmployees(false)
    }
  }

  /**
   * Validate form inputs
   */
  function validateForm() {
    const newErrors = {}

    // Employee selection is required
    if (!selectedEmployeeId) {
      newErrors.employee = 'Please select an employee'
    }

    // Project name is required
    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required'
    }

    // Start date is required
    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    } else {
      // Start date cannot be in the future
      const selectedDate = new Date(startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      selectedDate.setHours(0, 0, 0, 0)
      
      if (selectedDate > today) {
        newErrors.startDate = 'Start date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setErrors({})

      // Assign employee to client
      const { data, error } = await assignEmployeeToClient(
        selectedEmployeeId,
        clientId,
        projectName.trim(),
        startDate
      )

      if (error) {
        throw error
      }

      // Update client employee count (though this is done automatically in assignEmployeeToClient)
      await updateClientEmployeeCount(clientId)

      // Show success message
      const selectedEmployee = availableEmployees.find(emp => emp.id === selectedEmployeeId)
      showSuccessMessage(selectedEmployee?.name || 'Employee')

      // Reset form
      resetForm()

      // Call success callback and close modal
      if (onSuccess) {
        onSuccess()
      }
      onClose()

    } catch (error) {
      console.error('Error assigning employee:', error)
      setErrors({ 
        submit: error.message || 'Failed to assign employee. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Show success message (simple alert, can be replaced with toast)
   */
  function showSuccessMessage(employeeName) {
    alert(`✓ ${employeeName} has been successfully assigned to ${clientName}!`)
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    setSelectedEmployeeId('')
    setProjectName('')
    setStartDate(new Date().toISOString().split('T')[0])
    setErrors({})
    setSearchTerm('')
  }

  /**
   * Handle modal close
   */
  function handleClose() {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  /**
   * Filter employees based on search term
   */
  const filteredEmployees = availableEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.hierarchy.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Don't render if modal is not open
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={handleClose}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '550px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideIn 0.3s ease',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--primary)',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              Assign Employee
            </h2>
            <p style={{
              fontSize: '0.9rem',
              color: '#666',
              margin: 0
            }}>
              Add a team member to {clientName}
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
              color: '#666',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Fetch Error */}
        {errors.fetch && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            {errors.fetch}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Employee Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Select Employee *
            </label>

            {fetchingEmployees ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: '#666',
                fontSize: '0.9rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                Loading employees...
              </div>
            ) : availableEmployees.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: '#999',
                fontSize: '0.9rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px dashed #d1d5db'
              }}>
                All employees are already assigned to this client
              </div>
            ) : (
              <>
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    marginBottom: '0.75rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'}
                />

                {/* Employee Dropdown */}
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value)
                    setErrors({ ...errors, employee: null })
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.employee ? '1px solid #dc2626' : '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.employee) {
                      e.currentTarget.style.borderColor = 'var(--primary)'
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.employee) {
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                    }
                  }}
                >
                  <option value="">Choose an employee...</option>
                  {filteredEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.hierarchy} ({emp.location})
                    </option>
                  ))}
                </select>
              </>
            )}

            {errors.employee && (
              <p style={{
                color: '#dc2626',
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                margin: '0.5rem 0 0 0'
              }}>
                {errors.employee}
              </p>
            )}

            {filteredEmployees.length === 0 && searchTerm && !fetchingEmployees && availableEmployees.length > 0 && (
              <p style={{
                color: '#999',
                fontSize: '0.85rem',
                marginTop: '0.5rem'
              }}>
                No employees found matching "{searchTerm}"
              </p>
            )}
          </div>

          {/* Project Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value)
                setErrors({ ...errors, projectName: null })
              }}
              placeholder="e.g., Cloud Migration Project"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.projectName ? '1px solid #dc2626' : '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                if (!errors.projectName) {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }
              }}
              onBlur={(e) => {
                if (!errors.projectName) {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                }
              }}
            />
            {errors.projectName && (
              <p style={{
                color: '#dc2626',
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                margin: '0.5rem 0 0 0'
              }}>
                {errors.projectName}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setErrors({ ...errors, startDate: null })
              }}
              max={new Date().toISOString().split('T')[0]}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.startDate ? '1px solid #dc2626' : '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                if (!errors.startDate) {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }
              }}
              onBlur={(e) => {
                if (!errors.startDate) {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                }
              }}
            />
            {errors.startDate && (
              <p style={{
                color: '#dc2626',
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                margin: '0.5rem 0 0 0'
              }}>
                {errors.startDate}
              </p>
            )}
            <p style={{
              color: '#999',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              margin: '0.5rem 0 0 0'
            }}>
              Start date cannot be in the future
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.9rem',
              marginBottom: '1.5rem'
            }}>
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#e5e7eb'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingEmployees || availableEmployees.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: (loading || fetchingEmployees || availableEmployees.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (loading || fetchingEmployees || availableEmployees.length === 0) ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading && !fetchingEmployees && availableEmployees.length > 0) {
                  e.currentTarget.style.opacity = '0.9'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !fetchingEmployees && availableEmployees.length > 0) {
                  e.currentTarget.style.opacity = '1'
                }
              }}
            >
              {loading ? 'Assigning...' : 'Assign to Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


