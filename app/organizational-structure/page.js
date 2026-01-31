'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchEmployees } from '../../utils/api'
import { locations, hierarchyOrder, hierarchyLabels } from '../../data/mockData'
import { Users, MapPin, ChevronRight, Building2 } from 'lucide-react'
import Link from 'next/link'
import '../home.css'

export default function OrganizationalStructure() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('all')

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
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    
    loadEmployees()
  }, [])

  // Group employees by location and hierarchy
  const organizationalTree = useMemo(() => {
    const tree = {}
    const safeEmployees = Array.isArray(employees) ? employees : []
    
    locations.forEach(location => {
      tree[location] = {}
      hierarchyOrder.forEach(hierarchy => {
        tree[location][hierarchy] = safeEmployees.filter(
          emp => emp.location === location && emp.hierarchy === hierarchy
        )
      })
    })
    
    return tree
  }, [employees])

  // Filter locations based on selection
  const displayLocations = selectedLocation === 'all' ? locations : [selectedLocation]

  // Calculate total employees per location
  const locationCounts = useMemo(() => {
    const counts = {}
    locations.forEach(location => {
      counts[location] = employees.filter(emp => emp.location === location).length
    })
    return counts
  }, [employees])

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
            Organisatiestructuur
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            margin: 0,
            fontWeight: 300
          }}>
            Hiërarchische weergave van de organisatie per locatie
          </p>
        </div>
      </div>

      {/* Location Filter */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Locatie:
            </span>
            <button
              onClick={() => setSelectedLocation('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: selectedLocation === 'all' ? '2px solid var(--primary)' : '1px solid #ddd',
                backgroundColor: selectedLocation === 'all' ? 'var(--primary)' : 'white',
                color: selectedLocation === 'all' ? 'white' : '#333',
                fontWeight: selectedLocation === 'all' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Alle Locaties
            </button>
            {locations.map(location => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: selectedLocation === location ? '2px solid var(--primary)' : '1px solid #ddd',
                  backgroundColor: selectedLocation === location ? 'var(--primary)' : 'white',
                  color: selectedLocation === location ? 'white' : '#333',
                  fontWeight: selectedLocation === location ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <MapPin style={{ width: '16px', height: '16px' }} />
                {location}
                <span style={{
                  backgroundColor: selectedLocation === location ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,255,0.1)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {locationCounts[location] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="home-main">
        {/* Loading state */}
        {loading && (
          <div className="empty-state">
            <h2>Laden...</h2>
            <p>Organisatiestructuur ophalen uit database</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="empty-state">
            <h2>Fout bij laden</h2>
            <p>{error}</p>
          </div>
        )}

        {/* Organizational Tree */}
        {!loading && !error && (
          <section className="employees-section">
            {employees.length === 0 ? (
              <div className="empty-state">
                <h2>Nog geen personen toegevoegd</h2>
                <p>Voeg medewerkers toe om de organisatiestructuur te zien</p>
              </div>
            ) : (
              displayLocations.map(location => {
                const locationTree = organizationalTree[location]
                const hasEmployees = hierarchyOrder.some(
                  hierarchy => locationTree[hierarchy].length > 0
                )
                
                if (!hasEmployees) return null

                return (
                  <div key={location} style={{
                    marginBottom: '3rem',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 255, 0.1)'
                  }}>
                    {/* Location Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '2rem',
                      paddingBottom: '1rem',
                      borderBottom: '2px solid rgba(0, 0, 255, 0.1)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary-blue))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 255, 0.2)'
                      }}>
                        <Building2 style={{ width: '24px', height: '24px', color: 'white' }} />
                      </div>
                      <div>
                        <h2 style={{
                          fontSize: '1.75rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          margin: 0,
                          marginBottom: '0.25rem'
                        }}>
                          {location}
                        </h2>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          margin: 0
                        }}>
                          {locationCounts[location]} {locationCounts[location] === 1 ? 'medewerker' : 'medewerkers'}
                        </p>
                      </div>
                    </div>

                    {/* Hierarchy Tree */}
                    <div style={{
                      paddingLeft: '2rem'
                    }}>
                      {hierarchyOrder.map((hierarchy, hierarchyIndex) => {
                        const employeesInLevel = locationTree[hierarchy]
                        if (employeesInLevel.length === 0) return null

                        const isLastLevel = hierarchyIndex === hierarchyOrder.length - 1
                        const nextLevelHasEmployees = !isLastLevel && 
                          hierarchyOrder.slice(hierarchyIndex + 1).some(h => locationTree[h].length > 0)

                        return (
                          <div key={hierarchy} style={{
                            position: 'relative',
                            marginBottom: nextLevelHasEmployees ? '2rem' : '0'
                          }}>
                            {/* Vertical Line to Next Level */}
                            {nextLevelHasEmployees && (
                              <div style={{
                                position: 'absolute',
                                left: '16px',
                                top: '48px',
                                bottom: '-32px',
                                width: '2px',
                                backgroundColor: 'rgba(0, 0, 255, 0.15)'
                              }} />
                            )}

                            {/* Hierarchy Level Header */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginBottom: '1rem'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0, 0, 255, 0.2)',
                                zIndex: 1
                              }}>
                                <Users style={{ width: '18px', height: '18px', color: 'white' }} />
                              </div>
                              <div>
                                <h3 style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 600,
                                  color: '#333',
                                  margin: 0,
                                  marginBottom: '0.15rem'
                                }}>
                                  {hierarchyLabels[hierarchy]}
                                </h3>
                                <span style={{
                                  fontSize: '0.85rem',
                                  color: '#666',
                                  fontWeight: 500
                                }}>
                                  {employeesInLevel.length} {employeesInLevel.length === 1 ? 'persoon' : 'personen'}
                                </span>
                              </div>
                            </div>

                            {/* Employee Cards */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                              gap: '1rem',
                              marginLeft: '3rem',
                              marginBottom: '1.5rem'
                            }}>
                              {employeesInLevel.map((employee, empIndex) => (
                                <Link
                                  key={employee.id}
                                  href={`/employee/${employee.id}`}
                                  style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                  <div style={{
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid rgba(0, 0, 255, 0.1)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    position: 'relative'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 255, 0.15)'
                                    e.currentTarget.style.borderColor = 'var(--primary)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = 'none'
                                    e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.1)'
                                  }}
                                  >
                                    {/* Connection Line to Parent */}
                                    <div style={{
                                      position: 'absolute',
                                      left: '-3rem',
                                      top: '50%',
                                      width: '3rem',
                                      height: '2px',
                                      backgroundColor: 'rgba(0, 0, 255, 0.15)'
                                    }} />
                                    
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.75rem',
                                      marginBottom: '0.75rem'
                                    }}>
                                      {/* Avatar */}
                                      <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--primary)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '1.25rem',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                      }}>
                                        {employee.profilePicture ? (
                                          <img 
                                            src={employee.profilePicture} 
                                            alt={employee.name}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                              e.target.style.display = 'none'
                                              e.target.parentElement.textContent = employee.name.charAt(0).toUpperCase()
                                            }}
                                          />
                                        ) : (
                                          employee.name.charAt(0).toUpperCase()
                                        )}
                                      </div>
                                      
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{
                                          fontSize: '1rem',
                                          fontWeight: 600,
                                          color: '#333',
                                          margin: 0,
                                          marginBottom: '0.25rem',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}>
                                          {employee.name}
                                        </h4>
                                        {employee.currentClient && (
                                          <div style={{
                                            fontSize: '0.8rem',
                                            color: '#666',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem'
                                          }}>
                                            <ChevronRight style={{ width: '12px', height: '12px' }} />
                                            {employee.currentClient}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Skills */}
                                    {employee.skills && employee.skills.length > 0 && (
                                      <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.35rem'
                                      }}>
                                        {employee.skills.slice(0, 2).map((skill, idx) => (
                                          <span
                                            key={idx}
                                            style={{
                                              fontSize: '0.7rem',
                                              padding: '0.25rem 0.5rem',
                                              backgroundColor: 'rgba(0, 0, 255, 0.08)',
                                              color: 'var(--primary)',
                                              borderRadius: '4px',
                                              fontWeight: 500
                                            }}
                                          >
                                            {skill}
                                          </span>
                                        ))}
                                        {employee.skills.length > 2 && (
                                          <span style={{
                                            fontSize: '0.7rem',
                                            padding: '0.25rem 0.5rem',
                                            color: '#666',
                                            fontWeight: 500
                                          }}>
                                            +{employee.skills.length - 2}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </section>
        )}
      </main>
    </div>
  )
}


