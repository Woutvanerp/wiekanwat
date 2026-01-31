/**
 * Example script to update an employee with profile picture and start date
 * Run with: node scripts/update-employee-example.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateEmployee() {
  try {
    // Example: Update Wout van Erp
    // Replace with actual employee ID and data
    
    const employeeId = '7be87116-fae3-4d41-9f06-a1cefb322990' // Wout van Erp's ID
    
    const updates = {
      profile_picture: 'https://i.pravatar.cc/150?img=1', // Example placeholder image
      project_start_date: '2024-01-15' // Format: YYYY-MM-DD
    }
    
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating employee:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Successfully updated employee!')
    console.log('Employee:', data.name)
    console.log('Profile Picture:', data.profile_picture)
    console.log('Project Start Date:', data.project_start_date)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

// Uncomment to run
// updateEmployee()

module.exports = { updateEmployee }




