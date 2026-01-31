'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '../../utils/formatters'
import { 
  Users, 
  Building2, 
  TrendingUp,
  TrendingDown, 
  UserCheck, 
  DollarSign,
  Calendar,
  Briefcase,
  Award,
  Clock,
  Activity,
  RefreshCw,
  Settings,
  X,
  ChevronDown
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

// Default visible widgets
const DEFAULT_WIDGETS = {
  employeeMetrics: true,
  clientMetrics: true,
  hierarchyChart: true,
  industryChart: true,
  utilizationTimeline: true,
  topClients: true,
  recentActivity: true
}

// Date range options
const DATE_RANGES = [
  { label: 'Laatste 7 dagen', value: 'week', days: 7 },
  { label: 'Laatste 30 dagen', value: 'month', days: 30 },
  { label: 'Laatste 3 maanden', value: '3months', days: 90 },
  { label: 'Laatste 6 maanden', value: '6months', days: 180 },
  { label: 'Laatste jaar', value: 'year', days: 365 },
  { label: 'Alle tijd', value: 'all', days: null }
]

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  // Data states
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    availableEmployees: 0,
    totalClients: 0,
    activeClients: 0
  })
  const [previousMetrics, setPreviousMetrics] = useState({
    totalEmployees: 0,
    availableEmployees: 0,
    totalClients: 0,
    activeClients: 0
  })
  const [hierarchyData, setHierarchyData] = useState([])
  const [industryData, setIndustryData] = useState([])
  const [utilizationData, setUtilizationData] = useState([])
  const [topClientsData, setTopClientsData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  
  // Feature states
  const [selectedDateRange, setSelectedDateRange] = useState('all')
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [visibleWidgets, setVisibleWidgets] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardWidgets')
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS
    }
    return DEFAULT_WIDGETS
  })
  const [showDateDropdown, setShowDateDropdown] = useState(false)

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData(false)
  }, [selectedDateRange])

  // Auto-refresh every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true) // true = silent refresh
    }, 180000) // 3 minutes

    return () => clearInterval(interval)
  }, [selectedDateRange])

  // Save widget preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardWidgets', JSON.stringify(visibleWidgets))
    }
  }, [visibleWidgets])

  // Calculate date range filter
  const getDateFilter = useCallback(() => {
    const range = DATE_RANGES.find(r => r.value === selectedDateRange)
    if (!range || !range.days) return null
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - range.days)
    return startDate.toISOString()
  }, [selectedDateRange])

  async function fetchDashboardData(silent = false) {
    try {
      if (!silent) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)

      const dateFilter = getDateFilter()

      // Fetch all employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
      
      if (employeesError) throw employeesError

      // Fetch all clients
      let clientsQuery = supabase.from('clients').select('*')
      if (dateFilter) {
        clientsQuery = clientsQuery.gte('created_at', dateFilter)
      }
      const { data: clients, error: clientsError } = await clientsQuery
      
      if (clientsError) throw clientsError

      // Fetch employee-client relationships
      let relationshipsQuery = supabase
        .from('employee_clients')
        .select(`
          *,
          employees (name),
          clients (name)
        `)
        .order('start_date', { ascending: false })
      
      if (dateFilter) {
        relationshipsQuery = relationshipsQuery.gte('start_date', dateFilter)
      }
      
      const { data: relationships, error: relationshipsError } = await relationshipsQuery
      
      if (relationshipsError) throw relationshipsError

      // Calculate previous period metrics for comparison
      await calculatePreviousMetrics(employees, clients, relationships)

      // Calculate current metrics
      calculateMetrics(employees, clients, relationships)
      calculateHierarchyDistribution(employees)
      calculateIndustryDistribution(clients)
      calculateUtilizationTrend(relationships)
      calculateTopClients(clients, relationships)
      setRecentActivity(relationships.slice(0, 5))

      setLastUpdated(new Date())
      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function calculatePreviousMetrics(employees, clients, relationships) {
    try {
      const range = DATE_RANGES.find(r => r.value === selectedDateRange)
      if (!range || !range.days) {
        setPreviousMetrics(metrics)
        return
      }

      // Calculate date range for previous period
      const endDate = new Date()
      endDate.setDate(endDate.getDate() - range.days)
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - range.days)

      // Fetch previous period data
      const { data: prevRelationships } = await supabase
        .from('employee_clients')
        .select('*')
        .gte('start_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString())

      const { data: prevClients } = await supabase
        .from('clients')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Calculate previous metrics
      const prevActiveEmployeeIds = new Set(
        (prevRelationships || [])
          .filter(r => r.is_active)
          .map(r => r.employee_id)
      )
      const prevAvailableEmployees = employees.length - prevActiveEmployeeIds.size
      const prevActiveClients = (prevClients || []).filter(c => c.status === 'Actief').length

      setPreviousMetrics({
        totalEmployees: employees.length,
        availableEmployees: prevAvailableEmployees,
        totalClients: prevClients?.length || 0,
        activeClients: prevActiveClients
      })
    } catch (err) {
      console.error('Error calculating previous metrics:', err)
      setPreviousMetrics(metrics)
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
    const activeClients = clients.filter(c => c.status === 'Actief').length

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
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      // Count active relationships in that month
      const activeInMonth = relationships.filter(r => {
        const startDate = new Date(r.start_date)
        const endDate = r.end_date ? new Date(r.end_date) : new Date()
        return startDate <= date && endDate >= date
      }).length

      months.push({
        month: monthName,
        monthYear,
        utilization: activeInMonth > 0 ? Math.min(100, (activeInMonth / 50) * 100) : 0,
        count: activeInMonth
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
          id: parseInt(clientId),
          name: client?.name || 'Unknown',
          employees: count
        }
      })
      .sort((a, b) => b.employees - a.employees)
      .slice(0, 5)

    setTopClientsData(topClients)
  }

  // Calculate percentage change for comparison
  const calculateChange = (current, previous) => {
    if (previous === 0) return { percent: 0, direction: 'none' }
    const change = ((current - previous) / previous * 100).toFixed(1)
    return {
      percent: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'none',
      value: current - previous
    }
  }

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return ''
    const now = new Date()
    const diff = Math.floor((now - lastUpdated) / 1000 / 60) // minutes
    if (diff < 1) return 'Zojuist bijgewerkt'
    if (diff === 1) return '1 minuut geleden'
    if (diff < 60) return `${diff} minuten geleden`
    return lastUpdated.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  }

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchDashboardData(false)
  }

  // Chart click handlers (drill-down feature)
  const handleHierarchyClick = (data) => {
    router.push(`/employees?hierarchy=${encodeURIComponent(data.name)}`)
  }

  const handleIndustryClick = (data) => {
    router.push(`/clients?industry=${encodeURIComponent(data.industry)}`)
  }

  const handleTopClientClick = (data) => {
    if (data.id) {
      router.push(`/clients/${data.id}`)
    }
  }

  // Toggle widget visibility
  const toggleWidget = (widgetKey) => {
    setVisibleWidgets(prev => ({
      ...prev,
      [widgetKey]: !prev[widgetKey]
    }))
  }

  // Reset widgets to default
  const resetWidgets = () => {
    setVisibleWidgets(DEFAULT_WIDGETS)
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
        <button
          onClick={handleManualRefresh}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#0050ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Probeer opnieuw
        </button>
      </div>
    )
  }

  const currentRange = DATE_RANGES.find(r => r.value === selectedDateRange)

  return (
    <div className="dashboard-container" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
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

          {/* Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Date Range Filter */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#333',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0050ff'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <Calendar style={{ width: '16px', height: '16px' }} />
                {currentRange?.label || 'Selecteer periode'}
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>

              {showDateDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  zIndex: 50,
                  minWidth: '200px'
                }}>
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setSelectedDateRange(range.value)
                        setShowDateDropdown(false)
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: selectedDateRange === range.value ? '#f0f7ff' : 'white',
                        color: selectedDateRange === range.value ? '#0050ff' : '#333',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: selectedDateRange === range.value ? 600 : 400,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedDateRange !== range.value) {
                          e.currentTarget.style.backgroundColor = '#f8fafc'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedDateRange !== range.value) {
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#333',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!refreshing) e.currentTarget.style.borderColor = '#0050ff'
              }}
              onMouseLeave={(e) => {
                if (!refreshing) e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <RefreshCw 
                style={{ 
                  width: '16px', 
                  height: '16px',
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }} 
              />
              Vernieuwen
            </button>

            {/* Customize Button */}
            <button
              onClick={() => setShowCustomizeModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                backgroundColor: '#0050ff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0040cc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0050ff'}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
              Aanpassen
            </button>
          </div>
        </div>

        {/* Last Updated Indicator */}
        {lastUpdated && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: refreshing ? '#f59e0b' : '#10b981',
              animation: refreshing ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }}></div>
            {refreshing ? 'Gegevens vernieuwen...' : formatLastUpdated()}
          </div>
        )}

        {/* Metrics Cards */}
        {(visibleWidgets.employeeMetrics || visibleWidgets.clientMetrics) && (
          <div className="metrics-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {visibleWidgets.employeeMetrics && (
              <>
                <MetricCard
                  icon={Users}
                  label="Totaal Medewerkers"
                  value={metrics.totalEmployees}
                  color="#0050ff"
                  bgColor="#e6f0ff"
                  change={calculateChange(metrics.totalEmployees, previousMetrics.totalEmployees)}
                />
                <MetricCard
                  icon={UserCheck}
                  label="Beschikbare Medewerkers"
                  value={metrics.availableEmployees}
                  color="#10b981"
                  bgColor="#d1fae5"
                  change={calculateChange(metrics.availableEmployees, previousMetrics.availableEmployees)}
                />
              </>
            )}
            {visibleWidgets.clientMetrics && (
              <>
                <MetricCard
                  icon={Building2}
                  label="Totaal Klanten"
                  value={metrics.totalClients}
                  color="#8b5cf6"
                  bgColor="#ede9fe"
                  change={calculateChange(metrics.totalClients, previousMetrics.totalClients)}
                />
                <MetricCard
                  icon={TrendingUp}
                  label="Actieve Klanten"
                  value={metrics.activeClients}
                  color="#f59e0b"
                  bgColor="#fef3c7"
                  change={calculateChange(metrics.activeClients, previousMetrics.activeClients)}
                />
              </>
            )}
          </div>
        )}

        {/* Charts Section */}
        {(visibleWidgets.hierarchyChart || visibleWidgets.industryChart) && (
          <div className="charts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Hierarchy Distribution */}
            {visibleWidgets.hierarchyChart && (
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
                      onClick={handleHierarchyClick}
                      cursor="pointer"
                    >
                      {hierarchyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          style={{ transition: 'opacity 0.2s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip type="hierarchy" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Industry Distribution */}
            {visibleWidgets.industryChart && (
              <ChartCard title="Klanten per Branche">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="industry" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip type="industry" />} />
                    <Bar 
                      dataKey="count" 
                      fill="#0050ff"
                      onClick={handleIndustryClick}
                      cursor="pointer"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>
        )}

        {/* Second Row of Charts */}
        {(visibleWidgets.utilizationTimeline || visibleWidgets.topClients) && (
          <div className="charts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Utilization Trend */}
            {visibleWidgets.utilizationTimeline && (
              <ChartCard title="Medewerker Bezetting (6 maanden)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip type="utilization" />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="utilization" 
                      stroke="#0050ff" 
                      strokeWidth={3}
                      name="Bezetting %"
                      dot={{ r: 5, fill: '#0050ff' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Top Clients */}
            {visibleWidgets.topClients && (
              <ChartCard title="Top 5 Klanten (per medewerker)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topClientsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip content={<CustomTooltip type="topClients" />} />
                    <Bar 
                      dataKey="employees" 
                      fill="#8ae1f4"
                      onClick={handleTopClientClick}
                      cursor="pointer"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>
        )}

        {/* Quick Stats & Recent Activity */}
        {(visibleWidgets.quickStats || visibleWidgets.recentActivity) && (
          <div className="quick-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Recent Activity */}
            {visibleWidgets.recentActivity && (
              <div className="widget-fade-in" style={{
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
            )}
          </div>
        )}
      </div>

      {/* Customize Dashboard Modal */}
      {showCustomizeModal && (
        <CustomizeModal
          visibleWidgets={visibleWidgets}
          toggleWidget={toggleWidget}
          resetWidgets={resetWidgets}
          onClose={() => setShowCustomizeModal(false)}
        />
      )}

      {/* Click outside to close dropdown */}
      {showDateDropdown && (
        <div 
          onClick={() => setShowDateDropdown(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
        />
      )}
    </div>
  )
}

// Enhanced MetricCard with comparison
function MetricCard({ icon: Icon, label, value, color, bgColor, change }) {
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
          fontWeight: 500,
          marginBottom: '0.5rem'
        }}>
          {label}
        </div>
        
        {/* Comparison Indicator */}
        {change && change.direction !== 'none' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: change.direction === 'up' ? '#10b981' : '#ef4444'
          }}>
            {change.direction === 'up' ? (
              <TrendingUp style={{ width: '14px', height: '14px' }} />
            ) : (
              <TrendingDown style={{ width: '14px', height: '14px' }} />
            )}
            <span>{change.percent}%</span>
            <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: 400 }}>
              ({change.direction === 'up' ? '+' : ''}{change.value})
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card widget-fade-in" style={{
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

// Custom Tooltip Component for enhanced chart tooltips
function CustomTooltip({ active, payload, type }) {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0]

  const getTooltipContent = () => {
    switch (type) {
      case 'hierarchy':
        return (
          <>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#333' }}>
              {data.name}
            </p>
            <p style={{ color: '#0050ff', fontWeight: 600 }}>
              {data.value} medewerkers
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
              {((data.value / data.payload.value) * 100).toFixed(1)}% van totaal
            </p>
          </>
        )
      case 'industry':
        return (
          <>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#333' }}>
              {data.payload.industry}
            </p>
            <p style={{ color: '#0050ff', fontWeight: 600 }}>
              {data.value} klanten
            </p>
          </>
        )
      case 'utilization':
        return (
          <>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#333' }}>
              {data.payload.month}
            </p>
            <p style={{ color: '#0050ff', fontWeight: 600 }}>
              {data.value.toFixed(1)}% bezetting
            </p>
            {data.payload.count && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                {data.payload.count} actieve toewijzingen
              </p>
            )}
          </>
        )
      case 'topClients':
        return (
          <>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#333' }}>
              {data.payload.name}
            </p>
            <p style={{ color: '#0050ff', fontWeight: 600 }}>
              {data.value} medewerkers
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
              Klik om details te bekijken
            </p>
          </>
        )
      default:
        return <p>{data.value}</p>
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e5e7eb'
    }}>
      {getTooltipContent()}
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
      borderRadius: '8px',
      transition: 'all 0.2s'
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
      borderLeft: '3px solid var(--primary)',
      transition: 'all 0.2s'
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

// Customize Dashboard Modal
function CustomizeModal({ visibleWidgets, toggleWidget, resetWidgets, onClose }) {
  const widgets = [
    { key: 'employeeMetrics', label: 'Medewerker Metrics' },
    { key: 'clientMetrics', label: 'Klant Metrics' },
    { key: 'hierarchyChart', label: 'Hiërarchie Grafiek' },
    { key: 'industryChart', label: 'Branche Grafiek' },
    { key: 'utilizationTimeline', label: 'Bezetting Tijdlijn' },
    { key: 'topClients', label: 'Top Klanten' },
    { key: 'recentActivity', label: 'Recente Activiteit' }
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        zIndex: 101,
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Settings style={{ width: '24px', height: '24px' }} />
            Dashboard Aanpassen
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X style={{ width: '20px', height: '20px', color: '#666' }} />
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Selecteer welke widgets u wilt weergeven op uw dashboard
        </p>

        {/* Widget Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {widgets.map((widget) => (
            <label
              key={widget.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f7ff'
                e.currentTarget.style.borderColor = '#0050ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={visibleWidgets[widget.key]}
                onChange={() => toggleWidget(widget.key)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#0050ff'
                }}
              />
              <span style={{
                fontSize: '0.95rem',
                fontWeight: 500,
                color: '#333'
              }}>
                {widget.label}
              </span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={resetWidgets}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#666',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc'
              e.currentTarget.style.borderColor = '#0050ff'
              e.currentTarget.style.color = '#0050ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.color = '#666'
            }}
          >
            Reset naar Standaard
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#0050ff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'white',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0040cc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0050ff'}
          >
            Opslaan
          </button>
        </div>
      </div>
    </>
  )
}

// Enhanced Loading Skeleton
function LoadingSkeleton() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton-shimmer" style={{
            height: '40px',
            width: '200px',
            backgroundColor: '#e5e7eb',
            borderRadius: '8px',
            marginBottom: '0.5rem'
          }}></div>
          <div className="skeleton-shimmer" style={{
            height: '24px',
            width: '300px',
            backgroundColor: '#e5e7eb',
            borderRadius: '8px'
          }}></div>
        </div>

        {/* Metrics Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <div className="skeleton-shimmer" style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#e5e7eb',
                borderRadius: '10px',
                marginBottom: '1rem'
              }}></div>
              <div className="skeleton-shimmer" style={{
                height: '36px',
                width: '80px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                marginBottom: '0.5rem'
              }}></div>
              <div className="skeleton-shimmer" style={{
                height: '20px',
                width: '150px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px'
              }}></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <div className="skeleton-shimmer" style={{
                height: '24px',
                width: '200px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}></div>
              <div className="skeleton-shimmer" style={{
                height: '300px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px'
              }}></div>
            </div>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <div className="skeleton-shimmer" style={{
                height: '24px',
                width: '180px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}></div>
              {[1, 2, 3].map(j => (
                <div key={j} style={{ marginBottom: '1rem' }}>
                  <div className="skeleton-shimmer" style={{
                    height: '60px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px'
                  }}></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
