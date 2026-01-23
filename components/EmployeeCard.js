import Link from 'next/link'
import Tag from './Tag'

export default function EmployeeCard({ employee, isDimmed = false }) {
  const statusColor = employee.currentClient 
    ? 'var(--secondary-blue)' 
    : 'var(--secondary-yellow)'
  
  const statusText = employee.currentClient || 'Available'

  // Format project start date
  const formatStartDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  // Calculate duration from start date to now
  const calculateDuration = (dateString) => {
    if (!dateString) return null
    try {
      const startDate = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - startDate)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `${months} month${months !== 1 ? 's' : ''}`
      } else {
        const years = Math.floor(diffDays / 365)
        const remainingMonths = Math.floor((diffDays % 365) / 30)
        if (remainingMonths > 0) {
          return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
        }
        return `${years} year${years !== 1 ? 's' : ''}`
      }
    } catch {
      return null
    }
  }

  const startDate = formatStartDate(employee.projectStartDate)
  const duration = calculateDuration(employee.projectStartDate)

  return (
    <Link href={`/employee/${employee.id}`}>
      <div className={`employee-card ${isDimmed ? 'dimmed' : ''}`}>
        {/* Top Row: Name on left, Profile Picture on right */}
        <div className="employee-card-top-row">
          <div className="employee-card-name-section">
            <h3 className="employee-card-name">{employee.name}</h3>
            <div className="employee-card-function">{employee.hierarchy}</div>
          </div>
          
          {/* Profile Picture Circle - Always shown, same size */}
          <div className="employee-card-avatar">
            {employee.profilePicture ? (
              <>
                <img 
                  src={employee.profilePicture} 
                  alt={employee.name}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="employee-card-avatar-fallback" style={{ display: 'none' }}>
                  {employee.name.charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <div className="employee-card-avatar-fallback">
                {employee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        {/* Middle Section: Location and Client Status */}
        <div className="employee-card-middle">
          <div className="employee-card-location">
            📍 {employee.location}
          </div>
          
          <div className="employee-card-status" style={{ backgroundColor: statusColor }}>
            {statusText}
            {startDate && employee.currentClient && (
              <span className="employee-card-start-date">
                {' • Started ' + startDate}
                {duration && ` (${duration})`}
              </span>
            )}
          </div>
        </div>
        
        {/* Bottom: Skills */}
        <div className="employee-card-skills">
          {employee.skills.map((skill, index) => (
            <Tag key={index} text={skill} />
          ))}
        </div>
      </div>
    </Link>
  )
}
