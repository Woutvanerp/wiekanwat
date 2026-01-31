/**
 * Script to check if Wout van Erp exists and get his ID
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

async function checkWout() {
  try {
    // Search for Wout van Erp
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%Wout%')
    
    if (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
    
    if (!data || data.length === 0) {
      console.log('❌ Wout van Erp not found in database')
      console.log('\nLet me check all employees...')
      
      const { data: allEmployees, error: allError } = await supabase
        .from('employees')
        .select('*')
      
      if (allError) {
        console.error('Error fetching all employees:', allError.message)
      } else {
        console.log(`\nFound ${allEmployees.length} employees:`)
        allEmployees.forEach(emp => {
          console.log(`- ${emp.name} (ID: ${emp.id})`)
        })
      }
    } else {
      console.log(`✅ Found ${data.length} employee(s) matching "Wout":`)
      data.forEach(emp => {
        console.log(`\nName: ${emp.name}`)
        console.log(`ID: ${emp.id}`)
        console.log(`Location: ${emp.location}`)
        console.log(`Hierarchy: ${emp.hierarchy}`)
        console.log(`Profile URL: http://localhost:3000/employee/${emp.id}`)
      })
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

checkWout()




