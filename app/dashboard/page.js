'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  UserCheck, 
  DollarSign,
  Calendar,
  Briefcase,
  Award,
  Clock,
  Activity
} from 'lucide-react'
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from 'recharts'
import { supabase } from '../../utils/supabase-client'
import './dashboard.css'

const COLORS = ['#0050ff', '#00a3ff', '#00d4ff', '#8ae1f4', '#feea45', '#ff6b6b']

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    availableEmployees: 0,
    totalClients: 0,
    activeClients: 0
  })
  const [hierarchyData, setHierarchyData] = useState([])
  const [industryData, setIndustryData] = useState([])
  const [utilizationData, setUtilizationData] = useState([])
  const [topClientsData, setTopClientsData] = useState([])
  const [quickStats, setQuickStats] = useState({
    avgEmployeesPerClient: 0,
    mostCommonSkill: '-',
    busiestMonth: '-',
    totalContractValue: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch all employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
      
      if (employeesError) throw employeesError

      // Fetch all clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
      
      if (clientsError) throw clientsError

      // Fetch all employee-client relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('employee_clients')
        .select(`
          *,
          employees (name),
          clients (name)
        `)
        .order('start_date', { ascending: false })
      
      if (relationshipsError) throw relationshipsError

      // Calculate metrics
      calculateMetrics(employees, clients, relationships)
      calculateHierarchyDistribution(employees)
      calculateIndustryDistribution(clients)
      calculateUtilizationTrend(relationships)
      calculateTopClients(clients, relationships)
      calculateQuickStats(employees, clients, relationships)
      setRecentActivity(relationships.slice(0, 5))

      setLoading(false)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  function calculateMetrics(employees, clients, relationships) {
    const totalEmployees = employees.length
    const activeEmployeeIds = new Set(
      relationships
        .filter(r => r.is_active)
        .map(r => r.employee_id)
    )
    const availableEmployees = totalEmployees - activeEmployeeIds.size
    const totalClients = clients.length
    const activeClients = clients.filter(c => c.status === 'Active').length

    setMetrics({
      totalEmployees,
      availableEmployees,
      totalClients,
      activeClients
    })
  }

  function calculateHierarchyDistribution(employees) {
    const hierarchyCount = {}
    employees.forEach(emp => {
      const hierarchy = emp.hierarchy || 'Unknown'
      hierarchyCount[hierarchy] = (hierarchyCount[hierarchy] || 0) + 1
    })

    const data = Object.entries(hierarchyCount).map(([name, value]) => ({
      name,
      value
    }))
    setHierarchyData(data)
  }

  function calculateIndustryDistribution(clients) {
    const industryCount = {}
    clients.forEach(client => {
      const industry = client.industry || 'Unknown'
      industryCount[industry] = (industryCount[industry] || 0) + 1
    })

    const data = Object.entries(industryCount).map(([industry, count]) => ({
      industry,
      count
    }))
    setIndustryData(data)
  }

  function calculateUtilizationTrend(relationships) {
    // Calculate utilization for last 6 months
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('nl-NL', { month: 'short' })
      
      // Count active relationships in that month
      const activeInMonth = relationships.filter(r => {
        const startDate = new Date(r.start_date)
        const endDate = r.end_date ? new Date(r.end_date) : new Date()
        return startDate <= date && endDate >= date
      }).length

      months.push({
        month: monthName,
        utilization: activeInMonth > 0 ? Math.min(100, (activeInMonth / 50) * 100) : 0
      })
    }

    setUtilizationData(months)
  }

  function calculateTopClients(clients, relationships) {
    const clientEmployeeCount = {}
    
    relationships.forEach(r => {
      if (r.is_active && r.client_id) {
        clientEmployeeCount[r.client_id] = (clientEmployeeCount[r.client_id] || 0) + 1
      }
    })

    const topClients = Object.entries(clientEmployeeCount)
      .map(([clientId, count]) => {
        const client = clients.find(c => c.id === parseInt(clientId))
        return {
          name: client?.name || 'Unknown',
          employees: count
        }
      })
      .sort((a, b) => b.employees - a.employees)
      .slice(0, 5)

    setTopClientsData(topClients)
  }

  function calculateQuickStats(employees, clients, relationships) {
    // Average employees per client
    const activeRelationships = relationships.filter(r => r.is_active)
    const avgEmployeesPerClient = clients.length > 0 
      ? (activeRelationships.length / clients.length).toFixed(1)
      : 0

    // Most common skill
    const skillCount = {}
    employees.forEach(emp => {
      if (emp.skills && Array.isArray(emp.skills)) {
        emp.skills.forEach(skill => {
          skillCount[skill] = (skillCount[skill] || 0) + 1
        })
      }
    })
    const mostCommonSkill = Object.entries(skillCount).length > 0
      ? Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0][0]
      : '-'

    // Busiest month for assignments
    const monthCount = {}
    relationships.forEach(r => {
      const date = new Date(r.start_date)
      const monthYear = date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
      monthCount[monthYear] = (monthCount[monthYear] || 0) + 1
    })
    const busiestMonth = Object.entries(monthCount).length > 0
      ? Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0][0]
      : '-'

    // Total contract value
    const totalContractValue = clients
      .filter(c => c.status === 'Active')
      .reduce((sum, c) => sum + (parseFloat(c.annual_value) || 0), 0)

    setQuickStats({
      avgEmployeesPerClient,
      mostCommonSkill,
      busiestMonth,
      totalContractValue
    })
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', fontSize: '1.1rem' }}>
          Error loading dashboard: {error}
        </p>
      </div>
    )
  }

  return (
    <div className="dashboard-container" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.5px'
          }}>
            Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Overzicht van uw personeels- en klantgegevens
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="metrics-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <MetricCard
            icon={Users}
            label="Totaal Medewerkers"
            value={metrics.totalEmployees}
            color="#0050ff"
            bgColor="#e6f0ff"
          />
          <MetricCard
            icon={UserCheck}
            label="Beschikbare Medewerkers"
            value={metrics.availableEmployees}
            color="#10b981"
            bgColor="#d1fae5"
          />
          <MetricCard
            icon={Building2}
            label="Totaal Klanten"
            value={metrics.totalClients}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
          <MetricCard
            icon={TrendingUp}
            label="Actieve Klanten"
            value={metrics.activeClients}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </div>

        {/* Charts Section */}
        <div className="charts-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Hierarchy Distribution */}
          <ChartCard title="Medewerkers per Hiërarchie">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={hierarchyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {hierarchyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Industry Distribution */}
          <ChartCard title="Klanten per Branche">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0050ff" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Second Row of Charts */}
        <div className="charts-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Utilization Trend */}
          <ChartCard title="Medewerker Bezetting (6 maanden)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#0050ff" 
                  strokeWidth={2}
                  name="Bezetting %"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Clients */}
          <ChartCard title="Top 5 Klanten (per medewerker)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClientsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="employees" fill="#8ae1f4" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Quick Stats & Recent Activity */}
        <div className="quick-stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Quick Stats */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Activity style={{ width: '20px', height: '20px' }} />
              Snelle Statistieken
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <StatRow
                icon={Briefcase}
                label="Gem. medewerkers per klant"
                value={quickStats.avgEmployeesPerClient}
              />
              <StatRow
                icon={Award}
                label="Meest voorkomende skill"
                value={quickStats.mostCommonSkill}
              />
              <StatRow
                icon={Calendar}
                label="Drukste maand"
                value={quickStats.busiestMonth}
              />
              <StatRow
                icon={DollarSign}
                label="Totale contractwaarde"
                value={`€${quickStats.totalContractValue.toLocaleString('nl-NL')}`}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock style={{ width: '20px', height: '20px' }} />
              Recente Toewijzingen
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))
              ) : (
                <p style={{ color: '#999', fontSize: '0.9rem' }}>
                  Geen recente activiteit
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="metric-card" style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 255, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: bgColor,
        opacity: 0.3
      }}></div>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <Icon style={{ width: '24px', height: '24px', color }} />
        </div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: color,
          marginBottom: '0.25rem',
          lineHeight: '1'
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: '#666',
          fontWeight: 500
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card" style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 255, 0.1)'
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--primary)',
        marginBottom: '1.5rem'
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function StatRow({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.15rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#333' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      borderLeft: '3px solid var(--primary)'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: activity.is_active ? '#10b981' : '#999',
        marginTop: '0.5rem',
        flexShrink: 0
      }}></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem', color: '#333', marginBottom: '0.25rem' }}>
          <strong>{activity.employees?.name || 'Unknown'}</strong> toegewezen aan{' '}
          <strong>{activity.clients?.name || 'Unknown'}</strong>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>
          {formatDate(activity.start_date)}
          {activity.project_name && ` • ${activity.project_name}`}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="skeleton" style={{
          height: '60px',
          backgroundColor: '#e5e7eb',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}></div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{
              height: '120px',
              backgroundColor: '#e5e7eb',
              borderRadius: '12px'
            }}></div>
          ))}
        </div>
      </div>
    </div>
  )
}

