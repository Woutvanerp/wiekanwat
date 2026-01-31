// GET /api/clients/[id] - Returns a specific client
// PUT /api/clients/[id] - Updates a client
// DELETE /api/clients/[id] - Deletes a client

import { NextResponse } from 'next/server'
import { supabase } from '../../../../utils/supabase'

/**
 * GET /api/clients/[id]
 * Fetches a specific client by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
      
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch client', details: error.message },
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
 * PUT /api/clients/[id]
 * Updates a client by ID
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description, requested_positions } = body

    // Prepare update data (only include fields that were provided)
    const updateData = {}
    
    if (name !== undefined) {
      updateData.name = name.trim()
    }
    
    if (description !== undefined) {
      updateData.description = description.trim()
    }
    
    if (requested_positions !== undefined) {
      if (!Array.isArray(requested_positions)) {
        return NextResponse.json(
          { error: 'Validation error', details: 'requested_positions must be an array' },
          { status: 400 }
        )
      }
      updateData.requested_positions = requested_positions
    }

    updateData.updated_at = new Date().toISOString()

    // Update in Supabase
    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
      
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update client', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    
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
 * DELETE /api/clients/[id]
 * Deletes a client by ID
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete client', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


