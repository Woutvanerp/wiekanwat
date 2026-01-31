/**
 * Example React component showing how to use employee-client relationship utilities
 * This component can be used on a client detail page to manage team assignments
 */

'use client'

import { useState, useEffect } from 'react'
import {
  getEmployeesByClient,
  assignEmployeeToClient,
  removeEmployeeFromClient
} from '../utils/employeeClientRelations'
import { fetchEmployees } from '../utils/api'
import { Users, Plus, X, Calendar, Briefcase, AlertCircle, Loader2 } from 'lucide-react'
import Toast from './Toast'
import ConfirmationModal from './ConfirmationModal'

export default function ClientTeamManager({ clientId, clientName }) {
  const [assignedEmployees, setAssignedEmployees] = useState([])
  const [availableEmployees, setAvailableEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [employeeToRemove, setEmployeeToRemove] = useState(null)

  // Load data
  useEffect(() => {
    loadData()
  }, [clientId])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      // Get employees assigned to this client
      const { data: assigned, error: assignedError } = await getEmployeesByClient(clientId)
      if (assignedError) throw assignedError

      setAssignedEmployees(assigned || [])

      // Get all employees to show available ones
      const allEmployees = await fetchEmployees()
      const assignedIds = new Set((assigned || []).map(e => e.id))
      const available = allEmployees.filter(emp => !assignedIds.has(emp.id))
      setAvailableEmployees(available)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add employee to client
  async function handleAssignEmployee(employeeId, projectName, startDate) {
    try {
      setActionLoading(true)
      const { error } = await assignEmployeeToClient(
        employeeId,
        clientId,
        projectName,
        startDate
      )

      if (error) throw error

      // Reload data
      await loadData()
      setShowAddModal(false)
      
      // Show success toast
      const employee = availableEmployees.find(emp => emp.id === employeeId)
      setToast({
        show: true,
        message: `✓ ${employee?.name || 'Employee'} successfully assigned to ${clientName}!`,
        type: 'success'
      })
    } catch (err) {
      console.error('Error assigning employee:', err)
      setToast({
        show: true,
        message: `Failed to assign employee: ${err.message}`,
        type: 'error'
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Open confirmation modal for removing employee
  function confirmRemoveEmployee(employeeId, employeeName) {
    setEmployeeToRemove({ id: employeeId, name: employeeName })
    setShowConfirmModal(true)
  }

  // Remove employee from client (called after confirmation)
  async function handleRemoveEmployee() {
    if (!employeeToRemove) return

    try {
      setActionLoading(true)
      const { error } = await removeEmployeeFromClient(employeeToRemove.id, clientId)

      if (error) throw error

      // Reload data
      await loadData()
      
      // Show success toast
      setToast({
        show: true,
        message: `✓ ${employeeToRemove.name} successfully removed from ${clientName}!`,
        type: 'success'
      })
      
      // Close modal and reset
      setShowConfirmModal(false)
      setEmployeeToRemove(null)
    } catch (err) {
      console.error('Error removing employee:', err)
      setToast({
        show: true,
        message: `Failed to remove employee: ${err.message}`,
        type: 'error'
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading team members...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
        <p>Error: {error}</p>
        <button onClick={loadData} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--primary)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Users size={24} />
          Team Members ({assignedEmployees.length})
        </h2>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={actionLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            opacity: actionLoading ? 0.6 : 1
          }}
        >
          <Plus size={18} />
          Add Team Member
        </button>
      </div>

      {/* Team Members List */}
      {assignedEmployees.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#999'
        }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No team members assigned yet</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {assignedEmployees.map(employee => (
            <TeamMemberCard
              key={employee.id}
              employee={employee}
              onRemove={() => confirmRemoveEmployee(employee.id, employee.name)}
              disabled={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          availableEmployees={availableEmployees}
          onAssign={handleAssignEmployee}
          onClose={() => setShowAddModal(false)}
          loading={actionLoading}
        />
      )}

      {/* Confirmation Modal for Removing Employee */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setEmployeeToRemove(null)
        }}
        onConfirm={handleRemoveEmployee}
        title="Remove Employee?"
        message={`Are you sure you want to remove ${employeeToRemove?.name || 'this employee'} from ${clientName}? This will mark the assignment as inactive.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        loading={actionLoading}
      />

      {/* Toast Notification */}
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

// Team Member Card Component
function TeamMemberCard({ employee, onRemove, disabled }) {
  return (
    <div style={{
      padding: '1.25rem',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '12px',
      backgroundColor: 'white',
      position: 'relative',
      transition: 'all 0.2s ease'
    }}>
      {/* Remove Button */}
      <button
        onClick={onRemove}
        disabled={disabled}
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          backgroundColor: 'rgba(220, 38, 38, 0.05)',
          color: '#dc2626',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1
        }}
        title="Remove from team"
      >
        <X size={16} />
      </button>

      {/* Employee Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--secondary-lavender)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--primary)',
          flexShrink: 0
        }}>
          {employee.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#333',
            margin: 0,
            marginBottom: '0.25rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {employee.name}
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: '#666',
            margin: 0
          }}>
            {employee.hierarchy}
          </p>
        </div>
      </div>

      {/* Assignment Details */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {employee.projectName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Briefcase size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ color: '#666' }}>{employee.projectName}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Calendar size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ color: '#666' }}>Started {employee.startDate}</span>
        </div>
      </div>
    </div>
  )
}

// Add Employee Modal Component
function AddEmployeeModal({ availableEmployees, onAssign, onClose, loading }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  function handleSubmit(e) {
    e.preventDefault()
    if (!selectedEmployeeId) {
      // Show error via setting an error state instead of alert
      return
    }
    onAssign(selectedEmployeeId, projectName, startDate)
  }

  // Prevent closing during loading
  function handleClose() {
    if (loading) return
    onClose()
  }

  // Handle ESC key
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape' && !loading) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [loading])

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        cursor: loading ? 'not-allowed' : 'default'
      }}
      onClick={loading ? undefined : handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          opacity: loading ? 0.95 : 1,
          transition: 'opacity 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--primary)',
          margin: 0,
          marginBottom: '1.5rem'
        }}>
          Add Team Member
        </h3>

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
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={loading}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              <option value="">Choose an employee...</option>
              {availableEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.hierarchy}
                </option>
              ))}
            </select>
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
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Cloud Migration Project"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'text',
                opacity: loading ? 0.6 : 1
              }}
            />
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
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'text',
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>

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
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                minWidth: '130px'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.opacity = '1'
              }}
            >
              {loading && (
                <Loader2 
                  size={16} 
                  style={{ 
                    animation: 'spin 1s linear infinite'
                  }} 
                />
              )}
              <style jsx>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
              {loading ? 'Adding...' : 'Add to Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


