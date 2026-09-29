import './globals.css'
import Nav from '../components/Nav'
export const metadata = { title: 'Sulyap' }
export default function Root({ children }) { return (<html lang="en"><body><Nav /><main>{children}</main></body></html>) }
