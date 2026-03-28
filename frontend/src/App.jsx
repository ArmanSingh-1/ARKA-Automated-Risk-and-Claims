import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PWAInstallPrompt from './components/PWAInstallPrompt'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Loading — prevent flash
  if (session === undefined) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <PWAInstallPrompt />
      <Routes>
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!session ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={session ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
