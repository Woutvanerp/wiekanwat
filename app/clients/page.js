'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchClients, createClient } from '../../utils/api'
import { 
  Building2, 
  Users, 
  Briefcase, 
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Plus,
  AlertCircle
} from 'lucide-react'
import Toast from '../../components/Toast'
import AddClientModal from '../../components/AddClientModal'
import '../home.css'

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


export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch from Supabase
        const clientsData = await fetchClients()
        
        if (!clientsData || clientsData.length === 0) {
          console.log('No clients found in database')
          setClients([])
        } else {
          // The API already transforms snake_case to the format we need
          // Just use the data directly
          setClients(clientsData)
        }
      } catch (err) {
        console.error('Failed to load clients:', err)
        setError(err.message || 'Failed to load clients')
        setClients([])
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Handle add client submission
  async function handleAddClient(clientData) {
    try {
      setActionLoading(true)
      await createClient(clientData)
      
      // Reload clients list
      const clientsData = await fetchClients()
      setClients(clientsData)
      
      // Close modal and show success toast
      setShowAddModal(false)
      setToast({
        show: true,
        message: `Klant "${clientData.name}" is succesvol toegevoegd!`,
        type: 'success'
      })
    } catch (err) {
      console.error('Failed to create client:', err)
      setToast({
        show: true,
        message: `Kon klant niet toevoegen: ${err.message}`,
        type: 'error'
      })
    } finally {
      setActionLoading(false)
    }
  }


  return (
    <div className="home-container">
      {/* Page Header */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        marginBottom: '0'
      }}>
        <div style={{ 
          maxWidth: '1600px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 600,
              color: 'var(--primary)',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              Klanten
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              margin: 0,
              fontWeight: 300
            }}>
              Overzicht en beheer van alle klantrelaties
            </p>
          </div>
          
          {/* Add Client Button */}
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Plus style={{ width: '20px', height: '20px' }} />
            Nieuwe Klant
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="home-main">
        {loading && (
          <div className="empty-state">
            <h2>Laden...</h2>
            <p>Klantgegevens ophalen</p>
          </div>
        )}

        {error && !loading && (
          <div className="empty-state">
            <AlertCircle style={{ width: '64px', height: '64px', color: '#999', margin: '0 auto 1rem' }} />
            <h2>Fout bij laden</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && clients.length === 0 && (
          <div className="empty-state">
            <Building2 style={{ width: '64px', height: '64px', color: '#999', margin: '0 auto 1rem' }} />
            <h2>Geen klanten gevonden</h2>
            <p>Er zijn momenteel geen klanten in het systeem</p>
          </div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {clients.map(client => (
              <ClientCard key={client.id} client={client} router={router} />
            ))}
          </div>
        )}
      </main>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddClient}
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

function ClientCard({ client, router }) {
  const statusStyle = statusConfig[client.status] || statusConfig.Actief
  const industryColor = industryColors[client.industry] || '#0000FF'

  return (
    <div 
      onClick={() => router.push(`/clients/${client.id}`)}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 255, 0.12)'
        e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.2)'
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

      {/* Company Logo Section */}
      <div style={{
        height: '140px',
        background: 'linear-gradient(135deg, var(--secondary-lavender) 0%, #e8e8ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {client.logo ? (
          <img 
            src={client.logo} 
            alt={client.name} 
            style={{ maxHeight: '80px', maxWidth: '80%', objectFit: 'contain' }} 
          />
        ) : (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <Building2 size={40} style={{ color: industryColor }} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {/* Company Name */}
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--primary)',
          margin: 0,
          lineHeight: '1.3',
          minHeight: '2.6rem'
        }}>
          {client.name}
        </h3>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.35rem 0.85rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
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
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            backgroundColor: statusStyle.bgColor,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.color}30`
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: statusStyle.color
            }}></span>
            {client.status}
          </span>
        </div>

        {/* Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          {/* Employees */}
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
            <Users style={{ color: 'var(--primary)', minWidth: '18px', marginTop: '2px' }} size={18} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: '1' }}>
                {client.employees_assigned || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>Medewerkers</div>
            </div>
          </div>

          {/* Teams */}
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
            <Briefcase style={{ color: 'var(--primary)', minWidth: '18px', marginTop: '2px' }} size={18} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: '1' }}>
                {client.active_teams || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>Teams</div>
            </div>
          </div>

          {/* Contract Start */}
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', gridColumn: 'span 2' }}>
            <Calendar style={{ color: 'var(--primary)', minWidth: '18px', marginTop: '2px' }} size={18} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                {client.contract_start || 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Contract Start</div>
            </div>
          </div>

          {/* Annual Value */}
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', gridColumn: 'span 2' }}>
            <DollarSign style={{ color: 'var(--primary)', minWidth: '18px', marginTop: '2px' }} size={18} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                {client.annual_value || 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Jaarwaarde</div>
            </div>
          </div>
        </div>

        {/* Primary Contact */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '0.5rem'
          }}>
            Contactpersoon
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
            {client.primary_contact || 'N/A'}
          </div>
          {client.contact_email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
              <Mail size={14} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {client.contact_email}
              </span>
            </div>
          )}
          {client.contact_phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
              <Phone size={14} />
              <span>{client.contact_phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
