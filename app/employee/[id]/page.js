'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchEmployeeById } from '../../../utils/api'
import EmployeeProfile from '../../../components/EmployeeProfile'

/**
 * Employee Profile Page
 * 
 * Displays detailed information about a single employee including:
 * - Name and hierarchy level
 * - Location (Eindhoven / Maastricht)
 * - Current client status (or "Available")
 * - Skills displayed as tags with proficiency levels
 * - CV summary text
 * - Client timeline with past projects
 * 
 * Data Source: Fetches from GET /api/employees/[id] via fetchEmployeeById utility
 * Route: /employee/[id] (dynamic route using Next.js App Router)
 */
export default function EmployeeProfilePage({ params }) {
  // In client components, params is already a plain object
  const { id } = params || {}
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch employee data from API on component mount
  useEffect(() => {
    // Guard against missing id
    if (!id) {
      setError('Invalid employee ID')
      setLoading(false)
      return
    }

    async function loadEmployee() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch employee data from API route /api/employees/[id]
        // The fetchEmployeeById utility handles the API call and data transformation
        const data = await fetchEmployeeById(id)
        
        if (!data) {
          setError('Employee not found')
        } else {
          setEmployee(data)
        }
      } catch (err) {
        console.error('Failed to load employee:', err)
        setError(err.message || 'Failed to load employee')
      } finally {
        setLoading(false)
      }
    }
    
    loadEmployee()
  }, [id])

  // Loading state: Show loading message while fetching data
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <main className="home-main" style={{ 
          padding: '3rem 2rem',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          <div className="empty-state">
            <h2>Laden...</h2>
            <p>Medewerkerinformatie ophalen</p>
          </div>
        </main>
      </div>
    )
  }

  // Error state: Show error message if employee not found or fetch failed
  if (error || !employee) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <main className="home-main" style={{ 
          padding: '3rem 2rem',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          <div className="empty-state">
            <h2>Medewerker Niet Gevonden</h2>
            <p>De medewerker die u zoekt bestaat niet of kon niet worden geladen.</p>
            {error && <p style={{ fontSize: '0.95rem', color: '#999', fontStyle: 'italic', marginTop: '0.5rem' }}>{error}</p>}
            <Link 
              href="/" 
              className="add-person-btn"
              style={{ marginTop: '1.5rem', display: 'inline-block' }}
            >
              ← Terug naar Informatiebord
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return <EmployeeProfile employee={employee} />
}
