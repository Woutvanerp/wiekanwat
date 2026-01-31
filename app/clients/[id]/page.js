'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchClientById, fetchEmployees, updateClient, deleteClient } from '../../../utils/api'
import { 
  getEmployeesByClient, 
  assignEmployeeToClient, 
  removeEmployeeFromClient 
} from '../../../utils/employeeClientRelations'
import { 
  Building2, 
  Users, 
  Briefcase, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  ArrowLeft,
  AlertCircle,
  Plus,
  X,
  Edit,
  Trash2
} from 'lucide-react'
import Tag from '../../../components/Tag'
import ConfirmationModal from '../../../components/ConfirmationModal'
import Toast from '../../../components/Toast'
import EditClientModal from '../../../components/EditClientModal'
import '../../home.css'

// Status configurations
const statusConfig = {
  'Actief': {
    color: '#00AA00',
    bgColor: 'rgba(0, 200, 0, 0.1)'
  },
  'Inactief': {
    color: '#888',
    bgColor: 'rgba(136, 136, 136, 0.1)'
  },
  'Potentieel': {
    color: '#FF8C00',
    bgColor: 'rgba(255, 165, 0, 0.1)'
  }
}

// Industry configurations with colors
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

// Mock data for demonstration
const MOCK_CLIENT = {
  id: '1',
  name: 'Acme Corporation',
  description: 'Toonaangevende leverancier van innovatieve technologieoplossingen. Wij zijn gespecialiseerd in cloud-infrastructuur, cyberbeveiliging en enterprise softwareontwikkeling. Onze missie is om bedrijven te empoweren door middel van geavanceerde technologie.',
  logo: null,
  industry: 'Technology',
  status: 'Actief',
  employees_assigned: 8,
  active_teams: 3,
  contract_start: '2023-06-15',
  contract_duration: '24 months',
  annual_value: '$450,000',
  primary_contact: 'John Anderson',
  contact_email: 'john.anderson@acmecorp.com',
  contact_phone: '+31 6 1234 5678',
  location: 'Amsterdam, Netherlands'
}

