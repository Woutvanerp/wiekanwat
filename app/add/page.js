'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployee } from '../../utils/api'
import { locations, hierarchyLevels } from '../../data/mockData'
import './add.css'

export default function AddPerson() {
  const router = useRouter()
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Parse skills from comma-separated string
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      // Create employee object (frontend format)
      const employee = {
        name: formData.name.trim(),
        location: formData.location,
        hierarchy: formData.hierarchy,
        skills: skillsArray,
        currentClient: formData.currentClient.trim() || null,
        cvSummary: formData.cvSummary.trim() || null,
        profilePicture: formData.profilePicture.trim() || null,
        projectStartDate: formData.projectStartDate || null,
      }

      // Validate required fields
      if (!employee.name || !employee.location || !employee.hierarchy) {
        setError('Vul alle verplichte velden in (Naam, Locatie, Hiërarchie)')
        setIsSubmitting(false)
        return
      }

      // Create employee via API
      await createEmployee(employee)

      // Redirect to home on success
      router.push('/')
    } catch (err) {
      console.error('Failed to create employee:', err)
      setError(err.message || 'Fout bij aanmaken medewerker. Probeer het opnieuw.')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <div className="add-page-container">
      <main className="add-page-main" style={{ paddingTop: '2rem' }}>
        {/* Page Title */}
        <div style={{ 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: 'var(--primary)',
            margin: 0,
            marginBottom: '0.5rem'
          }}>
            Persoon Toevoegen
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            margin: 0,
            fontWeight: 300
          }}>
            Voeg een nieuwe persoon toe aan de planningsapplicatie
          </p>
        </div>
        {error && (
          <div className="error-message" style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="add-person-form">
          {/* Name - Required */}
          <div className="form-group">
            <label htmlFor="name">
              Naam <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Volledige naam"
              className="form-input"
            />
          </div>

          {/* Location - Required */}
          <div className="form-group">
            <label htmlFor="location">
              Locatie <span className="required">*</span>
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="form-select"
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
          <div className="form-group">
            <label htmlFor="hierarchy">
              Hiërarchieniveau <span className="required">*</span>
            </label>
            <select
              id="hierarchy"
              name="hierarchy"
              value={formData.hierarchy}
              onChange={handleChange}
              required
              className="form-select"
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
          <div className="form-group">
            <label htmlFor="skills">
              Vaardigheden
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Gescheiden door komma's (bijv. React, TypeScript, Node.js)"
              className="form-input"
            />
            <small className="form-hint">
              Scheid meerdere vaardigheden met komma's
            </small>
          </div>

          {/* Current Client - Optional */}
          <div className="form-group">
            <label htmlFor="currentClient">
              Huidige Klant
            </label>
            <input
              type="text"
              id="currentClient"
              name="currentClient"
              value={formData.currentClient}
              onChange={handleChange}
              placeholder="Laat leeg indien beschikbaar"
              className="form-input"
            />
          </div>

          {/* Project Start Date - Optional */}
          <div className="form-group">
            <label htmlFor="projectStartDate">
              Project Startdatum
            </label>
            <input
              type="date"
              id="projectStartDate"
              name="projectStartDate"
              value={formData.projectStartDate}
              onChange={handleChange}
              className="form-input"
            />
            <small className="form-hint">
              Wanneer is deze project/klanttoewijzing gestart?
            </small>
          </div>

          {/* Profile Picture URL - Optional */}
          <div className="form-group">
            <label htmlFor="profilePicture">
              Profielfoto URL
            </label>
            <input
              type="url"
              id="profilePicture"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="https://voorbeeld.nl/profiel.jpg"
              className="form-input"
            />
            <small className="form-hint">
              URL naar de profielfoto van de medewerker
            </small>
          </div>

          {/* CV Summary - Optional */}
          <div className="form-group">
            <label htmlFor="cvSummary">
              CV Samenvatting
            </label>
            <textarea
              id="cvSummary"
              name="cvSummary"
              value={formData.cvSummary}
              onChange={handleChange}
              placeholder="Korte samenvatting van ervaring en achtergrond"
              rows="4"
              className="form-textarea"
            />
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Toevoegen...' : 'Persoon Toevoegen'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

