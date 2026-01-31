// GET /api/auth/user - Get current authenticated user

import { NextResponse } from 'next/server'
import { supabase } from '../../../../utils/supabase-server'

export async function GET(request) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return NextResponse.json(
        { error: 'Not authenticated', details: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

