// Client-side storage utilities using localStorage
// Simple persistence for the planning tool

const STORAGE_KEY = 'wiekanwat_employees'

export function loadEmployees() {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading employees from localStorage:', error)
    return []
  }
}

export function saveEmployees(employees) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
  } catch (error) {
    console.error('Error saving employees to localStorage:', error)
  }
}

export function addEmployee(employee) {
  const employees = loadEmployees()
  const newEmployee = {
    ...employee,
    id: Date.now().toString(), // Simple ID generation
  }
  employees.push(newEmployee)
  saveEmployees(employees)
  return newEmployee
}

export function updateEmployee(id, updates) {
  const employees = loadEmployees()
  const index = employees.findIndex(emp => emp.id === id)
  if (index === -1) return null
  
  employees[index] = { ...employees[index], ...updates }
  saveEmployees(employees)
  return employees[index]
}

export function deleteEmployee(id) {
  const employees = loadEmployees()
  const filtered = employees.filter(emp => emp.id !== id)
  saveEmployees(filtered)
  return filtered
}

export function getEmployeeById(id) {
  const employees = loadEmployees()
  return employees.find(emp => emp.id === id)
}

