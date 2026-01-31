import './globals.css'
import Navigation from '../components/Navigation'
import { AuthProvider } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

export const metadata = {
  title: 'Sparke & Keane - Employee Information Board',
  description: 'Internal consultancy employee tracking application',
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
      </body>
    </html>
  )
}




