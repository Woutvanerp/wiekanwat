# Dashboard Technical Documentation

## Architecture Overview

### File Structure
```
app/dashboard/
├── page.js          # Main dashboard component (1800+ lines)
└── dashboard.css    # Styles and animations
```

### Technology Stack
- **Framework:** Next.js 14 App Router (`'use client'`)
- **Database:** Supabase (PostgreSQL)
- **Charts:** Recharts 2.x
- **Icons:** lucide-react
- **Styling:** CSS with CSS variables + inline styles
- **State Management:** React Hooks
- **Routing:** Next.js `useRouter`
- **Storage:** Browser localStorage

---

## Component Hierarchy

```
DashboardPage (Main Component)
├── CustomizeModal
├── Header Controls
│   ├── Date Range Dropdown
│   ├── Manual Refresh Button
│   └── Customize Button
├── MetricCard (×4)
├── ChartCard
│   ├── PieChart (Hierarchy)
│   ├── BarChart (Industry)
│   ├── LineChart (Utilization)
│   └── BarChart (Top Clients)
├── Quick Stats Section
└── Recent Activity Section

Supporting Components:
├── LoadingSkeleton
├── CustomTooltip
├── StatRow
├── ActivityItem
└── CustomizeModal
```

---

## State Management

### Core State Variables

```javascript
// Loading states
const [loading, setLoading] = useState(true)
const [refreshing, setRefreshing] = useState(false)
const [error, setError] = useState(null)
const [lastUpdated, setLastUpdated] = useState(null)

// Data states
const [metrics, setMetrics] = useState({...})
const [previousMetrics, setPreviousMetrics] = useState({...})
const [hierarchyData, setHierarchyData] = useState([])
const [industryData, setIndustryData] = useState([])
const [utilizationData, setUtilizationData] = useState([])
const [topClientsData, setTopClientsData] = useState([])
const [quickStats, setQuickStats] = useState({...})
const [recentActivity, setRecentActivity] = useState([])

// Feature states
const [selectedDateRange, setSelectedDateRange] = useState('all')
const [showCustomizeModal, setShowCustomizeModal] = useState(false)
const [visibleWidgets, setVisibleWidgets] = useState(() => {
  // Initialized from localStorage
})
const [showDateDropdown, setShowDateDropdown] = useState(false)
```

### Data Flow

```
User Action / Timer
       ↓
fetchDashboardData()
       ↓
Supabase Queries (3 tables)
       ↓
Calculate Functions
       ↓
setState() calls
       ↓
React Re-render
       ↓
UI Updates
```

---

## Feature Implementation Details

### 1. Skeleton Loading

**Component:** `LoadingSkeleton()`

**CSS Classes:**
- `.skeleton-shimmer` - Shimmer animation
- Uses `@keyframes shimmer` for gradient sweep

**Rendering Logic:**
```javascript
if (loading) {
  return <LoadingSkeleton />
}
```

**Key Elements:**
- Header skeleton (title + subtitle)
- 4 metric card skeletons in grid
- 4 chart skeletons in grid
- 2 activity section skeletons

---

### 2. Auto-Refresh

