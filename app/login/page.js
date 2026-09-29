'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
export default function Login() {
  const r = useRouter(); const [reg, setReg] = useState(false); const [v, setV] = useState({}); const [msg, setMsg] = useState('')
  const set = k => e => setV({ ...v, [k]: e.target.value })
  async function go(e) {
    e.preventDefault(); setMsg('')
    if (reg) {
      if (!/^\w{3,20}$/.test(v.username || '')) return setMsg('Username: 3–20 letters, numbers or _.')
      const { data, error } = await supabase.auth.signUp({ email: v.email, password: v.password, options: { data: { username: v.username, full_name: v.name } } })
      if (error) return setMsg(error.message)
      if (!data.session) return setMsg('Check your email to confirm your account, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password })
      if (error) return setMsg(error.message)
    }
    r.push('/')
  }
  return (<form className="box" onSubmit={go}><div className="row"><button type="button" className={`b ${reg ? '' : 'p'}`} onClick={() => setReg(false)}>Log in</button>
    <button type="button" className={`b ${reg ? 'p' : ''}`} onClick={() => setReg(true)}>Create account</button></div><br />
    {reg && <><div className="f"><label>Username</label><input onChange={set('username')} required /></div><div className="f"><label>Full name</label><input onChange={set('name')} required /></div></>}
    <div className="f"><label>Email</label><input type="email" onChange={set('email')} required /></div>
    <div className="f"><label>Password (8+ characters)</label><input type="password" minLength={8} onChange={set('password')} required /></div>
    {msg && <p style={{ color: '#ff8a7a' }}>{msg}</p>}<button className="b p" style={{ width: '100%' }}>{reg ? 'Create account' : 'Log in'}</button></form>)
}
