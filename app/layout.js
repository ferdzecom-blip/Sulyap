import './globals.css'
import Nav from '../components/Nav'
import PageTransition from '../components/PageTransition'
import { AuthModalProvider } from '../context/AuthModalContext'
export const metadata = { title: 'Sulyap' }
export default function Root({ children }) {
  return (<html lang="en"><body>
    <AuthModalProvider>
      <Nav />
      <main><PageTransition>{children}</PageTransition></main>
    </AuthModalProvider>
  </body></html>)
}