**Implementation:**
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    fetchDashboardData(true) // silent = true
  }, 180000) // 3 minutes
  
  return () => clearInterval(interval) // Cleanup
}, [selectedDateRange])
```

**Silent Refresh Logic:**
```javascript
async function fetchDashboardData(silent = false) {
  if (!silent) {
    setLoading(true) // Shows skeleton
  } else {
    setRefreshing(true) // Shows indicator only
  }
  // ... fetch data
}
```

**Visual Indicator:**
```javascript
<div style={{
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: refreshing ? '#f59e0b' : '#10b981',
  animation: refreshing ? 'pulse 2s infinite' : 'none'
}} />
```

---

### 3. Date Range Filter

**Data Structure:**
```javascript
const DATE_RANGES = [
  { label: 'Laatste 7 dagen', value: 'week', days: 7 },
  { label: 'Laatste 30 dagen', value: 'month', days: 30 },
  { label: 'Laatste 3 maanden', value: '3months', days: 90 },
  { label: 'Laatste 6 maanden', value: '6months', days: 180 },
  { label: 'Laatste jaar', value: 'year', days: 365 },
  { label: 'Alle tijd', value: 'all', days: null }
]
```

**Filter Calculation:**
```javascript
const getDateFilter = useCallback(() => {
  const range = DATE_RANGES.find(r => r.value === selectedDateRange)
  if (!range || !range.days) return null
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - range.days)
  return startDate.toISOString()
}, [selectedDateRange])
```

**Supabase Query:**
```javascript
let query = supabase.from('clients').select('*')
if (dateFilter) {
  query = query.gte('created_at', dateFilter)
}
```

---

### 4. Custom Tooltips

**Component:** `CustomTooltip({ active, payload, type })`

**Types:**
- `hierarchy` - For pie chart
- `industry` - For industry bar chart
- `utilization` - For line chart
- `topClients` - For top clients bar chart

**Usage:**
```javascript
<Tooltip content={<CustomTooltip type="hierarchy" />} />
```

**Styling:**
```javascript
style={{
  backgroundColor: 'white',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  border: '1px solid #e5e7eb'
}}
```

---

### 5. Metric Comparisons

**Calculation Function:**
```javascript
const calculateChange = (current, previous) => {
  if (previous === 0) return { percent: 0, direction: 'none' }
  const change = ((current - previous) / previous * 100).toFixed(1)
  return {
    percent: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'none',
    value: current - previous
  }
}
```

**Previous Metrics Calculation:**
```javascript
async function calculatePreviousMetrics(employees, clients, relationships) {
  // Calculate date range for previous period
  const endDate = new Date()
  endDate.setDate(endDate.getDate() - range.days)
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - range.days)
  
  // Fetch data from previous period
  const { data: prevRelationships } = await supabase
    .from('employee_clients')
    .select('*')
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())
  
  // Calculate and set previous metrics
}
```

**Rendering:**
```javascript
{change && change.direction !== 'none' && (
  <div style={{ color: change.direction === 'up' ? '#10b981' : '#ef4444' }}>
    {change.direction === 'up' ? <TrendingUp /> : <TrendingDown />}
    <span>{change.percent}%</span>
    <span>({change.direction === 'up' ? '+' : ''}{change.value})</span>
  </div>
)}
```

---

### 6. Drill-Down (Interactive Charts)

**Router Setup:**
```javascript
const router = useRouter()
```

**Click Handlers:**
```javascript
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
```

**Chart Configuration:**
```javascript
<Pie
  data={hierarchyData}
  onClick={handleHierarchyClick}
  cursor="pointer"
  // ... other props
>
  {hierarchyData.map((entry, index) => (
    <Cell 
      key={`cell-${index}`}
      onMouseEnter={(e) => e.target.style.opacity = '0.8'}
      onMouseLeave={(e) => e.target.style.opacity = '1'}
    />
  ))}
</Pie>
```

---

### 7. Customizable Dashboard

**localStorage Integration:**
```javascript
// Initialize from localStorage
const [visibleWidgets, setVisibleWidgets] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dashboardWidgets')
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS
  }
  return DEFAULT_WIDGETS
})

// Save to localStorage on change
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dashboardWidgets', JSON.stringify(visibleWidgets))
  }
}, [visibleWidgets])
```

**Toggle Function:**
```javascript
const toggleWidget = (widgetKey) => {
  setVisibleWidgets(prev => ({
    ...prev,
    [widgetKey]: !prev[widgetKey]
  }))
}
```

**Conditional Rendering:**
```javascript
{visibleWidgets.employeeMetrics && (
  <MetricCard {...props} />
)}
```

**Modal Component:**
```javascript
function CustomizeModal({ visibleWidgets, toggleWidget, resetWidgets, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{...}} />
      
      {/* Modal Content */}
      <div style={{...}}>
        {/* Checkboxes */}
        {widgets.map(widget => (
          <label>
            <input 
              type="checkbox"
              checked={visibleWidgets[widget.key]}
              onChange={() => toggleWidget(widget.key)}
            />
            {widget.label}
          </label>
        ))}
        
        {/* Actions */}
        <button onClick={resetWidgets}>Reset</button>
        <button onClick={onClose}>Save</button>
      </div>
    </>
  )
}
```

---

## Database Schema

### Tables Used

#### `employees`
```sql
- id (int, primary key)
- name (text)
- hierarchy (text)  -- "Junior", "Medior", "Senior", etc.
- skills (jsonb)     -- Array of strings
- ... other fields
```

#### `clients`
```sql
- id (int, primary key)
- name (text)
- industry (text)
- status (text)      -- "Active" or "Inactive"
- annual_value (numeric)
- created_at (timestamp)
- ... other fields
```

#### `employee_clients`
```sql
- id (int, primary key)
- employee_id (int, foreign key)
- client_id (int, foreign key)
- start_date (date)
- end_date (date, nullable)
- is_active (boolean)
- project_name (text)
- ... other fields
```

### Queries

**Fetch All Data:**
```javascript
// Employees
const { data: employees } = await supabase
  .from('employees')
  .select('*')

