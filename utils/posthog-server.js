import { PostHog } from 'posthog-node'

// Create a singleton PostHog client for server-side tracking
let posthogClient = null

export function getPostHogClient() {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    })
  }
  return posthogClient
}

// Helper function to capture events with automatic shutdown
export async function captureServerEvent(distinctId, event, properties = {}) {
  const posthog = getPostHogClient()
  
  posthog.capture({
    distinctId,
    event,
    properties,
  })
  
  // Flush events to ensure they're sent
  await posthog.shutdown()
}

