'use client'

import Link from 'next/link'
import { Users, Building2, BarChart3, ArrowRight, TrendingUp, Filter, Users2 } from 'lucide-react'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #0066ff 50%, var(--secondary-blue) 100%)',
        color: 'white',
        padding: '8rem 2rem 4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              letterSpacing: '-1.5px',
              lineHeight: '1.1'
            }}>
              Welkom bij Sparke & Keane
            </h1>
            <p style={{
              fontSize: '1.35rem',
              opacity: 0.95,
              fontWeight: 300,
              lineHeight: '1.6',
              marginBottom: '2.5rem'
            }}>
              Uw centrale hub voor personeelsbeheer, organisatiestructuur en klantrelaties
            </p>
            
            {/* Quick Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                href="/organizational-structure"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--primary)',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <BarChart3 style={{ width: '20px', height: '20px' }} />
                Organisatiestructuur
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <Link
                href="/clients"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Building2 style={{ width: '20px', height: '20px' }} />
                Klanten
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        {/* Quick Access Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '5rem',
          marginTop: '-3rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Organizational Structure Card */}
          <Link
            href="/organizational-structure"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 255, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 255, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.1)'
            }}
          >
            {/* Accent Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, var(--primary), var(--secondary-blue))'
            }}></div>
            
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 255, 0.2)'
            }}>
              <BarChart3 style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '0.75rem',
              marginTop: '0'
            }}>
              Organisatiestructuur
            </h2>
            <p style={{
              color: '#666',
              lineHeight: '1.7',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              flex: 1
            }}>
              Bekijk de hiërarchische organisatieboom per locatie met alle medewerkers visueel weergegeven.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginTop: 'auto'
            }}>
              Bekijk structuur
              <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '0.5rem' }} />
            </div>
          </Link>

          {/* Clients Card */}
          <Link
            href="/clients"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 255, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 255, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.1)'
            }}
          >
            {/* Accent Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, var(--secondary-blue), var(--secondary-yellow))'
            }}></div>
            
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--secondary-blue), var(--secondary-yellow))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 12px rgba(138, 225, 244, 0.3)'
            }}>
              <Building2 style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '0.75rem',
              marginTop: '0'
            }}>
              Klanten
            </h2>
            <p style={{
              color: '#666',
              lineHeight: '1.7',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              flex: 1
            }}>
              Beheer klantrelaties en bekijk projecttoewijzingen binnen uw organisatie.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginTop: 'auto'
            }}>
              Bekijk klanten
              <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '0.5rem' }} />
            </div>
          </Link>

          {/* Add Person Card */}
          <Link
            href="/add"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 255, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 255, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(0, 0, 255, 0.1)'
            }}
          >
            {/* Accent Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, var(--secondary-yellow), var(--primary))'
            }}></div>
            
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--secondary-yellow), var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 12px rgba(254, 234, 69, 0.3)'
            }}>
              <Users style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '0.75rem',
              marginTop: '0'
            }}>
              Persoon Toevoegen
            </h2>
            <p style={{
              color: '#666',
              lineHeight: '1.7',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              flex: 1
            }}>
              Voeg een nieuw teamlid toe aan het organisatieschema met hun gegevens en vaardigheden.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginTop: 'auto'
            }}>
              Voeg toe
              <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '0.5rem' }} />
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '4rem 3rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 255, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: '0.75rem',
              letterSpacing: '-0.5px'
            }}>
              Functionaliteiten
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Alles wat u nodig heeft voor effectief personeelsbeheer op één plek
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem'
          }}>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary-blue))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 12px rgba(0, 0, 255, 0.2)'
              }}>
                <Users2 style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.75rem'
              }}>
                Personeelsbeheer
              </h3>
              <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                Volg medewerkerinformatie, vaardigheden, locaties en hiërarchieniveaus op één centrale locatie.
              </p>
            </div>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--secondary-blue), var(--secondary-yellow))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 12px rgba(138, 225, 244, 0.3)'
              }}>
                <TrendingUp style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.75rem'
              }}>
                Klantvolging
              </h3>
              <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                Monitor klanttoewijzingen en projecttijdlijnen voor elk teamlid in real-time.
              </p>
            </div>
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--secondary-yellow), var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 12px rgba(254, 234, 69, 0.3)'
              }}>
                <Filter style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '0.75rem'
              }}>
                Geavanceerd Filteren
              </h3>
              <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                Filter medewerkers op locatie, hiërarchie, vaardigheden en klantstatus met één klik.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
