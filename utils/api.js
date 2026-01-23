// API utility functions for communicating with Next.js API routes
// These functions replace the localStorage-based storage utilities

const API_BASE = '/api/employees'

/**
 * Fetch all employees from the API
 * @returns {Promise<Array>} Array of employee objects
 */
export async function fetchEmployees() {
  try {
    // Add timeout to fetch request (15 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const response = await fetch(API_BASE, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      let errorText = ''
      try {
        const errorData = await response.json()
        errorText = errorData.details || errorData.error || response.statusText
      } catch {
        errorText = await response.text() || response.statusText
      }
      throw new Error(`Failed to fetch employees: ${errorText}`)
    }
    
    const result = await response.json()
    
    // Handle case where data might be undefined or not an array
    if (!result || !result.data) {
      console.warn('API returned unexpected format:', result)
      return []
    }
    
    // Ensure data is an array before mapping
    const employees = Array.isArray(result.data) ? result.data : []
    
    // Transform API response to match frontend format
    return employees.map(transformEmployeeFromAPI)
  } catch (error) {
    console.error('Error fetching employees:', error)
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    throw error
  }
}

/**
 * Fetch a single employee by ID from the API
 * @param {string} id - Employee UUID
 * @returns {Promise<Object>} Employee object
 */
export async function fetchEmployeeById(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch employee: ${response.statusText}`)
    }
    
    const result = await response.json()
    return transformEmployeeFromAPI(result.data)
  } catch (error) {
    console.error('Error fetching employee:', error)
    throw error
  }
}

/**
 * Create a new employee via API
 * @param {Object} employee - Employee data (frontend format)
 * @returns {Promise<Object>} Created employee object
 */
export async function createEmployee(employee) {
  try {
    // Transform frontend format to API format
    const apiData = transformEmployeeToAPI(employee)
    
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.details || `Failed to create employee: ${response.statusText}`)
    }
    
    const result = await response.json()
    return transformEmployeeFromAPI(result.data)
  } catch (error) {
    console.error('Error creating employee:', error)
    throw error
  }
}

/**
 * Update an existing employee via API
 * @param {string} id - Employee UUID
 * @param {Object} updates - Partial employee data to update (frontend format)
 * @returns {Promise<Object>} Updated employee object
 */
export async function updateEmployee(id, updates) {
  try {
    // Transform frontend format to API format
    const apiData = transformEmployeeToAPI(updates)
    
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 404) {
        throw new Error('Employee not found')
      }
      throw new Error(errorData.details || `Failed to update employee: ${response.statusText}`)
    }
    
    const result = await response.json()
    return transformEmployeeFromAPI(result.data)
  } catch (error) {
    console.error('Error updating employee:', error)
    throw error
  }
}

/**
 * Delete an employee via API
 * @param {string} id - Employee UUID
 * @returns {Promise<void>}
 */
export async function deleteEmployee(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 404) {
        throw new Error('Employee not found')
      }
      throw new Error(errorData.details || `Failed to delete employee: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting employee:', error)
    throw error
  }
}

/**
 * Transform employee data from API format to frontend format
 * API uses: current_client, cv
 * Frontend uses: currentClient, cvSummary
 */
function transformEmployeeFromAPI(apiEmployee) {
  if (!apiEmployee) return null
  
  return {
    id: apiEmployee.id,
    name: apiEmployee.name,
    location: apiEmployee.location,
    hierarchy: apiEmployee.hierarchy,
    skills: apiEmployee.skills || [],
    currentClient: apiEmployee.current_client || null,
    cvSummary: apiEmployee.cv || null,
    profilePicture: apiEmployee.profile_picture || null,
    projectStartDate: apiEmployee.project_start_date || null,
  }
}

/**
 * Transform employee data from frontend format to API format
 * Frontend uses: currentClient, cvSummary
 * API uses: current_client, cv
 */
function transformEmployeeToAPI(frontendEmployee) {
  const apiData = {}
  
  if (frontendEmployee.name !== undefined) {
    apiData.name = frontendEmployee.name
  }
  if (frontendEmployee.location !== undefined) {
    apiData.location = frontendEmployee.location
  }
  if (frontendEmployee.hierarchy !== undefined) {
    apiData.hierarchy = frontendEmployee.hierarchy
  }
  if (frontendEmployee.skills !== undefined) {
    apiData.skills = frontendEmployee.skills
  }
  if (frontendEmployee.currentClient !== undefined) {
    apiData.current_client = frontendEmployee.currentClient || null
  }
  if (frontendEmployee.cvSummary !== undefined) {
    apiData.cv = frontendEmployee.cvSummary || null
  }
  if (frontendEmployee.profilePicture !== undefined) {
    apiData.profile_picture = frontendEmployee.profilePicture || null
  }
  if (frontendEmployee.projectStartDate !== undefined) {
    apiData.project_start_date = frontendEmployee.projectStartDate || null
  }
  
  return apiData
}

// ========== CLIENT API FUNCTIONS ==========

const CLIENTS_API_BASE = '/api/clients'

/**
 * Fetch all clients from the API
 * @returns {Promise<Array>} Array of client objects
 */