const MOCK_EMPLOYEES = [
  {
    id: '1',
    name: 'Emma van der Berg',
    hierarchy: 'Senior Consultant',
    profilePicture: null,
    location: 'Eindhoven',
    skills: ['React', 'Node.js', 'AWS']
  },
  {
    id: '2',
    name: 'Lucas Jansen',
    hierarchy: 'Principal Consultant',
    profilePicture: null,
    location: 'Eindhoven',
    skills: ['Python', 'Data Science', 'Machine Learning']
  },
  {
    id: '3',
    name: 'Sophie de Vries',
    hierarchy: 'Consultant',
    profilePicture: null,
    location: 'Maastricht',
    skills: ['UI/UX Design', 'Figma', 'React']
  },
  {
    id: '4',
    name: 'Thomas Bakker',
    hierarchy: 'Managing Consultant',
    profilePicture: null,
    location: 'Eindhoven',
    skills: ['Cloud Architecture', 'DevOps', 'Kubernetes']
  },
  {
    id: '5',
    name: 'Lisa Mulder',
    hierarchy: 'Senior Consultant',
    profilePicture: null,
    location: 'Eindhoven',
    skills: ['Java', 'Spring Boot', 'Microservices']
  },
  {
    id: '6',
    name: 'Max Hendriks',
    hierarchy: 'Consultant',
    profilePicture: null,
    location: 'Maastricht',
    skills: ['JavaScript', 'Vue.js', 'TypeScript']
  }
]

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [availableEmployees, setAvailableEmployees] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [employeeToRemove, setEmployeeToRemove] = useState(null)
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      
      // Try to fetch from API
      const clientData = await fetchClientById(params.id)
      
      if (!clientData) {
        // Use mock data if client not found
        console.log('Client not found in database, using mock data')
        setClient(MOCK_CLIENT)
        setEmployees(MOCK_EMPLOYEES)
      } else {
        setClient(clientData)
        
        // Fetch employees assigned to this client using many-to-many relationship
        const { data: assignedEmployees, error: employeesError } = await getEmployeesByClient(clientData.id)
        
        if (employeesError) {
          console.error('Error fetching employees:', employeesError)
          setEmployees([])
        } else {
          setEmployees(assignedEmployees || [])
        }

        // Fetch all employees for the assignment modal
        const allEmployees = await fetchEmployees()
        const assignedIds = new Set((assignedEmployees || []).map(e => e.id))
        const available = allEmployees.filter(emp => !assignedIds.has(emp.id))
        setAvailableEmployees(available)
      }
    } catch (err) {
      console.error('Failed to load client:', err)
      setError(err.message)
      setClient(MOCK_CLIENT)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  // Assign employee to client
  async function handleAssignEmployee(employeeId, projectName, startDate) {
    try {
      setActionLoading(true)
      const { error } = await assignEmployeeToClient(
        employeeId,
        client.id,
        projectName,
        startDate
      )

      if (error) throw error

      // Reload data
      await loadData()
      setShowAssignModal(false)
      
      // Show success toast
      const employee = availableEmployees.find(emp => emp.id === employeeId)
      setToast({
        show: true,
        message: `${employee?.name || 'Medewerker'} is succesvol toegewezen aan ${client.name}`,
        type: 'success'
      })
    } catch (err) {
      console.error('Error assigning employee:', err)
      setToast({
        show: true,
        message: `Kon medewerker niet toewijzen: ${err.message}`,
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
      const { error } = await removeEmployeeFromClient(employeeToRemove.id, client.id)

      if (error) throw error

      // Reload data
      await loadData()
      
      // Show success toast
      setToast({
        show: true,
        message: `${employeeToRemove.name} is verwijderd van ${client.name}`,
        type: 'success'
      })
      
      // Close modal and reset
      setShowConfirmModal(false)
      setEmployeeToRemove(null)
    } catch (err) {
      console.error('Error removing employee:', err)
      setToast({
        show: true,
        message: `Kon medewerker niet verwijderen: ${err.message}`,
        type: 'error'
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle edit client submission
  async function handleEditClient(updatedData) {
    try {
      setActionLoading(true)
      await updateClient(client.id, updatedData)
      
      // Reload client data
      await loadData()
      
      // Close modal and show success toast
      setShowEditModal(false)
      setToast({
        show: true,
        message: `Klant "${updatedData.name}" is succesvol bijgewerkt!`,
        type: 'success'
      })
    } catch (err) {
      console.error('Failed to update client:', err)
      setToast({
        show: true,
        message: `Kon klant niet bijwerken: ${err.message}`,
        type: 'error'
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle delete client
  async function handleDeleteClient() {
    try {
      setActionLoading(true)
      await deleteClient(client.id)
      
      // Show success toast and redirect to clients list
      setToast({
        show: true,
        message: `Klant "${client.name}" is succesvol verwijderd`,
        type: 'success'
      })
      
      // Wait a moment for the toast to show, then redirect
      setTimeout(() => {
        router.push('/clients')
      }, 1500)
    } catch (err) {
      console.error('Failed to delete client:', err)
      setToast({
        show: true,
        message: `Kon klant niet verwijderen: ${err.message}`,
        type: 'error'
      })
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="home-container">
        <main className="home-main">
          <div className="empty-state">
            <h2>Laden...</h2>
            <p>Klantgegevens ophalen</p>
          </div>
        </main>
      </div>
    )
  }

  if (error && !client) {
    return (
      <div className="home-container">
        <main className="home-main">
          <div className="empty-state">
            <AlertCircle style={{ width: '64px', height: '64px', color: '#999', margin: '0 auto 1rem' }} />
            <h2>Fout bij laden</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push('/clients')}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Terug naar Klanten
            </button>
          </div>
        </main>
      </div>
    )
  }

  const statusStyle = statusConfig[client.status] || statusConfig.Actief
  const industryColor = industryColors[client.industry] || '#0000FF'

  return (
    <div className="home-container">
      {/* Page Header with Back Button */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        marginBottom: '0'
      }}>
        <div style={{ 
          maxWidth: '1600px', 
          margin: '0 auto'
        }}>
          {/* Back Button */}
          <Link 
            href="/clients"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              marginBottom: '1.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 255, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            Terug naar Klanten
          </Link>

          {/* Header Section */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flex: 1, minWidth: '300px' }}>
              {/* Company Logo */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--secondary-lavender) 0%, #e8e8ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                flexShrink: 0
              }}>
                {client.logo ? (
                  <img 
                    src={client.logo} 
                    alt={client.name} 
                    style={{ maxHeight: '80px', maxWidth: '80%', objectFit: 'contain' }} 
                  />
                ) : (
                  <Building2 size={50} style={{ color: industryColor }} />
                )}
              </div>

              {/* Company Info */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  margin: 0,
                  marginBottom: '0.75rem'
                }}>
                  {client.name}
                </h1>

                {/* Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    backgroundColor: `${industryColor}15`,
                    color: industryColor,
                    border: `1px solid ${industryColor}30`
                  }}>
                    {client.industry}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    backgroundColor: statusStyle.bgColor,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.color}30`
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: statusStyle.color
                    }}></span>
                    {client.status}
                  </span>
                </div>

                {/* Location */}
                {client.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#666',
                    fontSize: '1rem'
                  }}>
                    <MapPin size={18} style={{ color: 'var(--primary)' }} />
                    <span>{client.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
              <button
                onClick={() => setShowEditModal(true)}
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'white',
                  color: 'var(--primary)',
                  border: '2px solid var(--primary)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!actionLoading) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 255, 0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!actionLoading) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <Edit size={18} />
                Bewerken
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'white',
                  color: '#dc2626',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!actionLoading) {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!actionLoading) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <Trash2 size={18} />
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="home-main">
        {/* Stats Bar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            {/* Employees Assigned */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 0, 255, 0.03)',
              border: '1px solid rgba(0, 0, 255, 0.1)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={30} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  lineHeight: '1'
                }}>
                  {client.employees_assigned || 0}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginTop: '0.25rem',
                  fontWeight: 500
                }}>
                  Toegewezen Medewerkers
                </div>
              </div>
            </div>

            {/* Active Teams */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 0, 255, 0.03)',
              border: '1px solid rgba(0, 0, 255, 0.1)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Briefcase size={30} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  lineHeight: '1'
                }}>
                  {client.active_teams || 0}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginTop: '0.25rem',
                  fontWeight: 500
                }}>
                  Actieve Teams
                </div>
              </div>
            </div>

            {/* Contract Start Date */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 0, 255, 0.03)',
              border: '1px solid rgba(0, 0, 255, 0.1)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Calendar size={30} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  lineHeight: '1.2'
                }}>
                  {client.contract_start || 'N/A'}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginTop: '0.25rem',
                  fontWeight: 500
                }}>
                  Contract Startdatum
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Employees Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            gridColumn: '1 / -1'
          }}>
            {/* Header with Assign Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
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
                Toegewezen Medewerkers ({employees.length})
              </h2>

              <button
                onClick={() => setShowAssignModal(true)}
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
                  opacity: actionLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!actionLoading) e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  if (!actionLoading) e.currentTarget.style.opacity = '1'
                }}
              >
                <Plus size={18} />
                Medewerker Toewijzen
              </button>
            </div>

            {employees.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#999'
              }}              >
                <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 500 }}>
                  Nog geen medewerkers toegewezen
                </p>
                <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                  Klik op "Medewerker Toewijzen" om teamleden aan deze klant toe te voegen
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {employees.map(employee => (
                  <EmployeeCardEnhanced
                    key={employee.id}
                    employee={employee}
                    onRemove={() => confirmRemoveEmployee(employee.id, employee.name)}
                    disabled={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Client Info Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--primary)',
              margin: 0,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}            >
              <Building2 size={24} />
              Klantinformatie
            </h2>

            {/* Description */}
            {client.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.75rem'
                }}>
                  Beschrijving
                </h3>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: '#333',
                  margin: 0
                }}>
                  {client.description}
                </p>
              </div>
            )}

            {/* Primary Contact */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.75rem'
              }}>
                Contactpersoon
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--secondary-lavender)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#333'
                  }}>
                    {client.primary_contact || 'N/A'}
                  </div>
                </div>
              </div>

              {client.contact_email && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 255, 0.03)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}>
                  <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <a 
                    href={`mailto:${client.contact_email}`}
                    style={{
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {client.contact_email}
                  </a>
                </div>
              )}

              {client.contact_phone && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 255, 0.03)',
                  borderRadius: '8px'
                }}>
                  <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <a 
                    href={`tel:${client.contact_phone}`}
                    style={{
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    {client.contact_phone}
                  </a>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                {client.contract_duration && (
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#999',
                      marginBottom: '0.25rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Contract Duur
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#333'
                    }}>
                      {client.contract_duration}
                    </div>
                  </div>
                )}

                {client.annual_value && (
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#999',
                      marginBottom: '0.25rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Jaarwaarde
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#333'
                    }}>
                      {client.annual_value}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assign Employee Modal */}
        {showAssignModal && (
          <AssignEmployeeModal
            availableEmployees={availableEmployees}
            onAssign={handleAssignEmployee}
            onClose={() => setShowAssignModal(false)}
            loading={actionLoading}
          />
        )}

        {/* Edit Client Modal */}
        <EditClientModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditClient}
          loading={actionLoading}
          client={client}
        />

        {/* Confirmation Modal for Removing Employee */}
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false)
            setEmployeeToRemove(null)
          }}
          onConfirm={handleRemoveEmployee}
          title="Medewerker Verwijderen?"
          message={`Weet je zeker dat je ${employeeToRemove?.name || 'deze medewerker'} wilt verwijderen van ${client.name}? Dit zal de toewijzing als inactief markeren.`}
          confirmText="Verwijderen"
          cancelText="Annuleren"
          variant="danger"
          loading={actionLoading}
        />

        {/* Confirmation Modal for Deleting Client */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteClient}
          title="Klant Verwijderen?"
          message={`Weet je zeker dat je klant "${client.name}" permanent wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.${employees.length > 0 ? '\n\nLet op: Deze klant heeft momenteel ' + employees.length + ' toegewezen medewerker(s).' : ''}`}
          confirmText="Permanent Verwijderen"
          cancelText="Annuleren"
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
      </main>
    </div>
  )
}

