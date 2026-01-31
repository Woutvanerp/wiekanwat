#!/usr/bin/env node

/**
 * Script to add example clients to the database
 * Run with: node scripts/add-example-clients.js
 */

const API_BASE = 'http://localhost:3000/api/clients'

const exampleClients = [
  {
    name: 'ASML',
    description: 'Semiconductor manufacturing technology - Advanced lithography systems',
    requestedPositions: [
      { hierarchy: 'Senior Consultant', count: 2 },
      { hierarchy: 'Consultant', count: 3 },
      { hierarchy: 'Werkstudent', count: 1 }
    ]
  },
  {
    name: 'Philips',
    description: 'Healthcare and consumer electronics - Medical imaging and patient monitoring',
    requestedPositions: [
      { hierarchy: 'Principal Consultant', count: 1 },
      { hierarchy: 'Senior Consultant', count: 2 }
    ]
  },
  {
    name: 'VDL',
    description: 'High-tech systems and equipment - Industrial automation',
    requestedPositions: [
      { hierarchy: 'Managing Consultant', count: 1 },
      { hierarchy: 'Senior Consultant', count: 1 },
      { hierarchy: 'Consultant', count: 2 }
    ]
  },
  {
    name: 'DAF Trucks',
    description: 'Commercial vehicle manufacturing - Truck design and engineering',
    requestedPositions: [
      { hierarchy: 'Principal Consultant', count: 1 },
      { hierarchy: 'Consultant', count: 2 }
    ]
  },
  {
    name: 'Thales',
    description: 'Defense and security systems - Advanced radar technology',
    requestedPositions: [
      { hierarchy: 'Managing Consultant', count: 1 },
      { hierarchy: 'Principal Consultant', count: 1 },
      { hierarchy: 'Senior Consultant', count: 3 }
    ]
  }
]

async function addClient(clientData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // If client already exists, that's okay - just skip it
      if (response.status === 409) {
        console.log(`⏭️  Client "${clientData.name}" already exists, skipping...`)
        return { skipped: true }
      }
      
      throw new Error(errorData.details || `Failed to create client: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log(`✅ Successfully added client: ${clientData.name}`)
    return result.data
  } catch (error) {
    console.error(`❌ Error adding client "${clientData.name}":`, error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Adding example clients to the database...\n')
  console.log('Make sure:')
  console.log('  1. Your Next.js dev server is running (npm run dev)')
  console.log('  2. You have run the create-clients-table.sql script in Supabase')
  console.log('  3. Your Supabase environment variables are configured\n')
  
  let successCount = 0
  let skipCount = 0
  let errorCount = 0
  
  for (const client of exampleClients) {
    try {
      const result = await addClient(client)
      if (result && result.skipped) {
        skipCount++
      } else {
        successCount++
      }
    } catch (error) {
      errorCount++
    }
  }
  
  console.log('\n📊 Summary:')
  console.log(`   ✅ Successfully added: ${successCount}`)
  console.log(`   ⏭️  Skipped (already exist): ${skipCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some clients could not be added. Check the errors above.')
    process.exit(1)
  } else {
    console.log('\n🎉 All example clients have been processed!')
    console.log('   Visit http://localhost:3000/clients to see them.')
  }
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error)
  process.exit(1)
})


