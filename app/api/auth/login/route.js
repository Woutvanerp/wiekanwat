// POST /api/auth/login - Login with email and password
// POST /api/auth/logout - Logout current user
// GET /api/auth/user - Get current user

import { NextResponse } from 'next/server'
import { supabase } from '../../../utils/supabase-server'

/**
 * POST /api/auth/login
 * Login with email and password
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        { error: 'Invalid credentials', details: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({ 
      user: data.user,
      session: data.session
    }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