// Enhanced Employee Card with remove button and project details
function EmployeeCardEnhanced({ employee, onRemove, disabled }) {
  return (
    <div style={{ position: 'relative' }}>
      <Link 
        href={`/employee/${employee.id}`}
        style={{ textDecoration: 'none' }}
      >
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            padding: '1.5rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 255, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Profile & Name Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Profile Picture */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--secondary-lavender)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              {employee.profilePicture || employee.profile_picture ? (
                <img 
                  src={employee.profilePicture || employee.profile_picture} 
                  alt={employee.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--primary)'
                }}>
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name & Role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--primary)',
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

          {/* Project Name */}
          {employee.projectName && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'rgba(0, 0, 255, 0.05)',
              borderRadius: '8px'
            }}>
              <Briefcase size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', color: '#333' }}>
                {employee.projectName}
              </span>
            </div>
          )}

          {/* Start Date & Location */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            fontSize: '0.85rem'
          }}>
            {employee.startDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666' }}>
                <Calendar size={14} style={{ color: 'var(--primary)' }} />
                <span>Gestart {employee.startDate}</span>
              </div>
            )}
            {employee.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666' }}>
                <MapPin size={14} style={{ color: 'var(--primary)' }} />
                <span>{employee.location}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {employee.skills && employee.skills.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              {employee.skills.slice(0, 4).map((skill, index) => (
                <Tag key={index} text={skill} />
              ))}
              {employee.skills.length > 4 && (
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#666',
                  fontWeight: 500
                }}>
                  +{employee.skills.length - 4} meer
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Remove Button (outside Link to prevent navigation) */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        disabled={disabled}
        title="Remove from team"
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          backgroundColor: 'white',
          color: '#dc2626',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'
            e.currentTarget.style.transform = 'scale(1.1)'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.transform = 'scale(1)'
          }
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

// Assign Employee Modal Component
function AssignEmployeeModal({ availableEmployees, onAssign, onClose, loading }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [validationError, setValidationError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!selectedEmployeeId) {
      setValidationError('Selecteer alstublieft een medewerker')
      return
    }
    setValidationError('')
    onAssign(selectedEmployeeId, projectName, startDate)
  }

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
        padding: '1rem'
      }}
      onClick={onClose}
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
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
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
          Medewerker Toewijzen aan Klant
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Validation Error */}
          {validationError && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              {validationError}
            </div>
          )}

          {/* Employee Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Selecteer Medewerker *
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => {
                setSelectedEmployeeId(e.target.value)
                setValidationError('') // Clear error when user selects
              }}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">Kies een medewerker...</option>
              {availableEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.hierarchy}
                </option>
              ))}
            </select>
            {availableEmployees.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                Alle medewerkers zijn al toegewezen aan deze klant
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
              Projectnaam (Optioneel)
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="bijv. Cloud Migratie Project"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '1rem'
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
              Startdatum *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '1rem'
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
              onClick={onClose}
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
                opacity: loading ? 0.6 : 1
              }}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading || !selectedEmployeeId}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: (loading || !selectedEmployeeId) ? 'not-allowed' : 'pointer',
                opacity: (loading || !selectedEmployeeId) ? 0.6 : 1
              }}
            >
              {loading ? 'Toewijzen...' : 'Toewijzen aan Klant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

