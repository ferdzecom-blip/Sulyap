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

export default function Login() {
  const r = useRouter()
  const [mode, setMode] = useState('login') // login | reg | forgot
  const [v, setV] = useState({}); const [msg, setMsg] = useState(''); const [ok, setOk] = useState(''); const [busy, setBusy] = useState(false)
  const set = k => e => setV({ ...v, [k]: e.target.value })

  async function resolveEmail(identifier) {
    const id = (identifier || '').trim()
    if (id.includes('@')) return id
    const { data, error } = await supabase.rpc('email_for_username', { u: id.toLowerCase() })
    if (error || !data) return null
    return data
  }

  async function go(e) {
    e.preventDefault(); setMsg(''); setOk(''); setBusy(true)
    try {
      if (mode === 'reg') {
        if (!/^\w{3,20}$/.test(v.username || '')) return setMsg('Username: 3–20 letters, numbers or _.')
        if (!v.name) return setMsg('Enter your full name.')
        if (!/^\S+@\S+\.\S+$/.test(v.email || '')) return setMsg('Enter a valid email — you\'ll need it to reset your password later.')
        const { data, error } = await supabase.auth.signUp({ email: v.email, password: v.password, options: { data: { username: v.username.toLowerCase(), full_name: v.name } } })
        if (error) return setMsg(error.message)
        if (!data.session) return setOk('Check your email to confirm your account, then log in.')
        r.push('/'); return
      }
      if (mode === 'forgot') {
        const email = await resolveEmail(v.identifier)
        if (!email) return setMsg('No account found with that username or email.')
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
        if (error) return setMsg(error.message)
        setOk('If that account exists, a password reset link was sent to its email.'); return
      }
      // login
      const email = await resolveEmail(v.identifier)
      if (!email) return setMsg('Incorrect username/email or password.')
      const { error } = await supabase.auth.signInWithPassword({ email, password: v.password })
      if (error) return setMsg('Incorrect username/email or password.')
      r.push('/')
    } finally { setBusy(false) }
  }

  return (<form className="box" onSubmit={go}>
    <div className="row">
      <button type="button" className={`b ${mode === 'login' ? 'p' : ''}`} style={{ flex: 1 }} onClick={() => { setMode('login'); setMsg(''); setOk('') }}>Log in</button>
      <button type="button" className={`b ${mode === 'reg' ? 'p' : ''}`} style={{ flex: 1 }} onClick={() => { setMode('reg'); setMsg(''); setOk('') }}>Create account</button>
    </div><br />

    {mode === 'reg' && <>
      <div className="f"><label>Username</label><input onChange={set('username')} required /></div>
      <div className="f"><label>Full name</label><input onChange={set('name')} required /></div>
      <div className="f"><label>Email</label><input type="email" onChange={set('email')} required /></div>
      <div className="f"><label>Password (6+ characters)</label><PasswordField id="p1" value={v.password || ''} onChange={set('password')} minLength={6} /></div>
    </>}

    {mode === 'login' && <>
      <div className="f"><label>Username or email</label><input onChange={set('identifier')} required /></div>
      <div className="f"><label>Password</label><PasswordField id="p2" value={v.password || ''} onChange={set('password')} /></div>
      <button type="button" className="linkbtn" onClick={() => { setMode('forgot'); setMsg(''); setOk('') }}>Forgot password?</button><br /><br />
    </>}

    {mode === 'forgot' && <>
      <p className="mu" style={{ marginTop: 0 }}>Enter your username or email and we'll send a reset link to the email on your account.</p>
      <div className="f"><label>Username or email</label><input onChange={set('identifier')} required /></div>
    </>}

    {msg && <p className="notice" style={{ color: '#ff8a7a' }}>{msg}</p>}
    {ok && <p className="notice" style={{ color: '#4C8C7D' }}>{ok}</p>}

    <button className="b p" style={{ width: '100%' }} disabled={busy}>
      {busy ? 'Please wait…' : mode === 'reg' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Log in'}
    </button>

    {mode === 'forgot' && <button type="button" className="linkbtn" style={{ marginTop: 10 }} onClick={() => { setMode('login'); setMsg(''); setOk('') }}>← Back to log in</button>}
  </form>)
}