export async function fetchClients() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const response = await fetch(CLIENTS_API_BASE, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      let errorText = ''
      try {
        const errorData = await response.json()
        errorText = errorData.details || errorData.error || response.statusText
      } catch {
        errorText = await response.text() || response.statusText
      }
      throw new Error(`Failed to fetch clients: ${errorText}`)
    }
    
    const result = await response.json()
    
    if (!result || !result.data) {
      console.warn('API returned unexpected format:', result)
      return []
    }
    
    const clients = Array.isArray(result.data) ? result.data : []
    return clients.map(transformClientFromAPI)
  } catch (error) {
    console.error('Error fetching clients:', error)
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    throw error
  }
}

/**
 * Fetch a single client by ID from the API
 * @param {string} id - Client ID
 * @returns {Promise<Object>} Client object
 */
export async function fetchClientById(id) {
  try {
    const response = await fetch(`${CLIENTS_API_BASE}/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch client: ${response.statusText}`)
    }
    
    const result = await response.json()
    return transformClientFromAPI(result.data)
  } catch (error) {
    console.error('Error fetching client:', error)
    throw error
  }
}

/**
 * Create a new client via API
 * @param {Object} client - Client data
 * @returns {Promise<Object>} Created client object
 */
export async function createClient(client) {
  try {
    const apiData = transformClientToAPI(client)
    
    const response = await fetch(CLIENTS_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.details || `Failed to create client: ${response.statusText}`)
    }
    
    const result = await response.json()
    return transformClientFromAPI(result.data)
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

/**
 * Update an existing client via API
 * @param {string} id - Client ID
 * @param {Object} updates - Partial client data to update
 * @returns {Promise<Object>} Updated client object
 */
export async function updateClient(id, updates) {
  try {
    const apiData = transformClientToAPI(updates)
    
    const response = await fetch(`${CLIENTS_API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 404) {
        throw new Error('Client not found')
      }
      throw new Error(errorData.details || `Failed to update client: ${response.statusText}`)
    }
    
    const result = await response.json()
    return transformClientFromAPI(result.data)
  } catch (error) {
    console.error('Error updating client:', error)
    throw error
  }
}

/**
 * Delete a client via API
 * @param {string} id - Client ID
 * @returns {Promise<void>}
 */
export async function deleteClient(id) {
  try {
    const response = await fetch(`${CLIENTS_API_BASE}/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 404) {
        throw new Error('Client not found')
      }
      throw new Error(errorData.details || `Failed to delete client: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting client:', error)
    throw error
  }
}

/**
 * Translate status from English (database) to Dutch (frontend)
 */
function translateStatusToNL(status) {
  const statusMap = {
    'Active': 'Actief',
    'Inactive': 'Inactief',
    'Potential': 'Potentieel'
  }
  return statusMap[status] || status
}

/**
 * Translate status from Dutch (frontend) to English (database)
 */
function translateStatusToEN(status) {
  const statusMap = {
    'Actief': 'Active',
    'Inactief': 'Inactive',
    'Potentieel': 'Potential'
  }
  return statusMap[status] || status
}

/**
 * Transform client data from API format to frontend format
 */
function transformClientFromAPI(apiClient) {
  if (!apiClient) return null
  
  return {
    id: apiClient.id,
    name: apiClient.name,
    description: apiClient.description || '',
    logo: apiClient.logo || null,
    industry: apiClient.industry || 'Technology',
    status: translateStatusToNL(apiClient.status || 'Active'),
    employees_assigned: apiClient.employees_assigned || 0,
    active_teams: apiClient.active_teams || 0,
    contract_start: apiClient.contract_start || null,
    contract_duration: apiClient.contract_duration || null,
    annual_value: apiClient.annual_value || null,
    primary_contact: apiClient.primary_contact || null,
    contact_email: apiClient.contact_email || null,
    contact_phone: apiClient.contact_phone || null,
    requestedPositions: apiClient.requested_positions || [],
    createdAt: apiClient.created_at,
    updatedAt: apiClient.updated_at
  }
}

/**
 * Transform client data from frontend format to API format
 */
function transformClientToAPI(frontendClient) {
  const apiData = {}
  
  if (frontendClient.name !== undefined) {
    apiData.name = frontendClient.name
  }
  if (frontendClient.description !== undefined) {
    apiData.description = frontendClient.description
  }
  if (frontendClient.logo !== undefined) {
    apiData.logo = frontendClient.logo
  }
  if (frontendClient.industry !== undefined) {
    apiData.industry = frontendClient.industry
  }
  if (frontendClient.status !== undefined) {
    apiData.status = translateStatusToEN(frontendClient.status)
  }
  if (frontendClient.employees_assigned !== undefined) {
    apiData.employees_assigned = frontendClient.employees_assigned
  }
  if (frontendClient.active_teams !== undefined) {
    apiData.active_teams = frontendClient.active_teams
  }
  if (frontendClient.contract_start !== undefined) {
    apiData.contract_start = frontendClient.contract_start
  }
  if (frontendClient.contract_duration !== undefined) {
    apiData.contract_duration = frontendClient.contract_duration
  }
  if (frontendClient.annual_value !== undefined) {
    apiData.annual_value = frontendClient.annual_value
  }
  if (frontendClient.primary_contact !== undefined) {
    apiData.primary_contact = frontendClient.primary_contact
  }
  if (frontendClient.contact_email !== undefined) {
    apiData.contact_email = frontendClient.contact_email
  }
  if (frontendClient.contact_phone !== undefined) {
    apiData.contact_phone = frontendClient.contact_phone
  }
  if (frontendClient.requestedPositions !== undefined) {
    apiData.requested_positions = frontendClient.requestedPositions
  }
  
  return apiData
}

