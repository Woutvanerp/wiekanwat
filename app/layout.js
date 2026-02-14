import './globals.css'
import Navigation from '../components/Navigation'
import { AuthProvider } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PHProvider, PostHogPageView } from './providers'
import { Suspense } from 'react'

export const metadata = {
  title: 'Sparke & Keane - Employee Information Board',
  description: 'Internal consultancy employee tracking application',
  // Force rebuild
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PHProvider>
          <AuthProvider>
            <ProtectedRoute>
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <Navigation />
              {children}
            </ProtectedRoute>
          </AuthProvider>
          <SpeedInsights />
        </PHProvider>
      </body>
    </html>
  )
}




