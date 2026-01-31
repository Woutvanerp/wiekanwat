import './globals.css'
import Navigation from '../components/Navigation'
import { AuthProvider } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  title: 'Sparke & Keane - Employee Information Board',
  description: 'Internal consultancy employee tracking application',
  // Force rebuild
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProtectedRoute>
            <Navigation />
            {children}
          </ProtectedRoute>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}




