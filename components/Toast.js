'use client'

import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

/**
 * Toast notification component
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type: "success" | "error" | "info" | "warning"
 * @param {number} props.duration - Auto-dismiss duration in ms (default: 3000)
 * @param {Function} props.onClose - Callback when toast is dismissed
 * @param {boolean} props.isVisible - Whether toast is visible
 */
export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  isVisible = true
}) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  // Toast configurations
  const types = {
    success: {
      icon: <CheckCircle size={20} />,
      bg: '#10b981',
      iconBg: 'rgba(255, 255, 255, 0.2)'
    },
    error: {
      icon: <AlertCircle size={20} />,
      bg: '#ef4444',
      iconBg: 'rgba(255, 255, 255, 0.2)'
    },
    warning: {
      icon: <AlertCircle size={20} />,
      bg: '#f59e0b',
      iconBg: 'rgba(255, 255, 255, 0.2)'
    },
    info: {
      icon: <Info size={20} />,
      bg: '#3b82f6',
      iconBg: 'rgba(255, 255, 255, 0.2)'
    }
  }

  const currentType = types[type] || types.success

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        zIndex: 9999,
        animation: 'slideInRight 0.3s ease',
        maxWidth: '400px'
      }}
    >
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100px);
          }
        }
      `}</style>

      <div
        style={{
          backgroundColor: currentType.bg,
          color: 'white',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '300px'
        }}
      >
        {/* Icon */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: currentType.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {currentType.icon}
        </div>

        {/* Message */}
        <div style={{
          flex: 1,
          fontSize: '0.95rem',
          fontWeight: 500,
          lineHeight: '1.5'
        }}>
          {message}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}


