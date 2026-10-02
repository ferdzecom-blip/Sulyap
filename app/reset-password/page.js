'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function PasswordField({ id, value, onChange, placeholder, minLength }) {
  const [show, setShow] = useState(false)
  return (<div className="pwd-wrap">
    <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} minLength={minLength} required />
    <button type="button" className="pwd-toggle" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} title={show ? 'Hide password' : 'Show password'}>
      {show ? '🙈' : '👁'}
    </button>
  </div>)
}

export default function ResetPassword() {
  const r = useRouter()
  const [p1, setP1] = useState(''); const [p2, setP2] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)

  async function go(e) {
    e.preventDefault(); setMsg('')
    if (p1.length < 6) return setMsg('Password must be 6+ characters.')
    if (p1 !== p2) return setMsg('Passwords do not match.')
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: p1 })
    setBusy(false)
    if (error) return setMsg(error.message + ' — the reset link may have expired. Request a new one from the login page.')
    r.push('/')
  }

  return (<form className="box" onSubmit={go}>
    <h2 style={{ margin: '0 0 14px' }}>Set a new password</h2>
    <div className="f"><label>New password (6+ characters)</label><PasswordField id="np1" value={p1} onChange={e => setP1(e.target.value)} minLength={6} /></div>
    <div className="f"><label>Confirm new password</label><PasswordField id="np2" value={p2} onChange={e => setP2(e.target.value)} minLength={6} /></div>
    {msg && <p className="notice" style={{ color: '#ff8a7a' }}>{msg}</p>}
    <button className="b p" style={{ width: '100%' }} disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
  </form>)
}
