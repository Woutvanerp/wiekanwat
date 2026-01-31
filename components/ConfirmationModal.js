'use client'

import { AlertCircle, X, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

/**
 * Reusable confirmation modal component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onConfirm - Callback when user confirms
 * @param {string} props.title - Modal title
 * @param {string} props.message - Main message/question
 * @param {string} props.confirmText - Text for confirm button (default: "Confirm")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {string} props.variant - Visual variant: "danger" | "warning" | "info" (default: "danger")
 * @param {boolean} props.loading - Whether confirm action is in progress
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) {
  // Variant configurations
  const variants = {
    danger: {
      icon: <AlertCircle size={48} style={{ color: '#dc2626' }} />,
      iconBg: 'rgba(220, 38, 38, 0.1)',
      confirmBg: '#dc2626',
      confirmHoverBg: '#b91c1c'
    },
    warning: {
      icon: <AlertCircle size={48} style={{ color: '#f59e0b' }} />,
      iconBg: 'rgba(245, 158, 11, 0.1)',
      confirmBg: '#f59e0b',
      confirmHoverBg: '#d97706'
    },
    info: {
      icon: <AlertCircle size={48} style={{ color: '#3b82f6' }} />,
      iconBg: 'rgba(59, 130, 246, 0.1)',
      confirmBg: '#3b82f6',
      confirmHoverBg: '#2563eb'
    }
  }

  const currentVariant = variants[variant] || variants.danger

  /**
   * Handle confirm action
   */
  async function handleConfirm() {
    if (loading) return
    await onConfirm()
  }

  /**
   * Handle close - prevents closing during loading
   */
  function handleClose() {
    if (loading) return // Prevent closing during operation
    onClose()
  }

  /**
   * Handle ESC key press
   */
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape' && !loading) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, loading])

  // Don't render if not open
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
        animation: 'fadeIn 0.2s ease',
        cursor: loading ? 'not-allowed' : 'default'
      }}
      onClick={loading ? undefined : handleClose}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'scaleIn 0.2s ease',
          position: 'relative',
          opacity: loading ? 0.95 : 1,
          transition: 'opacity 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white',
            color: '#666',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.3 : 1,
            pointerEvents: loading ? 'none' : 'auto'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'white'
            }
          }}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: currentVariant.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          {currentVariant.icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#1a1a1a',
          margin: 0,
          marginBottom: '0.75rem',
          textAlign: 'center'
        }}>
          {title}
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '1rem',
          color: '#666',
          lineHeight: '1.6',
          margin: 0,
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
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
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#f3f4f6'
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: currentVariant.confirmBg,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = currentVariant.confirmHoverBg
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = currentVariant.confirmBg
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
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}


