'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    // Only redirect if we're done loading, there's no user, and we're not on a public route
    if (!loading && !user && !isPublicRoute) {
      console.log('Not authenticated, redirecting to login from:', pathname)
      setShouldRedirect(true)
      router.push('/login')
    }
  }, [user, loading, router, pathname, isPublicRoute])

  // Show loading state only for protected routes
  if (loading && !isPublicRoute) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#667eea'
      }}>
        Loading...
      </div>
    )
  }

  // If not logged in and not on a public route, show nothing while redirecting
  if (!user && !isPublicRoute && shouldRedirect) {
    return null
  }

  return <>{children}</>
}

