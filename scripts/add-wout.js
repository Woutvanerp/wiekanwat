/**
 * Script to add Wout van Erp to the database
 * Run with: node scripts/add-wout.js
 * 
 * Note: This script requires the Next.js server to be running
 * or you can use it as a one-time API call
 */

const employeeData = {
  name: 'Wout van Erp',
  location: 'Eindhoven', // or 'Maastricht' - update as needed
  hierarchy: 'Consultant', // Update to appropriate level: Boss, Managing Director, Managing Consultant, Principal Consultant, Senior Consultant, Consultant, Werkstudent
  skills: ['React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js'], // Update with actual skills
  current_client: null, // Set to client name if assigned, or null if available
  cv: `Experienced frontend engineer with expertise in React and Next.js. 
Passionate about building modern, user-friendly web applications.
Skilled in JavaScript, TypeScript, and full-stack development.` // Update with actual CV summary
}

// For direct Supabase usage (if running as standalone script)
async function addWoutDirectly() {
  const { createClient } = require('@supabase/supabase-js')
  
  // Try to load .env.local manually
  try {
    const fs = require('fs')
    const path = require('path')
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
  } catch (err) {
    // Ignore if can't read .env.local
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables in .env.local')
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding Wout van Erp:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Successfully added Wout van Erp to the database!')
    console.log('Employee ID:', data.id)
    console.log('Profile URL:', `http://localhost:3000/employee/${data.id}`)
    console.log('\nEmployee details:')
    console.log(JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

// Check if running directly
if (require.main === module) {
  addWoutDirectly()
}

module.exports = { employeeData, addWoutDirectly }

