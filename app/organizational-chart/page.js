'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { fetchEmployees } from '../../utils/api'
import { locations, hierarchyOrder, hierarchyLabels, getAllSkills, getAllClients } from '../../data/mockData'
import EmployeeCard from '../../components/EmployeeCard'
import Filters from '../../components/Filters'
import { hierarchyLevels } from '../../data/mockData'
import '../home.css'

export default function OrganizationalChart() {
  const router = useRouter()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    location: '',
    hierarchy: '',
    skill: '',
    client: '',
  })

  // Fetch employees from API on mount and when page regains focus
  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchEmployees()
        setEmployees(data || [])
      } catch (err) {
        console.error('Failed to load employees:', err)
        setError(err.message || 'Failed to load employees')
        // Set empty array on error so UI can still render
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    
    loadEmployees()

    // Refresh when page regains focus (e.g., navigating back from add/edit page)
    // Only add listener if window is available (client-side)
    if (typeof window !== 'undefined') {
      const handleFocus = () => {
        loadEmployees()
      }
      
      window.addEventListener('focus', handleFocus)
      return () => window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Get unique skills and clients from current employees
  const skills = useMemo(() => getAllSkills(employees), [employees])
  const clients = useMemo(() => getAllClients(employees), [employees])

  // Group employees by location, then by hierarchy
  // Simple, readable structure - no complex tree logic
  const employeesByLocationAndHierarchy = useMemo(() => {
    const grouped = {}
    const safeEmployees = Array.isArray(employees) ? employees : []
    
    locations.forEach(location => {
      grouped[location] = {}
      hierarchyOrder.forEach(level => {
        grouped[location][level] = safeEmployees.filter(emp => 
          emp && emp.location === location && emp.hierarchy === level
        )
      })
    })
    
    return grouped
  }, [employees])

  // Check if an employee matches the current filters
  const employeeMatchesFilters = useMemo(() => {
    return (employee) => {
      if (filters.location && employee.location !== filters.location) {
        return false
      }
      
      if (filters.hierarchy && employee.hierarchy !== filters.hierarchy) {
        return false
      }
      
      if (filters.skill && !employee.skills.includes(filters.skill)) {
        return false
      }
      
      if (filters.client) {
        if (filters.client === 'available' && employee.currentClient !== null) {
          return false
        }
        if (filters.client !== 'available' && employee.currentClient !== filters.client) {
          return false
        }
      }
      
      return true
    }
  }, [filters])

  // Count matching employees for display
  const matchingCount = useMemo(() => {
    const safeEmployees = Array.isArray(employees) ? employees : []
    return safeEmployees.filter(employeeMatchesFilters).length
  }, [employees, employeeMatchesFilters])

  // Check if any filters are active
  const hasActiveFilters = filters.location || filters.hierarchy || filters.skill || filters.client

  // Refresh employees list (useful after add/edit/delete operations)
  const refreshEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchEmployees()
      setEmployees(data)
    } catch (err) {
      console.error('Failed to refresh employees:', err)
      setError(err.message || 'Failed to refresh employees')
    } finally {
      setLoading(false)
    }
  }

  // Ensure employees is always an array to prevent errors
  const safeEmployees = Array.isArray(employees) ? employees : []
  const safeSkills = Array.isArray(skills) ? skills : []
  const safeClients = Array.isArray(clients) ? clients : []

  return (
    <div className="home-container">
      {/* Page Title */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        marginBottom: '0'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: 'var(--primary)',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Personen
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            margin: 0,
            fontWeight: 300
          }}>
            Alle medewerkers met filters
          </p>
        </div>
      </div>

      {/* Filters at the top */}
      <div className="filters-container">
        <Filters
          locations={locations}
          hierarchyLevels={hierarchyLevels}
          skills={safeSkills}
          clients={safeClients}
          filters={filters}
          onFilterChange={setFilters}
        />
        {hasActiveFilters && (
          <div className="matching-info">
            {matchingCount} van {safeEmployees.length} personen voldoen aan filters
          </div>
        )}
      </div>

      <main className="home-main">
        {/* Add Person Button */}
        <div className="add-person-section">
          <button 
            onClick={() => router.push('/add')}
            className="add-person-btn"
          >
            + Persoon Toevoegen
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="empty-state">
            <h2>Laden...</h2>
            <p>Medewerkers ophalen uit database</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="empty-state">
            <h2>Fout bij laden medewerkers</h2>
            <p>{error}</p>
            <button onClick={refreshEmployees} className="add-person-btn" style={{ marginTop: '1rem' }}>
              Opnieuw Proberen
            </button>
          </div>
        )}

        {/* Display employees grouped by Location → Hierarchy */}
        {!loading && !error && safeEmployees.length === 0 ? (
          <div className="empty-state">
            <h2>Nog geen personen toegevoegd</h2>
            <p>Klik op "Persoon Toevoegen" om te beginnen</p>
          </div>
        ) : !loading && !error && (
          <section className="employees-section">
            {locations.map(location => {
              const locationEmployees = employeesByLocationAndHierarchy[location] || {}
              const hasLocationEmployees = hierarchyOrder.some(
                level => locationEmployees[level].length > 0
              )
              
              if (!hasLocationEmployees) return null

              return (
                <div key={location} className="location-group">
                  <h2 className="location-header">{location}</h2>
                  
                  {hierarchyOrder.map(level => {
                    const levelEmployees = locationEmployees[level]
                    if (levelEmployees.length === 0) return null

                    return (
                      <div key={level} className="hierarchy-group">
                        <h3 className="hierarchy-header">
                          {hierarchyLabels[level]}
                          <span className="count-badge">{levelEmployees.length}</span>
                        </h3>
                        
                        <div className="employees-grid">
                          {levelEmployees.map(employee => {
                            const matches = employeeMatchesFilters(employee)
                            return (
                              <EmployeeCard
                                key={employee.id}
                                employee={employee}
                                isDimmed={hasActiveFilters && !matches}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}

