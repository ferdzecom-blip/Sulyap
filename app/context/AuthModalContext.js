'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import AuthModal from '../components/AuthModal'

const Ctx = createContext(null)

export function AuthModalProvider({ children }) {
  const [open, setOpen] = useState(false)
  const openAuthModal = useCallback(() => setOpen(true), [])
  const closeAuthModal = useCallback(() => setOpen(false), [])
  return (<Ctx.Provider value={{ openAuthModal, closeAuthModal }}>
    {children}
    {open && <AuthModal onClose={closeAuthModal} onSuccess={closeAuthModal} />}
  </Ctx.Provider>)
}

export function useAuthModal() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuthModal must be used inside <AuthModalProvider>')
  return ctx
}
