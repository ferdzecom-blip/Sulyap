import './globals.css'
import Nav from '../components/Nav'
import PageTransition from '../components/PageTransition'
import { AuthModalProvider } from '../context/AuthModalContext'
export const metadata = { title: 'Sulyap' }

// Runs before first paint: restores the saved theme (default dark) so the page
// never flashes the wrong colors when it loads.
const themeScript = `try{var t=localStorage.getItem('sy-theme');document.documentElement.dataset.theme=(t==='light')?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`

export default function Root({ children }) {
  return (<html lang="en" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    <body>
      <AuthModalProvider>
        <Nav />
        <main><PageTransition>{children}</PageTransition></main>
      </AuthModalProvider>
    </body>
  </html>)
}
