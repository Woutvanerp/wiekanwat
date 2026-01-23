// Simplified data model for internal planning tool
// App starts empty - users add people via the interface

// Locations
export const locations = ['Eindhoven', 'Maastricht']

// Hierarchy levels (informational only - no visual connectors)
export const hierarchyLevels = [
  'Boss',
  'Managing Director',
  'Managing Consultant',
  'Principal Consultant',
  'Senior Consultant',
  'Consultant',
  'Werkstudent'
]

// Hierarchy labels for display
export const hierarchyLabels = {
  'Boss': 'Boss',
  'Managing Director': 'Managing Director',
  'Managing Consultant': 'Managing Consultant',
  'Principal Consultant': 'Principal Consultant',
  'Senior Consultant': 'Senior Consultant',
  'Consultant': 'Consultant',
  'Werkstudent': 'Werkstudent'
}

// Hierarchy order for display
export const hierarchyOrder = [
  'Boss',
  'Managing Director',
  'Managing Consultant',
  'Principal Consultant',
  'Senior Consultant',
  'Consultant',
  'Werkstudent'
]

// Helper function to get all unique skills from employees
export function getAllSkills(employees) {
  if (!Array.isArray(employees)) return []
  const skillSet = new Set()
  employees.forEach(emp => {
    if (emp && Array.isArray(emp.skills)) {
      emp.skills.forEach(skill => skillSet.add(skill))
    }
  })
  return Array.from(skillSet).sort()
}

// Helper function to get all unique clients from employees
export function getAllClients(employees) {
  if (!Array.isArray(employees)) return []
  const clientSet = new Set()
  employees.forEach(emp => {
    if (emp && emp.currentClient) {
      clientSet.add(emp.currentClient)
    }
  })
  return Array.from(clientSet).sort()
}

// Helper function to get employee by ID
export function getEmployeeById(employees, id) {
  return employees.find(emp => emp.id === id)
}
