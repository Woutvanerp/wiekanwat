/**
 * Utility functions for managing many-to-many relationships between employees and clients
 * Uses the employee_clients junction table in Supabase
 */

import { supabase } from './supabase'

/**
 * Get all active employees assigned to a specific client
 * @param {number} clientId - The client ID (BIGINT)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getEmployeesByClient(clientId) {
  try {
    const { data, error } = await supabase
      .from('employee_clients')
      .select(`
        id,
        employee_id,
        client_id,
        start_date,
        project_name,
        is_active,
        created_at,
        employees:employee_id (
          id,
          name,
          location,
          hierarchy,
          skills,
          current_client,
          cv,
          profile_picture,
          project_start_date
        )
      `)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Error fetching employees by client:', error)
      return { data: null, error }
    }

    // Transform the data to flatten employee details
    const employees = data.map(assignment => ({
      assignmentId: assignment.id,
      startDate: assignment.start_date,
      projectName: assignment.project_name,
      isActive: assignment.is_active,
      ...assignment.employees
    }))

    return { data: employees, error: null }
  } catch (error) {
    console.error('Unexpected error in getEmployeesByClient:', error)
    return { data: null, error }
  }
}

/**
 * Get all active clients assigned to a specific employee
 * @param {string} employeeId - The employee ID (UUID)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getClientsByEmployee(employeeId) {
  try {
    const { data, error } = await supabase
      .from('employee_clients')
      .select(`
        id,
        employee_id,
        client_id,
        start_date,
        project_name,
        is_active,
        created_at,
        clients:client_id (
          id,
          name,
          industry,
          status,
          logo,
          description,
          employees_assigned,
          active_teams,
          contract_start,
          primary_contact,
          contact_email,
          contact_phone,
          contract_duration,
          annual_value
        )
      `)
      .eq('employee_id', employeeId)
      .eq('is_active', true)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Error fetching clients by employee:', error)
      return { data: null, error }
    }

    // Transform the data to flatten client details
    const clients = data.map(assignment => ({
      assignmentId: assignment.id,
      startDate: assignment.start_date,
      projectName: assignment.project_name,
      isActive: assignment.is_active,
      ...assignment.clients
    }))

    return { data: clients, error: null }
  } catch (error) {
    console.error('Unexpected error in getClientsByEmployee:', error)
    return { data: null, error }
  }
}

/**
 * Assign an employee to a client
 * @param {string} employeeId - The employee ID (UUID)
 * @param {number} clientId - The client ID (BIGINT)
 * @param {string} projectName - Name of the project/assignment
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function assignEmployeeToClient(employeeId, clientId, projectName, startDate) {
  try {
    // Validate inputs
    if (!employeeId || !clientId) {
      return {
        data: null,
        error: new Error('employeeId and clientId are required')
      }
    }

    // Check if an active assignment already exists
    const { data: existingAssignment, error: checkError } = await supabase
      .from('employee_clients')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      console.error('Error checking existing assignment:', checkError)
      return { data: null, error: checkError }
    }

    if (existingAssignment) {
      return {
        data: null,
        error: new Error('Employee is already actively assigned to this client')
      }
    }

    // Create the new assignment
    const { data, error } = await supabase
      .from('employee_clients')
      .insert({
        employee_id: employeeId,
        client_id: clientId,
        project_name: projectName || null,
        start_date: startDate || new Date().toISOString().split('T')[0],
        is_active: true,
        end_date: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error assigning employee to client:', error)
      return { data: null, error }
    }

    // Update the client's employee count
    await updateClientEmployeeCount(clientId)

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in assignEmployeeToClient:', error)
    return { data: null, error }
  }
}

/**
 * Remove an employee from a client (soft delete - sets is_active to false)
 * @param {string} employeeId - The employee ID (UUID)
 * @param {number} clientId - The client ID (BIGINT)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function removeEmployeeFromClient(employeeId, clientId) {
  try {
    // Validate inputs
    if (!employeeId || !clientId) {
      return {
        data: null,
        error: new Error('employeeId and clientId are required')
      }
    }

    // Find the active assignment
    const { data: assignment, error: findError } = await supabase
      .from('employee_clients')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .single()

    if (findError) {
      if (findError.code === 'PGRST116') {
        return {
          data: null,
          error: new Error('No active assignment found for this employee and client')
        }
      }
      console.error('Error finding assignment:', findError)
      return { data: null, error: findError }
    }

    // Update the assignment to inactive
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('employee_clients')
      .update({
        is_active: false,
        end_date: today
      })
      .eq('id', assignment.id)
      .select()
      .single()

    if (error) {
      console.error('Error removing employee from client:', error)
      return { data: null, error }
    }

    // Update the client's employee count
    await updateClientEmployeeCount(clientId)

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in removeEmployeeFromClient:', error)
    return { data: null, error }
  }
}

/**
 * Get complete assignment history for an employee (timeline)
 * @param {string} employeeId - The employee ID (UUID)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getEmployeeHistory(employeeId) {
  try {
    const { data, error } = await supabase
      .from('employee_clients')
      .select(`
        id,
        employee_id,
        client_id,
        start_date,
        end_date,
        project_name,
        is_active,
        created_at,
        clients:client_id (
          id,
          name,
          industry,
          status,
          logo,
          description,
          primary_contact,
          contact_email
        )
      `)
      .eq('employee_id', employeeId)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Error fetching employee history:', error)
      return { data: null, error }
    }

    // Transform and enrich the data
    const history = data.map(assignment => {
      const startDate = new Date(assignment.start_date)
      const endDate = assignment.end_date ? new Date(assignment.end_date) : new Date()
      
      // Calculate duration
      const durationMs = endDate - startDate
      const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24))
      
      let duration
      if (durationDays < 30) {
        duration = `${durationDays} day${durationDays !== 1 ? 's' : ''}`
      } else if (durationDays < 365) {
        const months = Math.floor(durationDays / 30)
        duration = `${months} month${months !== 1 ? 's' : ''}`
      } else {
        const years = Math.floor(durationDays / 365)
        const remainingMonths = Math.floor((durationDays % 365) / 30)
        duration = `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`
      }

      return {
        assignmentId: assignment.id,
        startDate: assignment.start_date,
        endDate: assignment.end_date,
        projectName: assignment.project_name,
        isActive: assignment.is_active,
        duration,
        durationDays,
        clientInfo: assignment.clients
      }
    })

    return { data: history, error: null }
  } catch (error) {
    console.error('Unexpected error in getEmployeeHistory:', error)
    return { data: null, error }
  }
}

/**
 * Update the employees_assigned count for a specific client
 * Counts all active assignments in the employee_clients table
 * @param {number} clientId - The client ID (BIGINT)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateClientEmployeeCount(clientId) {
  try {
    // Count active employees for this client
    const { count, error: countError } = await supabase
      .from('employee_clients')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('is_active', true)

    if (countError) {
      console.error('Error counting employees:', countError)
      return { data: null, error: countError }
    }

    // Update the client's employees_assigned field
    const { data, error } = await supabase
      .from('clients')
      .update({ employees_assigned: count || 0 })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Error updating client employee count:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in updateClientEmployeeCount:', error)
    return { data: null, error }
  }
}

/**
 * Get assignment details for a specific employee-client relationship
 * @param {string} employeeId - The employee ID (UUID)
 * @param {number} clientId - The client ID (BIGINT)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getAssignment(employeeId, clientId) {
  try {
    const { data, error } = await supabase
      .from('employee_clients')
      .select(`
        id,
        employee_id,
        client_id,
        start_date,
        end_date,
        project_name,
        is_active,
        created_at,
        employees:employee_id (
          id,
          name,
          location,
          hierarchy,
          profile_picture
        ),
        clients:client_id (
          id,
          name,
          industry,
          logo
        )
      `)
      .eq('employee_id', employeeId)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: new Error('No active assignment found') }
      }
      console.error('Error fetching assignment:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in getAssignment:', error)
    return { data: null, error }
  }
}

/**
 * Bulk update client employee counts for all clients
 * Useful for data synchronization
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function updateAllClientEmployeeCounts() {
  try {
    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')

    if (clientsError) {
      console.error('Error fetching clients:', clientsError)
      return { data: null, error: clientsError }
    }

    // Update each client
    const updates = []
    for (const client of clients) {
      const result = await updateClientEmployeeCount(client.id)
      updates.push({
        clientId: client.id,
        success: !result.error,
        error: result.error
      })
    }

    const failedUpdates = updates.filter(u => !u.success)
    if (failedUpdates.length > 0) {
      console.warn('Some updates failed:', failedUpdates)
    }

    return { 
      data: {
        totalClients: clients.length,
        successful: updates.filter(u => u.success).length,
        failed: failedUpdates.length,
        details: updates
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Unexpected error in updateAllClientEmployeeCounts:', error)
    return { data: null, error }
  }
}

/**
 * Get statistics about employee-client assignments
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getAssignmentStats() {
  try {
    // Get total active assignments
    const { count: activeCount, error: activeError } = await supabase
      .from('employee_clients')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (activeError) {
      return { data: null, error: activeError }
    }

    // Get total assignments (including inactive)
    const { count: totalCount, error: totalError } = await supabase
      .from('employee_clients')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      return { data: null, error: totalError }
    }

    // Get unique employees with active assignments
    const { data: activeEmployees, error: employeesError } = await supabase
      .from('employee_clients')
      .select('employee_id')
      .eq('is_active', true)

    if (employeesError) {
      return { data: null, error: employeesError }
    }

    const uniqueEmployees = new Set(activeEmployees.map(a => a.employee_id)).size

    // Get unique clients with active assignments
    const { data: activeClients, error: clientsError } = await supabase
      .from('employee_clients')
      .select('client_id')
      .eq('is_active', true)

    if (clientsError) {
      return { data: null, error: clientsError }
    }

    const uniqueClients = new Set(activeClients.map(a => a.client_id)).size

    return {
      data: {
        activeAssignments: activeCount,
        totalAssignments: totalCount,
        inactiveAssignments: totalCount - activeCount,
        employeesWithActiveAssignments: uniqueEmployees,
        clientsWithActiveAssignments: uniqueClients
      },
      error: null
    }
  } catch (error) {
    console.error('Unexpected error in getAssignmentStats:', error)
    return { data: null, error }
  }
}

