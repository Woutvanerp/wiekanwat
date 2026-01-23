// GET /api/employees - Returns all employees
// POST /api/employees - Creates a new employee

import { NextResponse } from 'next/server'
import { supabase } from '../../../utils/supabase'

/**
 * GET /api/employees
 * Fetches all employees from the Supabase database
 */
export async function GET() {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase client not initialized')
      return NextResponse.json(
        { error: 'Database not configured', details: 'Supabase client not initialized' },
        { status: 500 }
      )
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Database not configured', details: 'Missing Supabase environment variables' },
        { status: 500 }
      )
    }

    // Query Supabase with timeout protection
    const queryPromise = supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true })

    // Add a timeout to prevent hanging (10 seconds)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database request timed out after 10 seconds')), 10000)
    )

    let result
    try {
      result = await Promise.race([queryPromise, timeoutPromise])
    } catch (timeoutError) {
      if (timeoutError.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout', details: 'The database request took too long. Please check your Supabase connection.' },
          { status: 504 }
        )
      }
      throw timeoutError
    }

    const { data, error } = result

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employees', details: error.message },
        { status: 500 }
      )
    }

    // Ensure data is always an array
    const employees = Array.isArray(data) ? data : []
    return NextResponse.json({ data: employees, count: employees.length }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/employees
 * Creates a new employee in the Supabase database
 * Required fields: name, location, hierarchy
 * Optional fields: skills (array), current_client, cv
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, location, hierarchy, skills, current_client, cv, profile_picture, project_start_date } = body

    // Input validation: check required fields
    if (!name || !location || !hierarchy) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: 'Missing required fields: name, location, and hierarchy are required'
        },
        { status: 400 }
      )
    }

    // Validate location value
    const validLocations = ['Eindhoven', 'Maastricht']
    if (!validLocations.includes(location)) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: `Invalid location. Must be one of: ${validLocations.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Validate hierarchy value
    const validHierarchies = [
      'Boss',
      'Managing Director',
      'Managing Consultant',
      'Principal Consultant',
      'Senior Consultant',
      'Consultant',
      'Werkstudent'
    ]
    if (!validHierarchies.includes(hierarchy)) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: `Invalid hierarchy. Must be one of: ${validHierarchies.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Prepare employee data
    const employeeData = {
      name: name.trim(),
      location,
      hierarchy,
      skills: Array.isArray(skills) ? skills : [],
      current_client: current_client?.trim() || null,
      cv: cv?.trim() || null,
      profile_picture: profile_picture?.trim() || null,
      project_start_date: project_start_date || null
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create employee', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

