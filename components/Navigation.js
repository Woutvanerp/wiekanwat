'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Building2, UserPlus, BarChart3 } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Personen', path: '/organizational-chart', icon: Users },
    { name: 'Organisatiestructuur', path: '/organizational-structure', icon: BarChart3 },
    { name: 'Klanten', path: '/clients', icon: Building2 },
    { name: 'Persoon Toevoegen', path: '/add', icon: UserPlus }
  ]
  
  const isActive = (path) => {
    if (path === '/') return pathname === path
    return pathname.startsWith(path)
  }
  
  return (
    <nav style={{
      backgroundColor: 'white',
      borderBottom: '1px solid rgba(0, 0, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Logo/Brand */}
        <Link 
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 255, 0.2)'
          }}>
            <Users style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--primary)',
              lineHeight: '1.2',
              letterSpacing: '-0.5px'
            }}>
              Sparke & Keane
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: '#666',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Employee Board
            </span>
          </div>
        </Link>
        
        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  textDecoration: 'none',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'white' : '#333',
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 255, 0.05)'
                    e.currentTarget.style.color = 'var(--primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#333'
                  }
                }}
              >
                <Icon style={{ width: '18px', height: '18px' }} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
