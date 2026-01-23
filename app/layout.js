import './globals.css'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'Sparke & Keane - Employee Information Board',
  description: 'Internal consultancy employee tracking application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}