// Clients (with date filter)
const { data: clients } = await supabase
  .from('clients')
  .select('*')
  .gte('created_at', dateFilter) // Optional

// Relationships
const { data: relationships } = await supabase
  .from('employee_clients')
  .select(`
    *,
    employees (name),
    clients (name)
  `)
  .order('start_date', { ascending: false })
  .gte('start_date', dateFilter) // Optional
```

---

## Calculation Functions

### `calculateMetrics()`
Calculates:
- Total employees (count)
- Available employees (not in active relationships)
- Total clients (count)
- Active clients (status = 'Active')

### `calculateHierarchyDistribution()`
Groups employees by hierarchy level, returns:
```javascript
[
  { name: "Junior", value: 5 },
  { name: "Medior", value: 12 },
  { name: "Senior", value: 8 }
]
```

### `calculateIndustryDistribution()`
Groups clients by industry, returns:
```javascript
[
  { industry: "Technology", count: 8 },
  { industry: "Finance", count: 5 },
  { industry: "Healthcare", count: 3 }
]
```

### `calculateUtilizationTrend()`
Calculates utilization for last 6 months:
```javascript
[
  { 
    month: "Jan", 
    monthYear: "2026-01",
    utilization: 75.5,
    count: 38
  },
  // ... 5 more months
]
```

### `calculateTopClients()`
Finds top 5 clients by active employee count:
```javascript
[
  { id: 1, name: "Acme Corp", employees: 12 },
  { id: 5, name: "TechStart", employees: 8 },
  // ... up to 5 clients
]
```

### `calculateQuickStats()`
Calculates:
- Average employees per client
- Most common skill (from employee skills array)
- Busiest month (most assignments started)
- Total contract value (sum of active clients)

---

## Performance Optimizations

### 1. useCallback for Memoization
```javascript
const getDateFilter = useCallback(() => {
  // Expensive calculation
}, [selectedDateRange])
```

### 2. Conditional Rendering
```javascript
{visibleWidgets.chartName && <ExpensiveChart />}
```

### 3. Efficient Queries
- Fetch all data at once (3 queries total)
- Use date filters at database level
- Select only needed fields with join

### 4. Silent Refresh
- Doesn't show full loading skeleton
- Updates data in background
- Smooth number transitions

### 5. Cleanup
```javascript
return () => clearInterval(interval)
```

---

## Styling System

### CSS Variables
```css
:root {
  --primary: #0050ff;
  /* Other variables defined in globals.css */
}
```

### Animation Classes
- `.skeleton-shimmer` - Loading animation
- `.widget-fade-in` - Widget appearance
- `.dashboard-container` - Page fade-in

### Keyframe Animations
```css
@keyframes pulse { ... }
@keyframes fadeIn { ... }
@keyframes slideUp { ... }
@keyframes spin { ... }
@keyframes shimmer { ... }
```

### Responsive Breakpoints
- `1100px` - Charts stack
- `768px` - 2-column metrics, stacked charts
- `480px` - Single column everything

---

## Event Handlers

### Click Events
```javascript
onClick={() => setShowCustomizeModal(true)}
onClick={handleManualRefresh}
onClick={(data) => handleHierarchyClick(data)}
```

### Hover Events
```javascript
onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
```

### Dropdown Outside Click
```javascript
{showDateDropdown && (
  <div 
    onClick={() => setShowDateDropdown(false)}
    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
  />
)}
```

---

## Error Handling

### Try-Catch Pattern
```javascript
try {
  setLoading(true)
  setError(null)
  
  // Fetch data...
  
  setLoading(false)
} catch (err) {
  console.error('Error:', err)
  setError(err.message)
  setLoading(false)
}
```

### Error Display
```javascript
if (error) {
  return (
    <div>
      <p style={{ color: '#dc2626' }}>
        Error loading dashboard: {error}
      </p>
      <button onClick={handleManualRefresh}>
        Probeer opnieuw
      </button>
    </div>
  )
}
```

---

## Testing Considerations

### Unit Tests
Test these functions:
- `calculateChange()` - Various inputs
- `getDateFilter()` - All date ranges
- `calculateMetrics()` - With mock data
- All calculation functions

### Integration Tests
Test:
- Data fetching flow
- localStorage persistence
- Router navigation
- Chart interactions

### E2E Tests
Test:
- Full page load
- Date filter changes
- Widget toggle
- Chart drill-down
- Auto-refresh

---

## Browser Compatibility

### Required Features
- ✅ ES6+ (const, let, arrow functions)
- ✅ Async/await
- ✅ localStorage
- ✅ CSS animations
- ✅ Flexbox & Grid
- ✅ SVG (for charts)

### Polyfills Needed
- None (Next.js handles it)

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Future Enhancements

### Possible Additions
1. **Export to PDF/Excel**
   - Generate reports
   - Download data

2. **Custom Date Range Picker**
   - Calendar UI
   - Select any start/end date

3. **Real-time WebSocket Updates**
   - Live data without polling
   - Instant notifications

4. **Dashboard Templates**
   - Save multiple layouts
   - Quick switching

5. **Annotations**
   - Add notes to charts
   - Mark important events

6. **Comparison Mode**
   - Compare two time periods side-by-side
   - Overlay on charts

7. **Alerts & Notifications**
   - Set thresholds
   - Email/push notifications

8. **Data Export**
   - CSV download
   - API endpoint for data

---

## Debugging Tips

### Enable Debug Logging
```javascript
const DEBUG = true

