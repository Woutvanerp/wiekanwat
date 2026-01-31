'use client'

import { useState, useEffect } from 'react'
import { X, User } from 'lucide-react'
import { locations, hierarchyLevels } from '../data/mockData'

export default function EditEmployeeModal({ isOpen, onClose, onSubmit, loading, employee }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    hierarchy: '',
    skills: '',
    currentClient: '',
    cvSummary: '',
    profilePicture: '',
    projectStartDate: '',
  })
  const [validationError, setValidationError] = useState('')

  // Populate form with employee data when modal opens
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        name: employee.name || '',
        location: employee.location || '',
        hierarchy: employee.hierarchy || '',
        skills: Array.isArray(employee.skills) ? employee.skills.join(', ') : '',
        currentClient: employee.currentClient || '',
        cvSummary: employee.cvSummary || '',
        profilePicture: employee.profilePicture || '',
        projectStartDate: employee.projectStartDate || '',
      })
    }
  }, [employee, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setValidationError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      setValidationError('Naam is verplicht')
      return
    }
    if (!formData.location) {
      setValidationError('Locatie is verplicht')
      return
    }
    if (!formData.hierarchy) {
      setValidationError('Hiërarchieniveau is verplicht')
      return
    }

    // Parse skills from comma-separated string
    const skillsArray = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const updatedData = {
      name: formData.name.trim(),
      location: formData.location,
      hierarchy: formData.hierarchy,
      skills: skillsArray,
      currentClient: formData.currentClient.trim() || null,
      cvSummary: formData.cvSummary.trim() || null,
      profilePicture: formData.profilePicture.trim() || null,
      projectStartDate: formData.projectStartDate || null,
    }

    setValidationError('')
    onSubmit(updatedData)
  }

  const handleClose = () => {
    if (!loading) {
      setValidationError('')
      onClose()
    }
  }

  if (!isOpen) return null

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
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid rgba(0, 0, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--secondary-yellow), var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h3 style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: 'var(--primary)',
              margin: 0
            }}>
              Medewerker Bewerken
            </h3>
          </div>
          
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: 'transparent',
              color: '#666',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                e.currentTarget.style.color = '#333'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#666'
              }
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Validation Error */}
          {validationError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontWeight: 600 }}>⚠</span>
              {validationError}
            </div>
          )}

          {/* Two Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* Name - Required */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Naam <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Volledige naam"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'}
              />
            </div>

            {/* Location - Required */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Locatie <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Selecteer locatie</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Hierarchy - Required */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Hiërarchieniveau <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="hierarchy"
                value={formData.hierarchy}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Selecteer niveau</option>
                {hierarchyLevels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Skills - Optional */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Vaardigheden
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Gescheiden door komma's (bijv. React, TypeScript, Node.js)"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'}
              />
              <small style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', display: 'block' }}>
                Scheid meerdere vaardigheden met komma's
              </small>
            </div>

            {/* Current Client - Optional */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Huidige Klant
              </label>
              <input
                type="text"
                name="currentClient"
                value={formData.currentClient}
                onChange={handleChange}
                placeholder="Laat leeg indien beschikbaar"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'}
              />
            </div>

            {/* Project Start Date - Optional */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Project Startdatum
              </label>
              <input
                type="date"
                name="projectStartDate"
                value={formData.projectStartDate}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'}
              />
            </div>

            {/* Profile Picture URL - Optional */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Profielfoto URL
              </label>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="https://voorbeeld.nl/profiel.jpg"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'}
              />
            </div>

            {/* CV Summary - Optional */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                CV Samenvatting
              </label>
              <textarea
                name="cvSummary"
                value={formData.cvSummary}
                onChange={handleChange}
                placeholder="Korte samenvatting van ervaring en achtergrond"
                rows="4"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
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
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
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
                boxShadow: '0 2px 8px rgba(0, 0, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = '0.9'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {loading ? 'Opslaan...' : 'Wijzigingen Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

