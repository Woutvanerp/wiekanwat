// Example API Route with PostHog tracking (App Router format)
// This is for reference - showing how to use PostHog in your API routes

import { NextResponse } from 'next/server'
import { captureServerEvent } from '../../../utils/posthog-server'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Your API logic here
    // ...
    
    // Track the event
    await captureServerEvent(
      'distinct_id_of_the_user', // Use actual user ID from session
      'event_name',
      {
        // Add any properties you want to track
        timestamp: new Date().toISOString(),
        ...body
      }
    )
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