if (DEBUG) {
  console.log('Fetching data with filter:', dateFilter)
  console.log('Metrics:', metrics)
  console.log('Previous metrics:', previousMetrics)
}
```

### Common Issues

**Problem:** Charts not rendering
- Check if data array is empty
- Verify dataKey matches object keys
- Console.log the data prop

**Problem:** Date filter not working
- Check if created_at column exists
- Verify date format (ISO string)
- Check Supabase query in Network tab

**Problem:** localStorage not persisting
- Check browser privacy settings
- Verify typeof window checks
- Look for localStorage errors in console

**Problem:** Auto-refresh not working
- Check interval cleanup
- Verify dependency array
- Test with shorter interval (e.g., 10 seconds)

---

## Code Quality

### Linting
```bash
npm run lint
```

### Formatting
- Consistent indentation (2 spaces)
- Clear variable names
- Comments for complex logic

### Best Practices
- ✅ Proper cleanup in useEffect
- ✅ Error boundaries (implicit in Next.js)
- ✅ Accessibility (focus states, ARIA)
- ✅ Performance (memoization, conditional rendering)
- ✅ Type safety (JSDoc comments could be added)

---

## Deployment Checklist

- [ ] Test all 7 features
- [ ] Verify Supabase connection
- [ ] Check environment variables
- [ ] Test on mobile devices
- [ ] Verify all charts render
- [ ] Test localStorage in incognito
- [ ] Check console for errors
- [ ] Test with slow network (throttling)
- [ ] Verify date filters work
- [ ] Test chart drill-downs
- [ ] Confirm auto-refresh works
- [ ] Test customization modal
- [ ] Verify skeleton loading

---

## Maintenance

### Regular Tasks
- Monitor Supabase query performance
- Check for browser console errors
- Update Recharts if needed
- Review and update date ranges
- Optimize queries if data grows

### When to Update
- New dashboard requirements
- Performance issues
- Browser compatibility changes
- Design system updates

---

## Support & Documentation

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Recharts Docs](https://recharts.org/)
- [Supabase Docs](https://supabase.com/docs)
- [lucide-react Icons](https://lucide.dev/)

### Contact
- See DASHBOARD_USER_GUIDE.md for user-facing docs
- See DASHBOARD_ENHANCEMENTS.md for feature overview

---

**Last Updated:** January 31, 2026  
**Version:** 2.0 (Enhanced with 7 features)  
**Maintained by:** Development Team

