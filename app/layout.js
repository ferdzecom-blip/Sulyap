import './globals.css'
import Nav from '../components/Nav'
import { AuthModalProvider } from '../context/AuthModalContext'
export const metadata = { title: 'Sulyap' }
export default function Root({ children }) {
  return (<html lang="en"><body>
    <AuthModalProvider>
      <Nav />
      <main>{children}</main>
    </AuthModalProvider>
  </body></html>)
}
