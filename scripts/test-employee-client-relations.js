/**
 * Test script for employee-client relationship utilities
 * Run this script to test the many-to-many relationship functions
 * 
 * Usage: node scripts/test-employee-client-relations.js
 */

import {
  getEmployeesByClient,
  getClientsByEmployee,
  assignEmployeeToClient,
  removeEmployeeFromClient,
  getEmployeeHistory,
  updateClientEmployeeCount,
  getAssignment,
  updateAllClientEmployeeCounts,
  getAssignmentStats
} from '../utils/employeeClientRelations.js'

// Example employee and client IDs (replace with real IDs from your database)
const EXAMPLE_EMPLOYEE_ID = 'your-employee-uuid-here'
const EXAMPLE_CLIENT_ID = 1 // or your client BIGINT ID

/**
 * Test getting employees by client
 */
async function testGetEmployeesByClient() {
  console.log('\n--- Testing getEmployeesByClient ---')
  const { data, error } = await getEmployeesByClient(EXAMPLE_CLIENT_ID)
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log(`Found ${data.length} active employees for client ${EXAMPLE_CLIENT_ID}`)
    console.log('Employees:', JSON.stringify(data, null, 2))
  }
}

/**
 * Test getting clients by employee
 */
async function testGetClientsByEmployee() {
  console.log('\n--- Testing getClientsByEmployee ---')
  const { data, error } = await getClientsByEmployee(EXAMPLE_EMPLOYEE_ID)
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log(`Found ${data.length} active clients for employee ${EXAMPLE_EMPLOYEE_ID}`)
    console.log('Clients:', JSON.stringify(data, null, 2))
  }
}

/**
 * Test assigning employee to client
 */
async function testAssignEmployeeToClient() {
  console.log('\n--- Testing assignEmployeeToClient ---')
  const { data, error } = await assignEmployeeToClient(
    EXAMPLE_EMPLOYEE_ID,
    EXAMPLE_CLIENT_ID,
    'Digital Transformation Project',
    '2024-01-15'
  )
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Assignment created successfully!')
    console.log('Assignment:', JSON.stringify(data, null, 2))
  }
}

/**
 * Test removing employee from client
 */
async function testRemoveEmployeeFromClient() {
  console.log('\n--- Testing removeEmployeeFromClient ---')
  const { data, error } = await removeEmployeeFromClient(
    EXAMPLE_EMPLOYEE_ID,
    EXAMPLE_CLIENT_ID
  )
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Employee removed from client successfully!')
    console.log('Updated assignment:', JSON.stringify(data, null, 2))
  }
}

/**
 * Test getting employee history
 */
async function testGetEmployeeHistory() {
  console.log('\n--- Testing getEmployeeHistory ---')
  const { data, error } = await getEmployeeHistory(EXAMPLE_EMPLOYEE_ID)
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log(`Found ${data.length} assignments in history`)
    data.forEach((assignment, index) => {
      console.log(`\n${index + 1}. ${assignment.clientInfo.name}`)
      console.log(`   Project: ${assignment.projectName || 'N/A'}`)
      console.log(`   Duration: ${assignment.duration}`)
      console.log(`   Status: ${assignment.isActive ? 'Active' : 'Completed'}`)
      console.log(`   Dates: ${assignment.startDate} to ${assignment.endDate || 'Present'}`)
    })
  }
}

/**
 * Test updating client employee count
 */
async function testUpdateClientEmployeeCount() {
  console.log('\n--- Testing updateClientEmployeeCount ---')
  const { data, error } = await updateClientEmployeeCount(EXAMPLE_CLIENT_ID)
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Client employee count updated successfully!')
    console.log('Updated client:', JSON.stringify(data, null, 2))
  }
}

/**
 * Test getting specific assignment
 */
async function testGetAssignment() {
  console.log('\n--- Testing getAssignment ---')
  const { data, error } = await getAssignment(EXAMPLE_EMPLOYEE_ID, EXAMPLE_CLIENT_ID)
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Assignment found!')
    console.log('Details:', JSON.stringify(data, null, 2))
  }
}

/**
 * Test updating all client employee counts
 */
async function testUpdateAllClientEmployeeCounts() {
  console.log('\n--- Testing updateAllClientEmployeeCounts ---')
  const { data, error } = await updateAllClientEmployeeCounts()
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Bulk update completed!')
    console.log(`Total clients: ${data.totalClients}`)
    console.log(`Successful updates: ${data.successful}`)
    console.log(`Failed updates: ${data.failed}`)
  }
}

/**
 * Test getting assignment statistics
 */
async function testGetAssignmentStats() {
  console.log('\n--- Testing getAssignmentStats ---')
  const { data, error } = await getAssignmentStats()
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Assignment Statistics:')
    console.log(`  Active Assignments: ${data.activeAssignments}`)
    console.log(`  Total Assignments: ${data.totalAssignments}`)
    console.log(`  Inactive Assignments: ${data.inactiveAssignments}`)
    console.log(`  Employees with Active Assignments: ${data.employeesWithActiveAssignments}`)
    console.log(`  Clients with Active Assignments: ${data.clientsWithActiveAssignments}`)
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('='.repeat(60))
  console.log('Employee-Client Relationship Utility Tests')
  console.log('='.repeat(60))
  
  try {
    // First, get statistics
    await testGetAssignmentStats()
    
    // Test read operations
    await testGetEmployeesByClient()
    await testGetClientsByEmployee()
    await testGetEmployeeHistory()
    await testGetAssignment()
    
    // Uncomment these to test write operations
    // WARNING: These will modify your database!
    
    // await testAssignEmployeeToClient()
    // await testRemoveEmployeeFromClient()
    // await testUpdateClientEmployeeCount()
    // await testUpdateAllClientEmployeeCounts()
    
    console.log('\n' + '='.repeat(60))
    console.log('Tests completed!')
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\nUnexpected error during tests:', error)
  }
}

// Run the tests
runAllTests()

/**
 * Example usage scenarios:
 * 
 * 1. Assign an employee to a new client project:
 * --------------------------------------------------
 * const result = await assignEmployeeToClient(
 *   'employee-uuid',
 *   1,
 *   'Mobile App Development',
 *   '2024-02-01'
 * )
 * 
 * 2. Get all employees working for a specific client:
 * --------------------------------------------------
 * const { data: employees } = await getEmployeesByClient(1)
 * console.log(`${data.length} employees assigned to this client`)
 * 
 * 3. View an employee's complete work history:
 * --------------------------------------------------
 * const { data: history } = await getEmployeeHistory('employee-uuid')
 * history.forEach(assignment => {
 *   console.log(`${assignment.clientInfo.name} - ${assignment.duration}`)
 * })
 * 
 * 4. Remove an employee from a client (end assignment):
 * --------------------------------------------------
 * await removeEmployeeFromClient('employee-uuid', 1)
 * 
 * 5. Sync all client employee counts with actual data:
 * --------------------------------------------------
 * await updateAllClientEmployeeCounts()
 * 
 * 6. Get system-wide statistics:
 * --------------------------------------------------
 * const { data: stats } = await getAssignmentStats()
 * console.log(`${stats.activeAssignments} active assignments`)
 */


