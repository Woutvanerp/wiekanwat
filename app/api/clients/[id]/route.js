// GET /api/clients/[id] - Returns a specific client
// PUT /api/clients/[id] - Updates a client
// DELETE /api/clients/[id] - Deletes a client

import { NextResponse } from 'next/server'
import { supabase } from '../../../../utils/supabase-server'

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

    // Prepare update data (only include fields that were provided)
    const updateData = {}
    
    // Handle all possible client fields
    if (body.name !== undefined) {
      updateData.name = body.name.trim()
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description.trim()
    }
    
    if (body.logo !== undefined) {
      updateData.logo = body.logo.trim()
    }
    
    if (body.industry !== undefined) {
      updateData.industry = body.industry
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status
    }
    
    if (body.primary_contact !== undefined) {
      updateData.primary_contact = body.primary_contact.trim()
    }
    
    if (body.contact_email !== undefined) {
      updateData.contact_email = body.contact_email.trim()
    }
    
    if (body.contact_phone !== undefined) {
      updateData.contact_phone = body.contact_phone.trim()
    }
    
    if (body.contract_start !== undefined) {
      updateData.contract_start = body.contract_start
    }
    
    if (body.contract_duration !== undefined) {
      updateData.contract_duration = body.contract_duration.trim()
    }
    
    if (body.annual_value !== undefined) {
      updateData.annual_value = body.annual_value.trim()
    }
    
    if (body.requested_positions !== undefined) {
      if (!Array.isArray(body.requested_positions)) {
        return NextResponse.json(
          { error: 'Validation error', details: 'requested_positions must be an array' },
          { status: 400 }
        )
      }
      updateData.requested_positions = body.requested_positions
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


