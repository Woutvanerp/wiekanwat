// GET /api/clients - Returns all clients with their requested positions
// POST /api/clients - Creates a new client

import { NextResponse } from 'next/server'
import { supabase } from '../../../utils/supabase'

/**
 * GET /api/clients
 * Fetches all clients from the Supabase database with their position requests
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

    // Query Supabase
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: error.message },
        { status: 500 }
      )
    }

    // Ensure data is always an array
    const clients = Array.isArray(data) ? data : []
    return NextResponse.json({ data: clients, count: clients.length }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clients
 * Creates a new client in the Supabase database
 * Required fields: name
 * Optional fields: description, requested_positions (array)
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, requested_positions } = body

    // Input validation: check required fields
    if (!name) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: 'Missing required field: name is required'
        },
        { status: 400 }
      )
    }

    // Validate requested_positions format if provided
    if (requested_positions && !Array.isArray(requested_positions)) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: 'requested_positions must be an array'
        },
        { status: 400 }
      )
    }

    // Prepare client data
    const clientData = {
      name: name.trim(),
      description: description?.trim() || '',
      requested_positions: Array.isArray(requested_positions) ? requested_positions : []
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Client already exists', details: 'A client with this name already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create client', details: error.message },
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


