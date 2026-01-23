'use client'

import { useState, useEffect } from 'react'
import { MapPin, ArrowLeft, Calendar, Briefcase, Building2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getClientsByEmployee, getEmployeeHistory } from '../utils/employeeClientRelations'

/**
 * Employee Profile Component
 * 
 * Displays a comprehensive employee profile with:
 * - Header: Name, job title, photo, status badge, location
 * - CV Summary: Professional background
 * - Skills: Technical skills with proficiency levels
 * - Client Timeline: Past client projects in chronological order
 */
export default function EmployeeProfile({ employee }) {
  const [activeClients, setActiveClients] = useState([])
  const [workHistory, setWorkHistory] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)

  // Fetch active clients and work history
  useEffect(() => {
    if (!employee || !employee.id) return

    async function loadClientData() {
      try {
        setClientsLoading(true)

        // Fetch active clients
        const { data: clients, error: clientsError } = await getClientsByEmployee(employee.id)
        if (!clientsError && clients) {
          setActiveClients(clients)
        }

        // Fetch complete work history (including past assignments)
        const { data: history, error: historyError } = await getEmployeeHistory(employee.id)
        if (!historyError && history) {
          // Separate into active and inactive
          const active = history.filter(h => h.isActive)
          const inactive = history.filter(h => !h.isActive)
          
          // If we got active clients from getClientsByEmployee, use those
          // Otherwise use active from history
          if (clients && clients.length > 0) {
            setActiveClients(clients)
          } else {
            setActiveClients(active)
          }
          
          setWorkHistory(inactive)
        }
      } catch (err) {
        console.error('Error loading client data:', err)
      } finally {
        setClientsLoading(false)
      }
    }

    loadClientData()
  }, [employee])

  if (!employee) return null

  // Determine status color and text - matching landing page style
  const getStatusInfo = () => {
    if (employee.currentClient) {
      return {
        text: employee.currentClient,
        backgroundColor: 'var(--secondary-blue)',
        color: '#1a1a1a'
      }
    }
    return {
      text: 'Beschikbaar',
      backgroundColor: 'var(--secondary-yellow)',
      color: '#1a1a1a'
    }
  }

  const statusInfo = getStatusInfo()

  // Industry colors
  const industryColors = {
    'FinTech': '#0066ff',
    'Healthcare': '#dc2626',
    'Retail': '#9333ea',
    'Energy': '#16a34a',
    'Automotive': '#ea580c',
    'Cybersecurity': '#4f46e5',
    'Cloud Services': '#06b6d4',
    'Education': '#ec4899',
    'Technology': '#0000FF',
    'Consulting': '#8B5CF6'
  }

  // Get proficiency level color
  const getProficiencyColor = (level) => {
    const colors = {
      'Beginner': 'bg-gray-100 text-gray-700 border-gray-300',
      'Intermediate': 'bg-blue-100 text-blue-700 border-blue-300',
      'Advanced': 'bg-purple-100 text-purple-700 border-purple-300',
      'Expert': 'bg-green-100 text-green-700 border-green-300',
    }
    return colors[level] || colors['Beginner']
  }

  // Normalize skills - handle both string array and object array
  const normalizeSkills = () => {
    if (!employee.skills || employee.skills.length === 0) return []
    
    return employee.skills.map(skill => {
      if (typeof skill === 'string') {
        return { name: skill, proficiency: 'Intermediate' }
      }
      return {
        name: skill.name || skill,
        proficiency: skill.proficiency || 'Intermediate'
      }
    })
  }

  const skills = normalizeSkills()

  // Get client timeline - use employee.clientTimeline if available, otherwise create from currentClient
  const getClientTimeline = () => {
    if (employee.clientTimeline && Array.isArray(employee.clientTimeline)) {
      return employee.clientTimeline.sort((a, b) => {
        const dateA = new Date(b.endDate || b.startDate || 0)
        const dateB = new Date(a.endDate || a.startDate || 0)
        return dateA - dateB
      })
    }
    
    // If no timeline but has current client, show it as a single item
    if (employee.currentClient) {
      return [{
        clientName: employee.currentClient,
        projectName: 'Huidig Project',
        startDate: employee.projectStartDate || new Date().toISOString(),
        endDate: null,
        description: employee.cvSummary || 'Werkt momenteel aan dit project.'
      }]
    }
    
    return []
  }

  const clientTimeline = getClientTimeline()

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Heden'
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })
  }

  // Calculate duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return ''
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    
    const years = end.getFullYear() - start.getFullYear()
    const months = end.getMonth() - start.getMonth()
    
    let duration = ''
    if (years > 0) {
      duration += `${years} ${years === 1 ? 'jaar' : 'jaren'}`
    }
    if (months > 0) {
      if (duration) duration += ', '
      duration += `${months} ${months === 1 ? 'maand' : 'maanden'}`
    }
    if (!duration) {
      const days = Math.floor((end - start) / (1000 * 60 * 60 * 24))
      duration = `${days} ${days === 1 ? 'dag' : 'dagen'}`
    }
    
    return duration
  }

  return (
    <div className="profile-container" style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Main content - matching landing page max-width */}
      <main className="home-main" style={{ 
        padding: '3rem 2rem',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {/* Page Title with Back Button */}
        <div style={{ 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Link 
            href="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--primary)', 
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'opacity 0.2s',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            Terug
          </Link>
          <h1 style={{ 
            fontSize: '2rem', 
            margin: 0, 
            fontWeight: 600, 
            color: 'var(--primary)',
            letterSpacing: '-0.3px'
          }}>
            {employee.name}
          </h1>
        </div>
        {/* Profile Card - matching landing page card style */}
        <div className="location-group" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2.5rem',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 255, 0.1)',
          marginBottom: '2rem'
        }}>
          
          {/* Profile Header Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '2rem',
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: '2px solid var(--secondary-lavender)'
          }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Profile Photo */}
              <div style={{ flexShrink: 0 }}>
                {employee.profilePicture ? (
                  <img
                    src={employee.profilePicture}
                    alt={employee.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      border: '3px solid var(--secondary-lavender)',
                      objectFit: 'cover',
                      backgroundColor: 'var(--secondary-lavender)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const fallback = e.target.nextSibling
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '3px solid var(--secondary-lavender)',
                    backgroundColor: 'var(--secondary-lavender)',
                    display: employee.profilePicture ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary-blue))',
                    color: 'white',
                    fontSize: '3rem',
                    fontWeight: 700
                  }}
                >
                  {employee.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Name and Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    fontSize: '1.3rem', 
                    color: '#333', 
                    marginBottom: '0.5rem',
                    fontWeight: 600
                  }}>
                    {employee.hierarchy || 'Employee'}
                  </div>
                </div>
                
                {/* Location */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  marginBottom: '1rem'
                }}>
                  <MapPin style={{ width: '18px', height: '18px' }} />
                  <span>{employee.location || 'Locatie niet opgegeven'}</span>
                </div>
                
                {/* Status Badge - matching landing page style */}
                <div 
                  className="employee-card-status"
                  style={{ 
                    backgroundColor: statusInfo.backgroundColor,
                    color: statusInfo.color,
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    letterSpacing: '0.2px'
                  }}
                >
                  {statusInfo.text}
                  {employee.projectStartDate && employee.currentClient && (() => {
                    const startDate = new Date(employee.projectStartDate)
                    const formatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    const now = new Date()
                    const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))
                    let duration = ''
                    if (diffDays < 30) {
                      duration = `${diffDays} day${diffDays !== 1 ? 's' : ''}`
                    } else if (diffDays < 365) {
                      const months = Math.floor(diffDays / 30)
                      duration = `${months} month${months !== 1 ? 's' : ''}`
                    } else {
                      const years = Math.floor(diffDays / 365)
                      const remainingMonths = Math.floor((diffDays % 365) / 30)
                      if (remainingMonths > 0) {
                        duration = `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
                      } else {
                        duration = `${years} year${years !== 1 ? 's' : ''}`
                      }
                    }
                    return (
                      <span style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.9, marginLeft: '0.5rem' }}>
                        {' • Started ' + formatted}
                        {duration && ` (${duration})`}
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* CV Summary Section */}
            {employee.cvSummary && (
              <section>
                <h2 style={{
                  fontSize: '1.3rem',
                  color: '#333',
                  margin: '0 0 1.5rem 0',
                  fontWeight: 600,
                  paddingBottom: '1rem',
                  borderBottom: '2px solid var(--secondary-lavender)'
                }}>
                  CV Samenvatting
                </h2>
                <p style={{
                  color: '#666',
                  lineHeight: '1.7',
                  fontSize: '1.05rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {employee.cvSummary}
                </p>
              </section>
            )}

            {/* Skills Section */}
            {skills.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '1.3rem',
                  color: '#333',
                  margin: '0 0 1.5rem 0',
                  fontWeight: 600,
                  paddingBottom: '1rem',
                  borderBottom: '2px solid var(--secondary-lavender)'
                }}>
                  Vaardigheden
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skills.map((skill, index) => {
                    const proficiencyColors = {
                      'Beginner': { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
                      'Intermediate': { bg: 'var(--secondary-blue)', text: '#1a1a1a', border: 'var(--secondary-blue)' },
                      'Advanced': { bg: '#e9d5ff', text: '#6b21a8', border: '#c084fc' },
                      'Expert': { bg: '#d1fae5', text: '#065f46', border: '#34d399' },
                    }
                    const colors = proficiencyColors[skill.proficiency] || proficiencyColors['Intermediate']
                    return (
                      <div
                        key={index}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{skill.name}</span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', opacity: 0.75 }}>
                          ({skill.proficiency})
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Active Clients Section */}
            <section>
              <h2 style={{
                fontSize: '1.3rem',
                color: '#333',
                margin: '0 0 1.5rem 0',
                fontWeight: 600,
                paddingBottom: '1rem',
                borderBottom: '2px solid var(--secondary-lavender)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <TrendingUp style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
                Currently Working For ({activeClients.length})
              </h2>

              {clientsLoading ? (
                <div style={{
                  backgroundColor: '#fafafa',
                  borderRadius: '10px',
                  padding: '2rem',
                  textAlign: 'center',
                  border: '1px solid rgba(0, 0, 0, 0.08)'
                }}>
                  <p style={{ color: '#666', fontSize: '0.95rem' }}>Loading client assignments...</p>
                </div>
              ) : activeClients.length === 0 ? (
                <div style={{
                  backgroundColor: '#fafafa',
                  borderRadius: '10px',
                  padding: '3rem',
                  textAlign: 'center',
                  border: '2px dashed #d1d5db'
                }}>
                  <Building2 style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                  <p style={{ color: '#666', fontSize: '1.05rem', fontWeight: 500 }}>
                    Not currently assigned to any clients
                  </p>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    This employee is available for new projects
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {activeClients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      industryColors={industryColors}
                      isActive={true}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Past Clients Section */}
            {workHistory.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '1.3rem',
                  color: '#333',
                  margin: '0 0 1.5rem 0',
                  fontWeight: 600,
                  paddingBottom: '1rem',
                  borderBottom: '2px solid var(--secondary-lavender)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Briefcase style={{ width: '24px', height: '24px', color: '#666' }} />
                  Past Clients ({workHistory.length})
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {workHistory.map((assignment, index) => (
                    <ClientCard
                      key={assignment.assignmentId || index}
                      client={assignment.clientInfo}
                      assignment={assignment}
                      industryColors={industryColors}
                      isActive={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Client Card Component for displaying client assignments
function ClientCard({ client, assignment, industryColors, isActive }) {
  if (!client) return null

  const industryColor = industryColors[client.industry] || '#0000FF'
  
  // Get project name and dates from assignment or client data
  const projectName = assignment?.projectName || client.projectName || 'General Assignment'
  const startDate = assignment?.startDate || client.startDate
  const endDate = assignment?.endDate || client.endDate
  const duration = assignment?.duration || ''

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Link
      href={`/clients/${client.id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 255, 0.12)'
          e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Top accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${industryColor}, var(--secondary-blue))`
        }}></div>

        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: isActive ? 'rgba(0, 170, 0, 0.1)' : 'rgba(136, 136, 136, 0.1)',
          color: isActive ? '#00AA00' : '#888',
          border: isActive ? '1px solid rgba(0, 170, 0, 0.3)' : '1px solid rgba(136, 136, 136, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isActive ? '#00AA00' : '#888'
          }}></span>
          {isActive ? 'Active' : 'Completed'}
        </div>

        {/* Logo Section */}
        <div style={{
          height: '120px',
          background: 'linear-gradient(135deg, var(--secondary-lavender) 0%, #e8e8ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          paddingTop: '1rem'
        }}>
          {client.logo ? (
            <img
              src={client.logo}
              alt={client.name}
              style={{ maxHeight: '70px', maxWidth: '80%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}>
              <Building2 size={35} style={{ color: industryColor }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Client Name */}
          <div>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--primary)',
              margin: 0,
              marginBottom: '0.5rem',
              lineHeight: '1.3'
            }}>
              {client.name}
            </h3>

            {/* Industry Badge */}
            <span style={{
              display: 'inline-block',
              padding: '0.3rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: `${industryColor}15`,
              color: industryColor,
              border: `1px solid ${industryColor}30`
            }}>
              {client.industry}
            </span>
          </div>

          {/* Project Name */}
          {projectName && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 0, 255, 0.03)',
              borderRadius: '8px'
            }}>
              <Briefcase size={16} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
                  Project
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>
                  {projectName}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
            marginTop: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#666'
            }}>
              <Calendar size={14} style={{ color: 'var(--primary)' }} />
              <span>
                {formatDate(startDate)} → {isActive ? 'Present' : formatDate(endDate)}
              </span>
            </div>
            {duration && (
              <div style={{
                fontSize: '0.75rem',
                color: '#999',
                marginLeft: '1.25rem',
                fontWeight: 500
              }}>
                Duration: {duration}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

