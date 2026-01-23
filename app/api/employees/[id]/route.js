// GET /api/employees/[id] - Returns a single employee by ID
// PUT /api/employees/[id] - Updates an employee by ID
// DELETE /api/employees/[id] - Deletes an employee by ID

import { NextResponse } from 'next/server'
import { supabase } from '../../../../utils/supabase'

/**
 * GET /api/employees/[id]
 * Fetches a single employee by ID from the Supabase database
 */
export async function GET(request, { params }) {
  try {
    const { id } = params

    // Validate UUID format (basic check)
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      // Check if employee not found
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        )
      }

      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employee', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/employees/[id]
 * Updates an existing employee in the Supabase database
 * All fields except id are optional (partial update)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, location, hierarchy, skills, current_client, cv, profile_picture, project_start_date } = body

    // Validate UUID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updateData = {}

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return NextResponse.json(
          { error: 'Validation error', details: 'Name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (location !== undefined) {
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
      updateData.location = location
    }

    if (hierarchy !== undefined) {
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
      updateData.hierarchy = hierarchy
    }

    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills) ? skills : []
    }

    if (current_client !== undefined) {
      updateData.current_client = current_client?.trim() || null
    }

    if (cv !== undefined) {
      updateData.cv = cv?.trim() || null
    }

    if (profile_picture !== undefined) {
      updateData.profile_picture = profile_picture?.trim() || null
    }

    if (project_start_date !== undefined) {
      updateData.project_start_date = project_start_date || null
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Validation error', details: 'No fields provided to update' },
        { status: 400 }
      )
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Check if employee not found
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        )
      }

      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update employee', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
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

/**
 * DELETE /api/employees/[id]
 * Deletes an employee from the Supabase database
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Validate UUID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      )
    }

    // First check if employee exists
    const { data: existingEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete employee', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Employee deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

