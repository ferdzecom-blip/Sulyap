'use client'
import { usePathname } from 'next/navigation'

// Remounting a div keyed by the current path forces its CSS animation
// (.page-enter, defined in globals.css) to replay on every navigation,
// giving the whole app a subtle fade/rise-in page transition.
export default function PageTransition({ children }) {
  const pathname = usePathname()
  return <div key={pathname} className="page-enter">{children}</div>
}
